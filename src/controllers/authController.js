import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { hashPassword, comparePassword, signToken } from '../utils/security.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';
import { formatGeoJSONPoint } from '../utils/geo.js';

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      organizationName,
      organizationType,
      address,
      latitude,
      longitude,
      serviceAreaKm,
      maxCapacity,
      dietaryAccepted,
      storageFacilities
    } = req.body;

    // Security Gate: Disallow public registration as administrator
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be created via public registration'
      });
    }

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, password, and role are required'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const hashedPassword = await hashPassword(password);
    let organizationId = null;

    // Create organization if role is provider or ngo
    if (['provider', 'ngo'].includes(role)) {
      if (!organizationName || !address || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Organization name, address, latitude, and longitude are required for providers and recipient organizations'
        });
      }

      const geoPoint = formatGeoJSONPoint(longitude, latitude);

      // Providers are automatically active; NGOs require admin verification
      const isVerified = role === 'provider';

      const organization = await Organization.create({
        name: organizationName,
        type: organizationType || (role === 'provider' ? 'restaurant' : 'ngo'),
        address,
        location: geoPoint,
        serviceAreaKm: serviceAreaKm ? Number(serviceAreaKm) : 15,
        maxCapacity: maxCapacity ? Number(maxCapacity) : (role === 'provider' ? 500 : 250),
        isVerified,
        contactPerson: name,
        contactPhone: phone,
        dietaryAccepted: dietaryAccepted || ['vegetarian', 'vegan', 'non_vegetarian'],
        storageFacilities: storageFacilities || ['ambient', 'refrigerated']
      });

      organizationId = organization._id;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role,
      organization: organizationId
    });

    if (organizationId) {
      await Organization.findByIdAndUpdate(organizationId, { createdBy: user._id });
    }

    const token = signToken(user._id);

    // Notify admins if an NGO registers and needs verification
    if (role === 'ngo') {
      await createNotification({
        role: 'admin',
        type: 'new_recipient_match',
        title: 'New NGO Registered - Verification Required',
        message: `Organization "${organizationName}" registered and is awaiting administrator verification before receiving food donations.`,
        data: { organizationId }
      });
    }

    await logAudit({
      action: 'USER_REGISTERED',
      performedBy: user._id,
      performedByName: user.name,
      entityType: 'User',
      entityId: user._id.toString(),
      details: { role, email: user.email, organizationId }
    });

    const populatedUser = await User.findById(user._id).populate('organization');

    res.status(201).json({
      success: true,
      token,
      user: populatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('organization');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('organization');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, organizationName, address, maxCapacity, serviceAreaKm } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    if (user.organization && (organizationName || address || maxCapacity || serviceAreaKm)) {
      const updateData = {};
      if (organizationName) updateData.name = organizationName;
      if (address) updateData.address = address;
      if (maxCapacity) updateData.maxCapacity = Number(maxCapacity);
      if (serviceAreaKm) updateData.serviceAreaKm = Number(serviceAreaKm);

      await Organization.findByIdAndUpdate(user.organization, updateData);
    }

    const updatedUser = await User.findById(user._id).populate('organization');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};
