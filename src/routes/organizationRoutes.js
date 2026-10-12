import express from 'express';
import {
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  verifyOrganization
} from '../controllers/organizationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);
router.patch('/:id', protect, updateOrganization);
router.patch('/:id/verify', protect, authorize('admin'), verifyOrganization);

export default router;
