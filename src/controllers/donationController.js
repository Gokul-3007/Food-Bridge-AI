import Donation from '../models/Donation.js';
import Organization from '../models/Organization.js';
import Match from '../models/Match.js';
import { formatGeoJSONPoint } from '../utils/geo.js';
import { rankEligibleRecipients } from '../services/matchingProxyService.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';

export const createDonation = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      quantity,
      unit,
      preparationTime,
      collectionDeadline,
      storageConditions,
      allergenInfo,
      dietaryType,
      pickupAddress,
      latitude,
      longitude,
      imageUrl,
      pickupInstructions,
      contactPerson,
      contactPhone,
      specialHandlingRequirements,
      foodSafetyDeclaration
    } = req.body;

    // Safety Gate 1: Check safety declarations
    if (
      !foodSafetyDeclaration ||
      !foodSafetyDeclaration.isSafeForConsumption ||
      !foodSafetyDeclaration.preparedUnderHygieneStandards ||
      !foodSafetyDeclaration.temperatureMaintained
    ) {
      return res.status(400).json({
        success: false,
        message: 'Food safety declaration is mandatory: All surplus food must be declared safe, hygienically prepared, and temperature maintained.'
      });
    }

    // Safety Gate 2: Validate collection deadline
    const deadlineDate = new Date(collectionDeadline);
    const now = new Date();
    if (isNaN(deadlineDate.getTime()) || deadlineDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Collection deadline must be a valid future date and time.'
      });
    }

    // Must have provider organization
    if (!req.user.organization) {
      return res.status(400).json({
        success: false,
        message: 'User must belong to a registered provider organization to create donations.'
      });
    }

    const geoPoint = formatGeoJSONPoint(longitude, latitude);

    const donation = await Donation.create({
      title,
      category,
      description,
      quantity: Number(quantity),
      unit: unit || 'portions',
      preparationTime: new Date(preparationTime),
      collectionDeadline: deadlineDate,
      storageConditions,
      allergenInfo: Array.isArray(allergenInfo) ? allergenInfo : (allergenInfo ? [allergenInfo] : []),
      dietaryType: dietaryType || 'any',
      pickupAddress,
      location: geoPoint,
      imageUrl: imageUrl || '',
      pickupInstructions: pickupInstructions || '',
      contactPerson: contactPerson || req.user.name,
      contactPhone: contactPhone || req.user.phone,
      specialHandlingRequirements: specialHandlingRequirements || '',
      foodSafetyDeclaration: {
        isSafeForConsumption: true,
        preparedUnderHygieneStandards: true,
        temperatureMaintained: true,
        declaredAt: new Date()
      },
      status: 'available',
      provider: req.user._id,
      providerOrg: req.user.organization._id
    });

    await logAudit({
      action: 'DONATION_CREATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Donation',
      entityId: donation._id.toString(),
      details: { title, quantity, category, pickupAddress }
    });

    // Initiate matching workflow immediately!
    const verifiedNGOs = await Organization.find({
      type: { $in: ['ngo', 'shelter', 'community_kitchen', 'food_bank'] },
      isVerified: true
    });

    if (verifiedNGOs.length > 0) {
      const matchResult = await rankEligibleRecipients(donation, verifiedNGOs);

      if (matchResult.matches && matchResult.matches.length > 0) {
        // Create match records in database
        const matchDocs = [];
        const matchQueueEntries = [];

        for (let i = 0; i < matchResult.matches.length; i++) {
          const m = matchResult.matches[i];
          const isTopMatch = i === 0;

          const matchDoc = await Match.create({
            donation: donation._id,
            recipient: m.recipientId,
            score: m.matchScore,
            scoreBreakdown: m.scoreBreakdown,
            geographicDistanceKm: m.geographicDistanceKm,
            roadDistanceKm: m.roadDistanceKm,
            roadDurationMin: m.roadDurationMin,
            eligibilityExplanation: m.eligibilityExplanation,
            status: isTopMatch ? 'offered' : 'offered',
            offeredAt: new Date()
          });

          matchDocs.push(matchDoc);
          matchQueueEntries.push({
            recipient: m.recipientId,
            score: m.matchScore,
            status: isTopMatch ? 'offered' : 'pending',
            offeredAt: isTopMatch ? new Date() : null
          });

          // Notify the top-ranked eligible recipient
          if (isTopMatch) {
            await createNotification({
              recipientOrg: m.recipientId,
              role: 'ngo',
              type: 'new_donation_offer',
              title: `New Surplus Food Offer: ${donation.title}`,
              message: `${donation.quantity} ${donation.unit} of ${donation.category.replace('_', ' ')} available nearby (${m.geographicDistanceKm} km). Collect before safe deadline.`,
              data: { donationId: donation._id, matchId: matchDoc._id }
            });

            donation.status = 'matching';
            donation.currentMatch = matchDoc._id;
          }
        }

        donation.matchQueue = matchQueueEntries;
        await donation.save();
      } else {
        // No matching recipient found
        await createNotification({
          recipientUser: req.user._id,
          recipientOrg: req.user.organization._id,
          type: 'no_recipient_found',
          title: 'Matching Update: No Eligible Recipient Currently',
          message: `Your donation "${donation.title}" is listed on the live map. No verified recipient currently has open capacity within service range. We will notify you when a recipient becomes available.`,
          data: { donationId: donation._id }
        });
      }
    }

    const populated = await Donation.findById(donation._id)
      .populate('providerOrg')
      .populate('currentMatch')
      .populate('matchQueue.recipient', 'name type address');

    res.status(201).json({
      success: true,
      donation: populated
    });
  } catch (error) {
    next(error);
  }
};

export const getDonations = async (req, res, next) => {
  try {
    const {
      status,
      category,
      dietaryType,
      providerOrg,
      acceptedBy,
      search,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (category) query.category = category;
    if (dietaryType) query.dietaryType = dietaryType;
    if (providerOrg) query.providerOrg = providerOrg;
    if (acceptedBy) query.acceptedBy = acceptedBy;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { pickupAddress: { $regex: search, $options: 'i' } }
      ];
    }

    // Check expired donations automatically
    const now = new Date();
    await Donation.updateMany(
      {
        collectionDeadline: { $lte: now },
        status: { $in: ['available', 'matching'] }
      },
      {
        $set: { status: 'expired' }
      }
    );

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('provider', 'name phone email')
      .populate('providerOrg', 'name type address location')
      .populate('acceptedBy', 'name type address location')
      .populate('currentMatch');

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      total,
      donations
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('provider', 'name phone email')
      .populate('providerOrg')
      .populate('acceptedBy')
      .populate({
        path: 'currentMatch',
        populate: { path: 'recipient' }
      })
      .populate('matchQueue.recipient');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation listing not found'
      });
    }

    res.json({
      success: true,
      donation
    });
  } catch (error) {
    next(error);
  }
};

export const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation listing not found'
      });
    }

    // Only provider owner or admin can update
    const isOwner = donation.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    if (!['available', 'matching'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit listing in '${donation.status}' state.`
      });
    }

    const {
      title,
      description,
      quantity,
      unit,
      collectionDeadline,
      pickupInstructions,
      specialHandlingRequirements
    } = req.body;

    if (title) donation.title = title;
    if (description) donation.description = description;
    if (quantity) donation.quantity = Number(quantity);
    if (unit) donation.unit = unit;
    if (collectionDeadline) donation.collectionDeadline = new Date(collectionDeadline);
    if (pickupInstructions !== undefined) donation.pickupInstructions = pickupInstructions;
    if (specialHandlingRequirements !== undefined) donation.specialHandlingRequirements = specialHandlingRequirements;

    await donation.save();

    await logAudit({
      action: 'DONATION_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Donation',
      entityId: donation._id.toString(),
      details: { title: donation.title }
    });

    res.json({
      success: true,
      message: 'Donation updated successfully',
      donation
    });
  } catch (error) {
    next(error);
  }
};

export const cancelDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const isOwner = donation.provider.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this donation'
      });
    }

    if (['picked_up', 'completed'].includes(donation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a donation that has already been collected or completed'
      });
    }

    donation.status = 'cancelled';
    await donation.save();

    // Cancel related matches
    await Match.updateMany({ donation: donation._id }, { status: 'expired' });

    await logAudit({
      action: 'DONATION_CANCELLED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Donation',
      entityId: donation._id.toString(),
      details: { reason: req.body.reason || 'Cancelled by provider' }
    });

    res.json({
      success: true,
      message: 'Donation cancelled successfully',
      donation
    });
  } catch (error) {
    next(error);
  }
};

export const triggerMatching = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const verifiedNGOs = await Organization.find({
      type: { $in: ['ngo', 'shelter', 'community_kitchen', 'food_bank'] },
      isVerified: true
    });

    const matchResult = await rankEligibleRecipients(donation, verifiedNGOs, req.body.weights);

    res.json({
      success: true,
      matchResult
    });
  } catch (error) {
    next(error);
  }
};
