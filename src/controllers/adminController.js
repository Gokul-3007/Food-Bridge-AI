import User from '../models/User.js';
import Donation from '../models/Donation.js';
import AuditLog from '../models/AuditLog.js';
import { logAudit } from '../services/auditService.js';

let platformSettings = {
  matchingWeights: {
    proximity: 0.40,
    compatibility: 0.25,
    capacity: 0.20,
    availability: 0.15
  },
  minDeadlineBufferMinutes: 30,
  maxServiceRadiusKm: 50,
  mealConversionRateKg: 2.5
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('organization');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      total,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate an administrator account'
      });
    }

    user.isActive = Boolean(isActive);
    await user.save();

    await logAudit({
      action: isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'User',
      entityId: user._id.toString(),
      details: { isActive }
    });

    res.json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'suspended'} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDonations = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('provider', 'name email phone')
      .populate('providerOrg')
      .populate('acceptedBy')
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

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, page = 1, limit = 100 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('performedBy', 'name email role');

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      total,
      logs
    });
  } catch (error) {
    next(error);
  }
};

export const getSettings = (req, res) => {
  res.json({
    success: true,
    settings: platformSettings
  });
};

export const updateSettings = async (req, res, next) => {
  try {
    const { matchingWeights, minDeadlineBufferMinutes, maxServiceRadiusKm, mealConversionRateKg } = req.body;

    if (matchingWeights) {
      const sum =
        (matchingWeights.proximity || 0) +
        (matchingWeights.compatibility || 0) +
        (matchingWeights.capacity || 0) +
        (matchingWeights.availability || 0);

      if (Math.abs(sum - 1.0) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Matching weights must sum to 1.0 (100%)'
        });
      }

      platformSettings.matchingWeights = { ...platformSettings.matchingWeights, ...matchingWeights };
    }

    if (minDeadlineBufferMinutes) platformSettings.minDeadlineBufferMinutes = minDeadlineBufferMinutes;
    if (maxServiceRadiusKm) platformSettings.maxServiceRadiusKm = maxServiceRadiusKm;
    if (mealConversionRateKg) platformSettings.mealConversionRateKg = mealConversionRateKg;

    await logAudit({
      action: 'PLATFORM_SETTINGS_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'System',
      details: { settings: platformSettings }
    });

    res.json({
      success: true,
      message: 'Platform settings updated successfully',
      settings: platformSettings
    });
  } catch (error) {
    next(error);
  }
};
