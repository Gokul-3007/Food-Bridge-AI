import Handover from '../models/Handover.js';
import Pickup from '../models/Pickup.js';
import Donation from '../models/Donation.js';
import Organization from '../models/Organization.js';
import { generateHandoverCode, hashHandoverCode } from '../utils/security.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

export const initiateHandover = async (req, res, next) => {
  try {
    const { pickupId } = req.body;

    const pickup = await Pickup.findById(pickupId).populate('donation');
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    // Check if an unverified handover already exists
    let handover = await Handover.findOne({
      pickup: pickupId,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    const rawPin = generateHandoverCode();
    const codeHash = hashHandoverCode(rawPin);
    const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours validity

    if (!handover) {
      handover = await Handover.create({
        pickup: pickupId,
        donation: pickup.donation._id,
        recipientOrg: pickup.recipientOrg,
        verificationCodeHash: codeHash,
        expiresAt
      });
    } else {
      handover.verificationCodeHash = codeHash;
      handover.expiresAt = expiresAt;
      handover.attemptCount = 0;
      await handover.save();
    }

    // QR string payload
    const qrPayload = JSON.stringify({
      type: 'FOODBRIDGE_HANDOVER',
      pickupId: pickup._id.toString(),
      donationId: pickup.donation._id.toString(),
      pin: rawPin,
      expiresAt
    });

    await logAudit({
      action: 'HANDOVER_INITIATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Handover',
      entityId: handover._id.toString(),
      details: { pickupId, expiresAt }
    });

    res.json({
      success: true,
      message: 'Handover verification session initialized',
      handoverId: handover._id,
      expiresAt: handover.expiresAt,
      // The raw PIN is returned ONLY to the authorized recipient / generator to present for verification
      verificationPin: rawPin,
      qrData: qrPayload
    });
  } catch (error) {
    next(error);
  }
};

export const verifyHandoverCode = async (req, res, next) => {
  try {
    const { pickupId, verificationCode } = req.body;

    if (!pickupId || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Pickup ID and 6-digit verification code are required'
      });
    }

    const handover = await Handover.findOne({ pickup: pickupId });
    if (!handover) {
      return res.status(404).json({
        success: false,
        message: 'Handover record not found for this pickup'
      });
    }

    if (handover.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This handover has already been verified and closed. Verification codes cannot be reused.'
      });
    }

    if (new Date() > handover.expiresAt) {
      handover.isExpired = true;
      await handover.save();
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired. Please initiate a new handover session.'
      });
    }

    if (handover.attemptCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. For security, please generate a new handover code.'
      });
    }

    const providedHash = hashHandoverCode(verificationCode);

    if (providedHash !== handover.verificationCodeHash) {
      handover.attemptCount += 1;
      await handover.save();
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. Attempts remaining: ${5 - handover.attemptCount}`
      });
    }

    // Code matches!
    handover.isVerified = true;
    handover.verifiedAt = new Date();
    handover.verifiedBy = req.user._id;

    // Depending on who verified:
    if (req.user.role === 'provider') {
      handover.providerConfirmed = true;
      handover.providerConfirmedAt = new Date();
      handover.providerConfirmedBy = req.user._id;
    } else {
      handover.recipientConfirmed = true;
      handover.recipientConfirmedAt = new Date();
      handover.recipientConfirmedBy = req.user._id;
    }

    await handover.save();

    // Update pickup status
    const pickup = await Pickup.findById(pickupId).populate('donation');
    pickup.status = 'handover_verified';
    pickup.completedAt = new Date();
    pickup.history.push({
      status: 'handover_verified',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: 'Cryptographic code verified successfully'
    });
    await pickup.save();

    // Complete donation!
    await Donation.findByIdAndUpdate(pickup.donation._id, {
      status: 'completed'
    });

    // Reduce capacity used on recipient org
    await Organization.findByIdAndUpdate(pickup.recipientOrg, {
      $inc: { currentCapacityUsed: -pickup.donation.quantity }
    });

    await logAudit({
      action: 'HANDOVER_VERIFIED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Handover',
      entityId: handover._id.toString(),
      details: { pickupId, donationId: pickup.donation._id }
    });

    await createNotification({
      recipientOrg: pickup.recipientOrg,
      role: 'ngo',
      type: 'handover_completed',
      title: 'Handover Completed!',
      message: `Food handover for "${pickup.donation.title}" has been successfully verified. Thank you for rescuing surplus food!`,
      data: { pickupId: pickup._id }
    });

    await createNotification({
      recipientOrg: pickup.providerOrg,
      role: 'provider',
      type: 'handover_completed',
      title: 'Donation Completed!',
      message: `Food handover for "${pickup.donation.title}" was verified and completed successfully.`,
      data: { donationId: pickup.donation._id }
    });

    res.json({
      success: true,
      message: 'Handover verified and food donation completed successfully!',
      handover,
      pickup
    });
  } catch (error) {
    next(error);
  }
};

export const confirmHandoverDual = async (req, res, next) => {
  try {
    const handover = await Handover.findById(req.params.id).populate('donation').populate('pickup');
    if (!handover) {
      return res.status(404).json({ success: false, message: 'Handover not found' });
    }

    if (req.user.role === 'provider') {
      handover.providerConfirmed = true;
      handover.providerConfirmedAt = new Date();
      handover.providerConfirmedBy = req.user._id;
    } else if (req.user.role === 'ngo') {
      handover.recipientConfirmed = true;
      handover.recipientConfirmedAt = new Date();
      handover.recipientConfirmedBy = req.user._id;
    }

    await handover.save();

    res.json({
      success: true,
      message: 'Confirmation recorded',
      handover
    });
  } catch (error) {
    next(error);
  }
};
