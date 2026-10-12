import Match from '../models/Match.js';
import Donation from '../models/Donation.js';
import Organization from '../models/Organization.js';
import Pickup from '../models/Pickup.js';
import Handover from '../models/Handover.js';
import { generateHandoverCode, hashHandoverCode } from '../utils/security.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

export const getMatches = async (req, res, next) => {
  try {
    const orgId = req.user.organization ? req.user.organization._id : null;
    const { status } = req.query;

    const query = {};
    if (req.user.role === 'ngo' && orgId) {
      query.recipient = orgId;
    }
    if (status) query.status = status;

    const matches = await Match.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'donation',
        populate: { path: 'providerOrg', select: 'name address location contactPhone' }
      })
      .populate('recipient', 'name address location');

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    next(error);
  }
};

export const respondToMatch = async (req, res, next) => {
  try {
    const { action, declineReason } = req.body;
    const matchId = req.params.id;

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'accept' or 'decline'"
      });
    }

    const match = await Match.findById(matchId).populate('donation').populate('recipient');
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match record not found'
      });
    }

    const recipientOrg = req.user.organization;
    if (!recipientOrg || recipientOrg._id.toString() !== match.recipient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the designated recipient organization can respond to this match offer'
      });
    }

    if (match.status !== 'offered') {
      return res.status(400).json({
        success: false,
        message: `This match is already in '${match.status}' status`
      });
    }

    const donationId = match.donation._id;

    if (action === 'accept') {
      // ATOMIC CONCURRENCY CHECK:
      // Ensure only one recipient can accept the donation atomically
      const updatedDonation = await Donation.findOneAndUpdate(
        {
          _id: donationId,
          status: { $in: ['available', 'matching'] },
          collectionDeadline: { $gt: new Date() }
        },
        {
          $set: {
            status: 'accepted',
            acceptedBy: recipientOrg._id,
            currentMatch: match._id
          }
        },
        { new: true }
      );

      if (!updatedDonation) {
        // Another NGO took it or donation expired!
        match.status = 'expired';
        await match.save();

        return res.status(409).json({
          success: false,
          message: 'Conflict: This donation has already been accepted by another organization or its deadline has expired.'
        });
      }

      // 1. Update Match status
      match.status = 'accepted';
      match.respondedAt = new Date();
      await match.save();

      // 2. Expire other match offers for this donation
      await Match.updateMany(
        {
          donation: donationId,
          _id: { $ne: match._id },
          status: 'offered'
        },
        {
          $set: { status: 'expired' }
        }
      );

      // 3. Create Pickup Record
      const pickup = await Pickup.create({
        donation: donationId,
        providerOrg: updatedDonation.providerOrg,
        recipientOrg: recipientOrg._id,
        pickupAddress: updatedDonation.pickupAddress,
        destinationAddress: recipientOrg.address,
        status: 'accepted',
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000), // Default 1 hour from now
        collectionWindow: {
          start: new Date(),
          end: updatedDonation.collectionDeadline
        },
        instructions: updatedDonation.pickupInstructions || '',
        history: [
          {
            status: 'accepted',
            timestamp: new Date(),
            updatedBy: req.user._id,
            note: `Accepted by ${recipientOrg.name}`
          }
        ]
      });

      // 4. Generate Cryptographic 6-digit PIN and SHA-256 Hash for Handover
      const rawPin = generateHandoverCode();
      const codeHash = hashHandoverCode(rawPin);
      const codeExpiresAt = new Date(updatedDonation.collectionDeadline);

      await Handover.create({
        pickup: pickup._id,
        donation: donationId,
        recipientOrg: recipientOrg._id,
        verificationCodeHash: codeHash,
        expiresAt: codeExpiresAt
      });

      // 5. Update recipient capacity
      await Organization.findByIdAndUpdate(recipientOrg._id, {
        $inc: { currentCapacityUsed: updatedDonation.quantity }
      });

      // 6. Notify Food Provider
      await createNotification({
        recipientUser: updatedDonation.provider,
        recipientOrg: updatedDonation.providerOrg,
        role: 'provider',
        type: 'donation_accepted',
        title: `Donation Accepted: ${updatedDonation.title}`,
        message: `${recipientOrg.name} has accepted your surplus food donation. Pickup has been scheduled.`,
        data: { donationId: updatedDonation._id, pickupId: pickup._id }
      });

      // 7. Audit log
      await logAudit({
        action: 'DONATION_ACCEPTED',
        performedBy: req.user._id,
        performedByName: req.user.name,
        entityType: 'Donation',
        entityId: donationId.toString(),
        details: { recipientOrgId: recipientOrg._id, pickupId: pickup._id }
      });

      return res.json({
        success: true,
        message: 'Donation accepted successfully! Pickup and handover verification scheduled.',
        match,
        donation: updatedDonation,
        pickup,
        verificationPin: rawPin // Presented once to the recipient upon acceptance!
      });
    }

    if (action === 'decline') {
      // NGO Declines: Mark match as declined
      match.status = 'declined';
      match.respondedAt = new Date();
      match.declineReason = declineReason || 'Declined by recipient';
      await match.save();

      const donation = await Donation.findById(donationId);

      // Find next eligible recipient in matchQueue
      let nextRecipientFound = false;

      if (donation && donation.matchQueue && donation.matchQueue.length > 0) {
        // Update current recipient status in queue
        for (const queueItem of donation.matchQueue) {
          if (queueItem.recipient.toString() === recipientOrg._id.toString()) {
            queueItem.status = 'declined';
            queueItem.respondedAt = new Date();
            queueItem.declineReason = declineReason || 'Declined';
          }
        }

        // Look for next pending recipient
        for (const queueItem of donation.matchQueue) {
          if (queueItem.status === 'pending') {
            queueItem.status = 'offered';
            queueItem.offeredAt = new Date();

            const nextMatch = await Match.findOne({
              donation: donationId,
              recipient: queueItem.recipient
            });

            if (nextMatch) {
              nextMatch.status = 'offered';
              await nextMatch.save();
              donation.currentMatch = nextMatch._id;

              // Notify the next recipient!
              await createNotification({
                recipientOrg: queueItem.recipient,
                role: 'ngo',
                type: 'new_donation_offer',
                title: `Surplus Food Offer: ${donation.title}`,
                message: `${donation.quantity} ${donation.unit} available for immediate collection.`,
                data: { donationId: donation._id, matchId: nextMatch._id }
              });

              nextRecipientFound = true;
              break;
            }
          }
        }

        await donation.save();
      }

      // If no next recipient was found, alert provider & admin
      if (!nextRecipientFound && donation) {
        donation.status = 'available';
        await donation.save();

        await createNotification({
          recipientUser: donation.provider,
          recipientOrg: donation.providerOrg,
          role: 'provider',
          type: 'donation_declined',
          title: `Donation Offer Declined: ${donation.title}`,
          message: `${recipientOrg.name} was unable to accept your donation. The listing remains visible to other organizations and on the live map.`,
          data: { donationId: donation._id }
        });
      }

      await logAudit({
        action: 'MATCH_DECLINED',
        performedBy: req.user._id,
        performedByName: req.user.name,
        entityType: 'Match',
        entityId: match._id.toString(),
        details: { declineReason, nextRecipientFound }
      });

      return res.json({
        success: true,
        message: 'Offer declined. Donation has been re-routed to next eligible recipient.',
        match,
        nextRecipientOffered: nextRecipientFound
      });
    }
  } catch (error) {
    next(error);
  }
};
