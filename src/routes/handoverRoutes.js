import express from 'express';
import {
  initiateHandover,
  verifyHandoverCode,
  confirmHandoverDual
} from '../controllers/handoverController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/initiate', protect, initiateHandover);
router.post('/verify', protect, verifyHandoverCode);
router.post('/:id/confirm', protect, confirmHandoverDual);

export default router;
