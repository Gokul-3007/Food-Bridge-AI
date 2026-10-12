import Organization from '../models/Organization.js';
import Donation from '../models/Donation.js';
import Pickup from '../models/Pickup.js';
import { calculateHaversineDistance } from '../utils/geo.js';
import { getRouteDirections } from '../services/routingService.js';

export const getMapLocations = async (req, res, next) => {
  try {
    const { category, availability, maxDistance, userLat, userLng } = req.query;

    const now = new Date();

    // 1. Fetch available donations
    const donationQuery = {
      collectionDeadline: { $gt: now }
    };

    if (availability === 'available_only') {
      donationQuery.status = { $in: ['available', 'matching'] };
    } else {
      donationQuery.status = { $in: ['available', 'matching', 'accepted', 'scheduled'] };
    }

    if (category) {
      donationQuery.category = category;
    }

    const donations = await Donation.find(donationQuery)
      .populate('providerOrg', 'name type address')
      .populate('acceptedBy', 'name type address');

    // 2. Fetch Organizations (Providers & NGOs)
    const organizations = await Organization.find({
      'location.coordinates': { $exists: true, $ne: [] }
    });

    // 3. Fetch Active Pickups
    const activePickups = await Pickup.find({
      status: { $in: ['scheduled', 'volunteer_assigned', 'pickup_in_progress', 'picked_up'] }
    })
      .populate('providerOrg', 'name address location')
      .populate('recipientOrg', 'name address location')
      .populate('volunteer', 'name phone');

    // Filter by max distance from user if provided
    let filteredDonations = donations;
    let filteredOrgs = organizations;

    if (userLat && userLng && maxDistance) {
      const uLat = parseFloat(userLat);
      const uLng = parseFloat(userLng);
      const radius = parseFloat(maxDistance);

      filteredDonations = donations.filter((d) => {
        if (!d.location || !d.location.coordinates) return false;
        const [dLng, dLat] = d.location.coordinates;
        const dist = calculateHaversineDistance(uLat, uLng, dLat, dLng);
        return dist <= radius;
      });

      filteredOrgs = organizations.filter((o) => {
        if (!o.location || !o.location.coordinates) return false;
        const [oLng, oLat] = o.location.coordinates;
        const dist = calculateHaversineDistance(uLat, uLng, oLat, oLng);
        return dist <= radius;
      });
    }

    res.json({
      success: true,
      data: {
        donations: filteredDonations,
        organizations: filteredOrgs,
        pickups: activePickups
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getNearbyNGOs = async (req, res, next) => {
  try {
    const { lat, lng, radiusKm = 25, quantity = 0, dietaryType } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const maxRadius = parseFloat(radiusKm);
    const reqQty = parseFloat(quantity);

    const ngos = await Organization.find({
      type: { $in: ['ngo', 'shelter', 'community_kitchen', 'food_bank'] },
      isVerified: true
    });

    const nearbyList = [];

    for (const org of ngos) {
      if (!org.location || !org.location.coordinates) continue;
      const [rLng, rLat] = org.location.coordinates;
      const distance = calculateHaversineDistance(centerLat, centerLng, rLat, rLng);

      if (distance <= maxRadius) {
        const remainingCapacity = Math.max(0, (org.maxCapacity || 200) - (org.currentCapacityUsed || 0));
        const hasCapacity = reqQty > 0 ? remainingCapacity >= reqQty : true;

        let isCompatible = true;
        if (dietaryType && org.dietaryAccepted && org.dietaryAccepted.length > 0) {
          if (dietaryType === 'non_vegetarian' && !org.dietaryAccepted.includes('non_vegetarian')) {
            isCompatible = false;
          }
        }

        nearbyList.push({
          organization: org,
          distanceKm: distance,
          remainingCapacity,
          hasCapacity,
          isCompatible
        });
      }
    }

    // Sort by distance ascending
    nearbyList.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: nearbyList.length,
      ngos: nearbyList
    });
  } catch (error) {
    next(error);
  }
};

export const getRoute = async (req, res, next) => {
  try {
    const { originLng, originLat, destLng, destLat } = req.body;

    if (
      originLng === undefined ||
      originLat === undefined ||
      destLng === undefined ||
      destLat === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'originLng, originLat, destLng, and destLat are required'
      });
    }

    const result = await getRouteDirections(originLng, originLat, destLng, destLat);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
