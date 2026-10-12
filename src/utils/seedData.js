import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Donation from '../models/Donation.js';
import Match from '../models/Match.js';
import Pickup from '../models/Pickup.js';
import Handover from '../models/Handover.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { hashPassword, generateHandoverCode, hashHandoverCode } from './security.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  console.log('--- Starting Seed Process for FoodBridge AI ---');

  // Clear existing collections
  await User.deleteMany({});
  await Organization.deleteMany({});
  await Donation.deleteMany({});
  await Match.deleteMany({});
  await Pickup.deleteMany({});
  await Handover.deleteMany({});
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});

  const defaultPassword = await hashPassword('Password123!');

  // 1. Create Administrator
  const adminUser = await User.create({
    name: 'Platform Administrator',
    email: 'admin@foodbridge.org',
    password: defaultPassword,
    phone: '+1 555-0100',
    role: 'admin',
    isActive: true
  });

  // 2. Create Food Provider Organizations & Users
  const grandRegalOrg = await Organization.create({
    name: 'The Grand Regal Hotel [DEMO]',
    type: 'hotel',
    address: '100 Grand Avenue, Midtown, Metro City',
    location: {
      type: 'Point',
      coordinates: [-73.9851, 40.7488] // Longitude, Latitude
    },
    serviceAreaKm: 20,
    maxCapacity: 500,
    currentCapacityUsed: 0,
    isVerified: true,
    verificationDate: new Date(),
    contactPerson: 'Chef Marco Rossi',
    contactPhone: '+1 555-0101',
    operatingHours: '06:00 - 23:00',
    dietaryAccepted: ['vegetarian', 'vegan', 'non_vegetarian'],
    storageFacilities: ['ambient', 'refrigerated', 'hot_holding', 'freezer']
  });

  const providerUser1 = await User.create({
    name: 'Chef Marco Rossi',
    email: 'provider@regalhotel.demo',
    password: defaultPassword,
    phone: '+1 555-0101',
    role: 'provider',
    organization: grandRegalOrg._id,
    isActive: true
  });
  grandRegalOrg.createdBy = providerUser1._id;
  await grandRegalOrg.save();

  const artisanBakeryOrg = await Organization.create({
    name: 'Artisan Oven Bakery & Cafe [DEMO]',
    type: 'bakery',
    address: '45 Baker Street, West End, Metro City',
    location: {
      type: 'Point',
      coordinates: [-73.9912, 40.7523]
    },
    serviceAreaKm: 15,
    maxCapacity: 150,
    currentCapacityUsed: 0,
    isVerified: true,
    verificationDate: new Date(),
    contactPerson: 'Elena Rostova',
    contactPhone: '+1 555-0102',
    operatingHours: '05:00 - 19:00',
    dietaryAccepted: ['vegetarian', 'vegan'],
    storageFacilities: ['ambient']
  });

  const providerUser2 = await User.create({
    name: 'Elena Rostova',
    email: 'provider@artisanbakery.demo',
    password: defaultPassword,
    phone: '+1 555-0102',
    role: 'provider',
    organization: artisanBakeryOrg._id,
    isActive: true
  });
  artisanBakeryOrg.createdBy = providerUser2._id;
  await artisanBakeryOrg.save();

  // 3. Create Verified Recipient Organizations (NGOs / Shelters)
  const hopeKitchenOrg = await Organization.create({
    name: 'Hope Community Kitchen [DEMO]',
    type: 'community_kitchen',
    address: '220 Compassion Way, South Quarter, Metro City',
    location: {
      type: 'Point',
      coordinates: [-73.9814, 40.7431] // ~0.8 km from Grand Regal
    },
    serviceAreaKm: 15,
    maxCapacity: 350,
    currentCapacityUsed: 30,
    isVerified: true,
    verificationDate: new Date(),
    verifiedBy: adminUser._id,
    contactPerson: 'Sarah Jenkins',
    contactPhone: '+1 555-0201',
    operatingHours: '08:00 - 20:00',
    dietaryAccepted: ['vegetarian', 'vegan', 'non_vegetarian'],
    storageFacilities: ['ambient', 'refrigerated', 'hot_holding']
  });

  const ngoUser1 = await User.create({
    name: 'Sarah Jenkins',
    email: 'ngo@hopekitchen.demo',
    password: defaultPassword,
    phone: '+1 555-0201',
    role: 'ngo',
    organization: hopeKitchenOrg._id,
    isActive: true
  });
  hopeKitchenOrg.createdBy = ngoUser1._id;
  await hopeKitchenOrg.save();

  const harborShelterOrg = await Organization.create({
    name: 'Harbor Shelter & Food Bank [DEMO]',
    type: 'shelter',
    address: '88 Haven Boulevard, Eastside, Metro City',
    location: {
      type: 'Point',
      coordinates: [-73.9742, 40.7562] // ~1.5 km
    },
    serviceAreaKm: 25,
    maxCapacity: 500,
    currentCapacityUsed: 120,
    isVerified: true,
    verificationDate: new Date(),
    verifiedBy: adminUser._id,
    contactPerson: 'David Chen',
    contactPhone: '+1 555-0202',
    operatingHours: '24/7',
    dietaryAccepted: ['vegetarian', 'vegan', 'non_vegetarian'],
    storageFacilities: ['ambient', 'refrigerated', 'freezer']
  });

  const ngoUser2 = await User.create({
    name: 'David Chen',
    email: 'ngo@harborshelter.demo',
    password: defaultPassword,
    phone: '+1 555-0202',
    role: 'ngo',
    organization: harborShelterOrg._id,
    isActive: true
  });
  harborShelterOrg.createdBy = ngoUser2._id;
  await harborShelterOrg.save();

  // 4. Create an Unverified NGO awaiting administrator approval
  const newHorizonOrg = await Organization.create({
    name: 'New Horizon Youth Center [DEMO]',
    type: 'ngo',
    address: '12 Pine Street, North Heights, Metro City',
    location: {
      type: 'Point',
      coordinates: [-73.965, 40.76]
    },
    serviceAreaKm: 10,
    maxCapacity: 100,
    currentCapacityUsed: 0,
    isVerified: false, // Intentionally unverified for testing approval workflow!
    contactPerson: 'Maya Lin',
    contactPhone: '+1 555-0203',
    operatingHours: '09:00 - 18:00',
    dietaryAccepted: ['vegetarian', 'vegan'],
    storageFacilities: ['ambient']
  });

  const ngoUser3 = await User.create({
    name: 'Maya Lin',
    email: 'ngo@newhorizon.demo',
    password: defaultPassword,
    phone: '+1 555-0203',
    role: 'ngo',
    organization: newHorizonOrg._id,
    isActive: true
  });
  newHorizonOrg.createdBy = ngoUser3._id;
  await newHorizonOrg.save();

  // 5. Create Volunteers
  const volunteerUser = await User.create({
    name: 'Alex Rivera',
    email: 'volunteer@foodbridge.demo',
    password: defaultPassword,
    phone: '+1 555-0301',
    role: 'volunteer',
    isActive: true
  });

  // 6. Create Demo Donations
  const now = new Date();
  const todayEvening = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now
  const tomorrowMorning = new Date(now.getTime() + 20 * 60 * 60 * 1000);

  // Available Donation 1: Buffet Pasta & Vegetable Medley
  const donation1 = await Donation.create({
    title: 'Gourmet Pasta Primavera & Roasted Veggies [DEMO]',
    category: 'prepared_meals',
    description: 'Hot holding buffet surplus from corporate banquet. Freshly prepared, cooled under temperature control.',
    quantity: 45,
    unit: 'portions',
    preparationTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    collectionDeadline: todayEvening,
    storageConditions: 'hot_holding',
    allergenInfo: ['gluten', 'dairy'],
    dietaryType: 'vegetarian',
    pickupAddress: grandRegalOrg.address,
    location: grandRegalOrg.location,
    pickupInstructions: 'Report to Loading Dock B on 41st Street. Ask for Banquet Steward.',
    contactPerson: 'Chef Marco Rossi',
    contactPhone: '+1 555-0101',
    specialHandlingRequirements: 'Insulated thermal carriers required during transport',
    foodSafetyDeclaration: {
      isSafeForConsumption: true,
      preparedUnderHygieneStandards: true,
      temperatureMaintained: true,
      declaredAt: now
    },
    status: 'available',
    provider: providerUser1._id,
    providerOrg: grandRegalOrg._id
  });

  // Donation 2: Artisan Sourdough & Pastries (Already Matched to Hope Kitchen)
  const donation2 = await Donation.create({
    title: 'Fresh Artisanal Sourdough & Croissants [DEMO]',
    category: 'bakery',
    description: 'Daily unsold batch of sourdough loaves, baguettes, and assorted sweet brioche.',
    quantity: 30,
    unit: 'kg',
    preparationTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    collectionDeadline: tomorrowMorning,
    storageConditions: 'ambient',
    allergenInfo: ['gluten', 'wheat'],
    dietaryType: 'vegetarian',
    pickupAddress: artisanBakeryOrg.address,
    location: artisanBakeryOrg.location,
    pickupInstructions: 'Enter through front counter after closing, knock on service door.',
    contactPerson: 'Elena Rostova',
    contactPhone: '+1 555-0102',
    specialHandlingRequirements: 'Keep dry and sheltered from moisture.',
    foodSafetyDeclaration: {
      isSafeForConsumption: true,
      preparedUnderHygieneStandards: true,
      temperatureMaintained: true,
      declaredAt: now
    },
    status: 'matching',
    provider: providerUser2._id,
    providerOrg: artisanBakeryOrg._id
  });

  // Create match offer for Donation 2 to Hope Kitchen
  const match2 = await Match.create({
    donation: donation2._id,
    recipient: hopeKitchenOrg._id,
    score: 94.5,
    scoreBreakdown: {
      proximityScore: 92,
      compatibilityScore: 100,
      capacityScore: 95,
      availabilityScore: 95
    },
    geographicDistanceKm: 1.2,
    roadDistanceKm: 1.5,
    roadDurationMin: 6,
    eligibilityExplanation: 'Excellent proximity (1.2 km) with abundant capacity and bakery suitability',
    status: 'offered',
    offeredAt: now
  });

  donation2.currentMatch = match2._id;
  donation2.matchQueue = [
    {
      recipient: hopeKitchenOrg._id,
      score: 94.5,
      status: 'offered',
      offeredAt: now
    },
    {
      recipient: harborShelterOrg._id,
      score: 87.2,
      status: 'pending'
    }
  ];
  await donation2.save();

  // Donation 3: Completed Donation with Handover Verified! (For rich analytics demonstration)
  const donation3 = await Donation.create({
    title: 'Chilled Fruit Platters & Greek Yogurt [DEMO]',
    category: 'dairy',
    description: 'Breakfast service overflow. Unopened sealed packaging stored in cold room at 3°C.',
    quantity: 60,
    unit: 'portions',
    preparationTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    collectionDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    storageConditions: 'refrigerated',
    allergenInfo: ['dairy'],
    dietaryType: 'vegetarian',
    pickupAddress: grandRegalOrg.address,
    location: grandRegalOrg.location,
    pickupInstructions: 'Dock A steward',
    contactPerson: 'Chef Marco Rossi',
    contactPhone: '+1 555-0101',
    foodSafetyDeclaration: {
      isSafeForConsumption: true,
      preparedUnderHygieneStandards: true,
      temperatureMaintained: true,
      declaredAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
    },
    status: 'completed',
    provider: providerUser1._id,
    providerOrg: grandRegalOrg._id,
    acceptedBy: harborShelterOrg._id
  });

  const pickup3 = await Pickup.create({
    donation: donation3._id,
    providerOrg: grandRegalOrg._id,
    recipientOrg: harborShelterOrg._id,
    volunteer: volunteerUser._id,
    pickupAddress: grandRegalOrg.address,
    destinationAddress: harborShelterOrg.address,
    status: 'handover_verified',
    scheduledTime: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    completedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    history: [
      { status: 'accepted', timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000) },
      { status: 'picked_up', timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
      { status: 'handover_verified', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000) }
    ]
  });

  const rawCode = '742918';
  const hashedCode = hashHandoverCode(rawCode);

  await Handover.create({
    pickup: pickup3._id,
    donation: donation3._id,
    recipientOrg: harborShelterOrg._id,
    verificationCodeHash: hashedCode,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    isVerified: true,
    verifiedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    verifiedBy: volunteerUser._id,
    providerConfirmed: true,
    recipientConfirmed: true
  });

  // 7. Seed Initial Notifications
  await Notification.create({
    recipientOrg: hopeKitchenOrg._id,
    role: 'ngo',
    type: 'new_donation_offer',
    title: 'Surplus Food Offer: Fresh Artisanal Sourdough & Croissants',
    message: '30 kg of bakery surplus is available from Artisan Oven Bakery & Cafe. Match score: 94.5%.',
    data: { donationId: donation2._id, matchId: match2._id }
  });

  await Notification.create({
    recipientUser: adminUser._id,
    role: 'admin',
    type: 'new_recipient_match',
    title: 'New NGO Registered - Verification Required',
    message: 'New Horizon Youth Center [DEMO] is awaiting administrator review and verification.',
    data: { organizationId: newHorizonOrg._id }
  });

  // 8. Seed Audit Logs
  await AuditLog.create({
    action: 'SYSTEM_SEEDED',
    performedBy: adminUser._id,
    performedByName: adminUser.name,
    entityType: 'System',
    details: { message: 'Initialized seed data with demo providers, NGOs, and donations' }
  });

  console.log('--- Seed Completed Successfully! ---');
  console.log('Sample Credentials (Password: Password123!):');
  console.log('Admin:     admin@foodbridge.org');
  console.log('Provider:  provider@regalhotel.demo');
  console.log('Provider:  provider@artisanbakery.demo');
  console.log('NGO:       ngo@hopekitchen.demo (Verified)');
  console.log('NGO:       ngo@harborshelter.demo (Verified)');
  console.log('NGO:       ngo@newhorizon.demo (Unverified)');
  console.log('Volunteer: volunteer@foodbridge.demo');
};

// If run directly from terminal: `node src/utils/seedData.js`
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      console.error('Seed script error:', err);
      process.exit(1);
    }
  })();
}
