import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { logAudit } from '../services/auditService.js';
import { createNotification } from '../services/notificationService.js';

export const getOrganizations = async (req, res, next) => {
  try {
    const { type, isVerified, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const organizations = await Organization.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('createdBy', 'name email phone');

    const total = await Organization.countDocuments(query);

    res.json({
      success: true,
      total,
      organizations
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizationById = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id).populate('createdBy', 'name email phone');
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      organization
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Only org creator or admin can update
    const isOwner = req.user.organization && req.user.organization._id.toString() === organization._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this organization'
      });
    }

    const {
      name,
      address,
      serviceAreaKm,
      maxCapacity,
      operatingHours,
      dietaryAccepted,
      storageFacilities,
      contactPerson,
      contactPhone
    } = req.body;

    if (name) organization.name = name;
    if (address) organization.address = address;
    if (serviceAreaKm) organization.serviceAreaKm = Number(serviceAreaKm);
    if (maxCapacity) organization.maxCapacity = Number(maxCapacity);
    if (operatingHours) organization.operatingHours = operatingHours;
    if (dietaryAccepted) organization.dietaryAccepted = dietaryAccepted;
    if (storageFacilities) organization.storageFacilities = storageFacilities;
    if (contactPerson) organization.contactPerson = contactPerson;
    if (contactPhone) organization.contactPhone = contactPhone;

    await organization.save();

    await logAudit({
      action: 'ORGANIZATION_UPDATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Organization',
      entityId: organization._id.toString(),
      details: { updatedFields: req.body }
    });

    res.json({
      success: true,
      message: 'Organization updated successfully',
      organization
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOrganization = async (req, res, next) => {
  try {
    const { isVerified, rejectionReason } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    organization.isVerified = Boolean(isVerified);
    organization.verificationDate = isVerified ? new Date() : null;
    organization.verifiedBy = req.user._id;
    await organization.save();

    // Notify organization owner
    if (organization.createdBy) {
      await createNotification({
        recipientUser: organization.createdBy,
        recipientOrg: organization._id,
        type: 'organization_verified',
        title: isVerified ? 'Organization Verified!' : 'Verification Status Updated',
        message: isVerified
          ? `Congratulations! ${organization.name} has been verified by an administrator. You can now receive surplus food donations.`
          : `Your verification status was updated. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
        data: { organizationId: organization._id }
      });
    }

    await logAudit({
      action: isVerified ? 'ORGANIZATION_VERIFIED' : 'ORGANIZATION_REJECTED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      entityType: 'Organization',
      entityId: organization._id.toString(),
      details: { isVerified, rejectionReason }
    });

    res.json({
      success: true,
      message: `Organization ${isVerified ? 'verified' : 'unverified'} successfully`,
      organization
    });
  } catch (error) {
    next(error);
  }
};
