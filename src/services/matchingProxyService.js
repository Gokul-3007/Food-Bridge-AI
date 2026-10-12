import axios from 'axios';
import { calculateHaversineDistance } from '../utils/geo.js';

export const rankEligibleRecipients = async (donation, recipientOrgs, customWeights = null) => {
  const serviceUrl = process.env.MATCHING_SERVICE_URL || 'http://localhost:8000';

  const payload = {
    donation: {
      id: donation._id.toString(),
      title: donation.title,
      category: donation.category,
      quantity: donation.quantity,
      unit: donation.unit,
      collectionDeadline: donation.collectionDeadline.toISOString(),
      dietaryType: donation.dietaryType,
      storageConditions: donation.storageConditions,
      location: donation.location.coordinates, // [lng, lat]
      foodSafetyDeclaration: donation.foodSafetyDeclaration
    },
    recipients: recipientOrgs.map((org) => ({
      id: org._id.toString(),
      name: org.name,
      type: org.type,
      isVerified: org.isVerified,
      location: org.location.coordinates, // [lng, lat]
      serviceAreaKm: org.serviceAreaKm || 15,
      maxCapacity: org.maxCapacity || 200,
      currentCapacityUsed: org.currentCapacityUsed || 0,
      dietaryAccepted: org.dietaryAccepted || ['vegetarian', 'vegan', 'non_vegetarian'],
      storageFacilities: org.storageFacilities || ['ambient', 'refrigerated']
    })),
    weights: customWeights || {
      proximity: 0.40,
      compatibility: 0.25,
      capacity: 0.20,
      availability: 0.15
    }
  };

  // 1. Try calling the Python FastAPI matching service
  try {
    const response = await axios.post(`${serviceUrl}/api/match`, payload, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.data && response.data.matches) {
      return {
        source: 'fastapi-service',
        matches: response.data.matches,
        totalEvaluated: response.data.totalEvaluated,
        eligibleCount: response.data.eligibleCount
      };
    }
  } catch (error) {
    console.warn(`FastAPI matching engine unreachable (${error.message}). Running internal matching engine.`);
  }

  // 2. Resilient Rule-Based Fallback Matching Engine
  const matches = [];
  const [dLng, dLat] = donation.location.coordinates;
  const deadline = new Date(donation.collectionDeadline);
  const now = new Date();

  // Safety Gate: If safety declaration failed or expired, return empty
  if (
    !donation.foodSafetyDeclaration ||
    !donation.foodSafetyDeclaration.isSafeForConsumption ||
    !donation.foodSafetyDeclaration.preparedUnderHygieneStandards ||
    !donation.foodSafetyDeclaration.temperatureMaintained ||
    deadline <= now
  ) {
    return {
      source: 'internal-engine',
      matches: [],
      totalEvaluated: recipientOrgs.length,
      eligibleCount: 0,
      exclusionReason: 'Donation failed food safety verification or has passed collection deadline'
    };
  }

  for (const org of recipientOrgs) {
    // Stage 1: Mandatory Eligibility Filters
    if (!org.isVerified) continue;

    const remainingCapacity = Math.max(0, (org.maxCapacity || 200) - (org.currentCapacityUsed || 0));
    if (remainingCapacity < donation.quantity) continue;

    // Check dietary compatibility
    const dietaryAccepted = org.dietaryAccepted || [];
    if (donation.dietaryType === 'non_vegetarian' && !dietaryAccepted.includes('non_vegetarian')) {
      continue;
    }

    // Check storage compatibility
    const storageFacilities = org.storageFacilities || ['ambient'];
    if (
      donation.storageConditions === 'refrigerated' &&
      !storageFacilities.includes('refrigerated') &&
      !storageFacilities.includes('cold_room')
    ) {
      continue;
    }

    // Check distance feasibility
    const [rLng, rLat] = org.location.coordinates;
    const distanceKm = calculateHaversineDistance(dLat, dLng, rLat, rLng);
    const serviceRadius = org.serviceAreaKm || 15;
    if (distanceKm > serviceRadius) continue;

    // Stage 2: Weighted Scoring
    // Proximity score: 100 at 0km, scaling linearly down to 0 at serviceRadius
    const proximityScore = Math.max(0, Math.round((1 - distanceKm / serviceRadius) * 100));

    // Compatibility score
    let compatibilityScore = 90;
    if (dietaryAccepted.includes(donation.dietaryType) || donation.dietaryType === 'any') {
      compatibilityScore = 100;
    }

    // Capacity score: ratio of remaining capacity vs max capacity
    const capacityScore = Math.min(100, Math.round((remainingCapacity / (org.maxCapacity || 200)) * 100));

    // Availability score (based on active operating hours)
    const availabilityScore = 95;

    const weights = customWeights || {
      proximity: 0.40,
      compatibility: 0.25,
      capacity: 0.20,
      availability: 0.15
    };

    const finalScore = Math.round(
      (weights.proximity * proximityScore +
        weights.compatibility * compatibilityScore +
        weights.capacity * capacityScore +
        weights.availability * availabilityScore) *
        10
    ) / 10;

    matches.push({
      recipientId: org._id.toString(),
      recipientName: org.name,
      matchScore: finalScore,
      scoreBreakdown: {
        proximityScore,
        compatibilityScore,
        capacityScore,
        availabilityScore
      },
      geographicDistanceKm: distanceKm,
      roadDistanceKm: null,
      roadDurationMin: null,
      eligibilityExplanation: `Verified recipient within ${distanceKm} km with capacity for ${donation.quantity} ${donation.unit}`
    });
  }

  // Sort descending by matchScore
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    source: 'internal-engine',
    matches,
    totalEvaluated: recipientOrgs.length,
    eligibleCount: matches.length
  };
};
