import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Organization from '../src/models/Organization.js';
import Donation from '../src/models/Donation.js';
import Match from '../src/models/Match.js';
import Pickup from '../src/models/Pickup.js';
import Handover from '../src/models/Handover.js';
import { generateHandoverCode, hashHandoverCode } from '../src/utils/security.js';

let providerToken = '';
let ngoToken = '';
let adminToken = '';
let providerOrgId = '';
let ngoOrgId = '';
let sampleDonationId = '';
let samplePickupId = '';
let sampleHandoverPin = '';

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({});
  await Organization.deleteMany({});
  await Donation.deleteMany({});
  await Match.deleteMany({});
  await Pickup.deleteMany({});
  await Handover.deleteMany({});
}, 30000);

afterAll(async () => {
  await disconnectDB();
});

describe('1. Authentication & Security Tests', () => {
  it('prevents public registration as an administrator', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker Admin',
      email: 'hacker@admin.com',
      password: 'Password123!',
      phone: '+1 555-0000',
      role: 'admin'
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('successfully registers a food provider with organization', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Chef Mario',
      email: 'provider@test.com',
      password: 'Password123!',
      phone: '+1 555-1111',
      role: 'provider',
      organizationName: 'Mario Trattoria [TEST]',
      organizationType: 'restaurant',
      address: '10 Pizza Way, Test City',
      latitude: 40.7128,
      longitude: -74.006,
      serviceAreaKm: 15,
      maxCapacity: 300
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('provider');
    providerToken = res.body.token;
    providerOrgId = res.body.user.organization._id;
  });

  it('successfully registers an NGO (unverified by default)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sister Teresa',
      email: 'ngo@test.com',
      password: 'Password123!',
      phone: '+1 555-2222',
      role: 'ngo',
      organizationName: 'Care Community Kitchen [TEST]',
      organizationType: 'community_kitchen',
      address: '50 Mercy Road, Test City',
      latitude: 40.715,
      longitude: -74.002,
      serviceAreaKm: 15,
      maxCapacity: 250
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.organization.isVerified).toBe(false);
    ngoToken = res.body.token;
    ngoOrgId = res.body.user.organization._id;
  });

  it('logs in the registered provider and returns JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'provider@test.com',
      password: 'Password123!'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('rejects login with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'provider@test.com',
      password: 'WrongPassword!'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('2. Donation Creation & Safety Gates', () => {
  it('rejects donation creation without food safety declaration', async () => {
    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        title: 'Unchecked Soup',
        category: 'prepared_meals',
        description: 'No safety declaration provided',
        quantity: 20,
        unit: 'portions',
        preparationTime: new Date(),
        collectionDeadline: new Date(Date.now() + 4 * 3600000),
        storageConditions: 'hot_holding',
        pickupAddress: '10 Pizza Way',
        latitude: 40.7128,
        longitude: -74.006,
        contactPerson: 'Chef Mario',
        contactPhone: '+1 555-1111'
        // Missing foodSafetyDeclaration!
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/safety/i);
  });

  it('rejects donation with expired collection deadline', async () => {
    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        title: 'Expired Pastry',
        category: 'bakery',
        description: 'Past safe date',
        quantity: 15,
        unit: 'portions',
        preparationTime: new Date(Date.now() - 24 * 3600000),
        collectionDeadline: new Date(Date.now() - 1000), // Past!
        storageConditions: 'ambient',
        pickupAddress: '10 Pizza Way',
        latitude: 40.7128,
        longitude: -74.006,
        contactPerson: 'Chef Mario',
        contactPhone: '+1 555-1111',
        foodSafetyDeclaration: {
          isSafeForConsumption: true,
          preparedUnderHygieneStandards: true,
          temperatureMaintained: true
        }
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/future/i);
  });

  it('successfully creates a valid donation listing', async () => {
    const res = await request(app)
      .post('/api/donations')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        title: 'Fresh Baked Artisan Focaccia [TEST]',
        category: 'bakery',
        description: 'Herb and olive focaccia fresh from evening bake.',
        quantity: 25,
        unit: 'portions',
        preparationTime: new Date(),
        collectionDeadline: new Date(Date.now() + 5 * 3600000),
        storageConditions: 'ambient',
        dietaryType: 'vegetarian',
        pickupAddress: '10 Pizza Way, Test City',
        latitude: 40.7128,
        longitude: -74.006,
        contactPerson: 'Chef Mario',
        contactPhone: '+1 555-1111',
        foodSafetyDeclaration: {
          isSafeForConsumption: true,
          preparedUnderHygieneStandards: true,
          temperatureMaintained: true
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.donation._id).toBeDefined();
    sampleDonationId = res.body.donation._id;
  });
});

describe('3. Organization Verification & Matching Access', () => {
  it('blocks unverified NGO from accepting match offers', async () => {
    // Unverified NGO tries to respond to a dummy match
    const dummyMatch = await Match.create({
      donation: sampleDonationId,
      recipient: ngoOrgId,
      score: 90,
      geographicDistanceKm: 1.2,
      status: 'offered'
    });

    const res = await request(app)
      .post(`/api/matches/${dummyMatch._id}/respond`)
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({ action: 'accept' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/verified/i);
  });

  it('allows verified NGO to accept donation atomically', async () => {
    // Manually mark NGO as verified
    await Organization.findByIdAndUpdate(ngoOrgId, { isVerified: true });

    const match = await Match.create({
      donation: sampleDonationId,
      recipient: ngoOrgId,
      score: 95.0,
      geographicDistanceKm: 0.8,
      status: 'offered'
    });

    const res = await request(app)
      .post(`/api/matches/${match._id}/respond`)
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({ action: 'accept' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pickup).toBeDefined();
    expect(res.body.verificationPin).toBeDefined();

    samplePickupId = res.body.pickup._id;
    sampleHandoverPin = res.body.verificationPin;
  });

  it('prevents duplicate or conflicting acceptance attempts', async () => {
    const anotherMatch = await Match.create({
      donation: sampleDonationId,
      recipient: ngoOrgId,
      score: 80,
      geographicDistanceKm: 1.0,
      status: 'offered'
    });

    const res = await request(app)
      .post(`/api/matches/${anotherMatch._id}/respond`)
      .set('Authorization', `Bearer ${ngoToken}`)
      .send({ action: 'accept' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe('4. Secure Handover Verification Lifecycle', () => {
  it('rejects an invalid 6-digit verification code', async () => {
    const res = await request(app)
      .post('/api/handovers/verify')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        pickupId: samplePickupId,
        verificationCode: '000000' // Wrong PIN
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('verifies valid cryptographic code and completes donation', async () => {
    const res = await request(app)
      .post('/api/handovers/verify')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        pickupId: samplePickupId,
        verificationCode: sampleHandoverPin
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.handover.isVerified).toBe(true);

    const completedDonation = await Donation.findById(sampleDonationId);
    expect(completedDonation.status).toBe('completed');
  });

  it('prevents code reuse for already completed handovers', async () => {
    const res = await request(app)
      .post('/api/handovers/verify')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        pickupId: samplePickupId,
        verificationCode: sampleHandoverPin
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cannot be reused|already been verified/i);
  });
});

describe('5. Map & Analytics Endpoints', () => {
  it('fetches map locations including donations and organizations', async () => {
    const res = await request(app).get('/api/map/locations');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.donations).toBeDefined();
    expect(res.body.data.organizations).toBeDefined();
  });

  it('calculates analytics summary metrics accurately', async () => {
    const res = await request(app).get('/api/analytics/summary');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary.completedHandovers).toBeGreaterThanOrEqual(1);
    expect(res.body.summary.foodRescued.estimatedMealsSupported).toBeGreaterThanOrEqual(25);
  });
});
