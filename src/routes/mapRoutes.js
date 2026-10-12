import express from 'express';
import {
  getMapLocations,
  getNearbyNGOs,
  getRoute
} from '../controllers/mapController.js';

const router = express.Router();

router.get('/locations', getMapLocations);
router.get('/nearby-ngos', getNearbyNGOs);
router.post('/route', getRoute);

export default router;
