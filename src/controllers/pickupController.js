import Pickup from '../models/Pickup.js';
import Donation from '../models/Donation.js';
import { createNotification } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';
import { getRouteDirections } from '../services/routingService.js';

export const createPickup = async (req, res, next) => {
  try {
    const {
      donationId,
      scheduledTime,
      instructions
    } = req.body;

    const donation = await Donation.findById(donationId).populate('providerOrg').populate('acceptedBy');
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const pickup = await Pickup.create({
      donation: donation._id,
      providerOrg: donation.providerOrg._id,
      recipientOrg: donation.acceptedBy ? donation.acceptedBy._id : req.user.organization._id,
      pickupAddress: donation.pickupAddress,
      destinationAddress: donation.acceptedBy ? donation.acceptedBy.address : req.user.organization.address,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(Date.now() + 60 * 60 * 1000),
      instructions: instructions || '',
      status: 'scheduled',
      history: [
        {
          status: 'scheduled',
          timestamp: new Date(),
          updatedBy: req.user._id,
          note: 'Pickup scheduled'
        }
      ]
    });

    res.status(201).json({
      success: true,
      pickup
    });
  } catch (error) {
    next(error);
  }
};

export const getPickups = async (req, res, next) => {
  try {
    const { status, availableForVolunteers } = req.query;
    const query = {};

    if (status) query.status = status;

    if (req.user.role === 'provider' && req.user.organization) {
      query.providerOrg = req.user.organization._id;
    } else if (req.user.role === 'ngo' && req.user.organization) {
      query.recipientOrg = req.user.organization._id;
    } else if (req.user.role === 'volunteer') {
      if (availableForVolunteers === 'true') {
        query.status = { $in: ['accepted', 'scheduled'] };
        query.volunteer = null;
      } else {
        query.volunteer = req.user._id;
      }
    }

    const pickups = await Pickup.find(query)
      .sort({ scheduledTime: 1, createdAt: -1 })
      .populate('donation')
      .populate('providerOrg')
      .populate('recipientOrg')
      .populate('volunteer', 'name phone email');

    res.json({
      success: true,
      pickups
    });
  } catch (error) {
    next(error);
  }
};

export const getPickupById = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('providerOrg')
      .populate('recipientOrg')
      .populate('volunteer', 'name phone email')
      .populate('history.updatedBy', 'name role');

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    // Include route calculation if provider and recipient coordinates exist
    let route = null;
    if (
      pickup.providerOrg &&
      pickup.providerOrg.location &&
      pickup.recipientOrg &&
      pickup.recipientOrg.location
    ) {
      const [pLng, pLat] = pickup.providerOrg.location.coordinates;
      const [rLng, rLat] = pickup.recipientOrg.location.coordinates;
      route = await getRouteDirections(pLng, pLat, rLng, rLat);
    }

    res.json({
      success: true,
      pickup,
      route
    });
  } catch (error) {
    next(error);
  }
};

export const updatePickupStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const pickup = await Pickup.findById(req.params.id)
      .populate('donation')
      .populate('providerOrg')
      .populate('recipientOrg');

    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    const validStatuses = [
      'awaiting_acceptance',
      'accepted',
      'awaiting_scheduling',
      'scheduled',
      'volunteer_assigned',
      'pickup_in_progress',
      'picked_up',
      'delivered',
      'handover_verified',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    pickup.status = status;
    pickup.history.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: note || `Status updated to ${status.replace('_', ' ')}`
    });

    if (status === 'picked_up') {
      await Donation.findByIdAndUpdate(pickup.donation._id, { status: 'picked_up' });
    } else if (status === 'delivered') {
      pickup.completedAt = new Date();
    }

    await pickup.save();

    // Notify parties of status update
    await createNotification({
      recipientOrg: pickup.providerOrg._id,
      role: 'provider',
      type: 'pickup_status_updated',
      title: `Pickup Update: ${pickup.donation.title}`,
      message: `Pickup status has changed to: ${status.replace('_', ' ').toUpperCase()}`,
      data: { pickupId: pickup._id, donationId: pickup.donation._id }
    });

    await createNotification({
      recipientOrg: pickup.recipientOrg._id,
      role: 'ngo',
      type: 'pickup_status_updated',
      title: `Delivery Update: ${pickup.donation.title}`,
      message: `Delivery status has changed to: ${status.replace('_', ' ').toUpperCase()}`,
      data: { pickupId: pickup._id, donationId: pickup.donation._id }
    });

    await logAudit({
      action: 'PICKUP_STATUS_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Pickup',
      entityId: pickup._id.toString(),
      details: { status, note }
    });

    res.json({
      success: true,
      message: 'Pickup status updated',
      pickup
    });
  } catch (error) {
    next(error);
  }
};

export const assignVolunteer = async (req, res, next) => {
  try {
    const pickup = await Pickup.findById(req.params.id).populate('donation');
    if (!pickup) {
      return res.status(404).json({ success: false, message: 'Pickup not found' });
    }

    const volunteerId = req.user.role === 'volunteer' ? req.user._id : req.body.volunteerId;
    if (!volunteerId) {
      return res.status(400).json({ success: false, message: 'Volunteer ID required' });
    }

    pickup.volunteer = volunteerId;
    pickup.status = 'volunteer_assigned';
    pickup.history.push({
      status: 'volunteer_assigned',
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: `Assigned volunteer: ${req.user.name}`
    });

    await pickup.save();

    await logAudit({
      action: 'VOLUNTEER_ASSIGNED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Pickup',
      entityId: pickup._id.toString(),
      details: { volunteerId }
    });

    res.json({
      success: true,
      message: 'Volunteer successfully assigned to pickup route',
      pickup
    });
  } catch (error) {
    next(error);
  }
};
