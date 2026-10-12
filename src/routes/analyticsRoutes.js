import express from 'express';
import { getSummary, getDonationAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', getSummary);
router.get('/donations', getDonationAnalytics);

export default router;
