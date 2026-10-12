import express from 'express';
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
  triggerMatching
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('provider', 'admin'), createDonation)
  .get(getDonations);

router.route('/:id')
  .get(getDonationById)
  .patch(protect, authorize('provider', 'admin'), updateDonation);

router.patch('/:id/cancel', protect, authorize('provider', 'admin'), cancelDonation);
router.post('/:id/match', protect, triggerMatching);

export default router;
