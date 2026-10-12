import express from 'express';
import {
  getUsers,
  updateUserStatus,
  getAdminDonations,
  getAuditLogs,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/donations', getAdminDonations);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;
