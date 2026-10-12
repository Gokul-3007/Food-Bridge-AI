import express from 'express';
import {
  createPickup,
  getPickups,
  getPickupById,
  updatePickupStatus,
  assignVolunteer
} from '../controllers/pickupController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createPickup)
  .get(protect, getPickups);

router.route('/:id')
  .get(protect, getPickupById);

router.patch('/:id/status', protect, updatePickupStatus);
router.post('/:id/volunteer', protect, assignVolunteer);

export default router;
