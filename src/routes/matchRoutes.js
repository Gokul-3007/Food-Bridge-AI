import express from 'express';
import { getMatches, respondToMatch } from '../controllers/matchController.js';
import { protect, requireVerifiedOrg } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMatches);
router.post('/:id/respond', protect, requireVerifiedOrg, respondToMatch);

export default router;
