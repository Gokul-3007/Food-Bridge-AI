import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  action,
  performedBy,
  performedByName,
  entityType,
  entityId,
  details = {},
  ipAddress = ''
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      performedByName,
      entityType,
      entityId,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to write audit log entry:', error.message);
  }
};
