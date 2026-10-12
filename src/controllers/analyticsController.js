import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Donation from '../models/Donation.js';
import Pickup from '../models/Pickup.js';
import AuditLog from '../models/AuditLog.js';

export const getSummary = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedNGOs = await Organization.countDocuments({
      type: { $in: ['ngo', 'shelter', 'community_kitchen', 'food_bank'] },
      isVerified: true
    });
    const pendingNGOs = await Organization.countDocuments({
      type: { $in: ['ngo', 'shelter', 'community_kitchen', 'food_bank'] },
      isVerified: false
    });
    const totalProviders = await Organization.countDocuments({
      type: { $in: ['restaurant', 'hotel', 'canteen', 'bakery', 'grocery'] }
    });

    const activeListings = await Donation.countDocuments({
      status: { $in: ['available', 'matching'] },
      collectionDeadline: { $gt: new Date() }
    });
    const acceptedDonations = await Donation.countDocuments({
      status: { $in: ['accepted', 'scheduled', 'picked_up'] }
    });
    const completedHandovers = await Donation.countDocuments({ status: 'completed' });
    const expiredDonations = await Donation.countDocuments({ status: 'expired' });
    const totalDonations = await Donation.countDocuments();

    const pendingPickups = await Pickup.countDocuments({
      status: { $in: ['accepted', 'scheduled', 'volunteer_assigned', 'pickup_in_progress'] }
    });

    // Real aggregation for completed food quantities & estimated meals
    const quantityAggregation = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$unit',
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    let totalPortionsHandedOver = 0;
    let totalKgHandedOver = 0;

    quantityAggregation.forEach((item) => {
      if (item._id === 'portions') totalPortionsHandedOver += item.totalQuantity;
      if (item._id === 'kg') totalKgHandedOver += item.totalQuantity;
      if (item._id === 'boxes') totalPortionsHandedOver += item.totalQuantity * 10; // estimate 10 portions per box
      if (item._id === 'liters') totalKgHandedOver += item.totalQuantity; // estimate 1 liter ≈ 1 kg
    });

    // Meals calculation: Documented conversion formula:
    // 1 portion measured = 1 meal.
    // 1 kg prepared food = approx 2.5 meals (400g per meal average standard FAO benchmark).
    const estimatedMealsFromPortions = totalPortionsHandedOver;
    const estimatedMealsFromKg = Math.round(totalKgHandedOver * 2.5);
    const totalEstimatedMeals = estimatedMealsFromPortions + estimatedMealsFromKg;

    // Completion rate
    const completionRate =
      totalDonations > 0 ? Math.round((completedHandovers / totalDonations) * 100) : 0;

    // Recent activities from audit log
    const recentActivities = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      summary: {
        totalUsers,
        verifiedNGOs,
        pendingNGOs,
        totalProviders,
        activeListings,
        acceptedDonations,
        completedHandovers,
        expiredDonations,
        pendingPickups,
        totalDonations,
        completionRate,
        foodRescued: {
          totalPortionsMeasured: totalPortionsHandedOver,
          totalKgMeasured: totalKgHandedOver,
          estimatedMealsSupported: totalEstimatedMeals,
          conversionNote: 'Estimated meals calculated based on 1.0 meal per portion and 2.5 meals per kg (standard 400g serving FAO benchmark)'
        },
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationAnalytics = async (req, res, next) => {
  try {
    // 1. Category breakdown
    const categoryBreakdown = await Donation.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 2. Status distribution
    const statusDistribution = await Donation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Organization type distribution
    const organizationDistribution = await Organization.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryBreakdown,
        statusDistribution,
        organizationDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};
