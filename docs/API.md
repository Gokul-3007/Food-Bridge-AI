# FoodBridge AI — REST API Documentation

This document describes the API contract, endpoints, parameters, authentication requirements, and response structures for FoodBridge AI.

Base URL (Local): `http://localhost:5000/api`

---

## Authentication & Headers
All protected routes require a Bearer token in the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Endpoints

### Register User & Organization
`POST /auth/register`
- **Access:** Public (Admin registration blocked)
- **Request Body:**
  ```json
  {
    "name": "Elena Rostova",
    "email": "provider@artisanbakery.demo",
    "password": "Password123!",
    "phone": "+1 555-0102",
    "role": "provider",
    "organizationName": "Artisan Oven Bakery & Cafe [DEMO]",
    "organizationType": "bakery",
    "address": "45 Baker Street, Metro City",
    "latitude": 40.7523,
    "longitude": -73.9912,
    "serviceAreaKm": 15,
    "maxCapacity": 150
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "67...a1",
      "name": "Elena Rostova",
      "email": "provider@artisanbakery.demo",
      "role": "provider",
      "organization": { ... }
    }
  }
  ```

### Sign In
`POST /auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "provider@artisanbakery.demo",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { ... }
  }
  ```

### Current User Profile
`GET /auth/me`
- **Access:** Protected

---

## 2. Organization Endpoints

### List Organizations
`GET /organizations`
- **Query Parameters:** `type`, `isVerified` (`true`/`false`), `search`, `page`, `limit`

### Update Organization Details
`PATCH /organizations/:id`
- **Access:** Protected (Org Creator or Admin)

### Verify Organization
`PATCH /organizations/:id/verify`
- **Access:** Admin only
- **Request Body:**
  ```json
  {
    "isVerified": true,
    "rejectionReason": null
  }
  ```

---

## 3. Surplus Food Donations

### Create Donation (Triggers AI Matching)
`POST /donations`
- **Access:** Protected (Provider, Admin)
- **Request Body:**
  ```json
  {
    "title": "Fresh Artisanal Sourdough Loaves",
    "category": "bakery",
    "description": "Daily unserved sourdough loaves, stored in dry ambient rack.",
    "quantity": 30,
    "unit": "kg",
    "preparationTime": "2026-10-12T16:00:00Z",
    "collectionDeadline": "2026-10-13T04:00:00Z",
    "storageConditions": "ambient",
    "dietaryType": "vegetarian",
    "pickupAddress": "45 Baker Street, Metro City",
    "latitude": 40.7523,
    "longitude": -73.9912,
    "pickupInstructions": "Loading dock entrance.",
    "contactPerson": "Elena Rostova",
    "contactPhone": "+1 555-0102",
    "foodSafetyDeclaration": {
      "isSafeForConsumption": true,
      "preparedUnderHygieneStandards": true,
      "temperatureMaintained": true
    }
  }
  ```

### List Donations
`GET /donations`
- **Query Parameters:** `status`, `category`, `dietaryType`, `providerOrg`, `acceptedBy`, `search`

### Cancel Donation
`PATCH /donations/:id/cancel`
- **Access:** Protected (Provider owner or Admin)

### Re-trigger AI Matching
`POST /donations/:id/match`
- **Access:** Protected

---

## 4. Recipient Matches

### List Matches
`GET /matches`
- **Access:** Protected

### Respond to Match Offer
`POST /matches/:id/respond`
- **Access:** Protected (Verified Recipient NGO only)
- **Request Body:**
  ```json
  {
    "action": "accept",
    "declineReason": null
  }
  ```
- **Response upon Acceptance (200 OK):**
  ```json
  {
    "success": true,
    "message": "Donation accepted successfully! Pickup and handover verification scheduled.",
    "match": { ... },
    "pickup": { ... },
    "verificationPin": "742918"
  }
  ```
  *Note: If action is `decline`, the platform automatically re-routes the donation offer to the next eligible recipient in the match queue.*

---

## 5. Pickups & Volunteer Management

### List Pickups
`GET /pickups`
- **Query Parameters:** `status`, `availableForVolunteers` (`true`/`false`)

### Update Pickup Status
`PATCH /pickups/:id/status`
- **Statuses:** `scheduled`, `volunteer_assigned`, `pickup_in_progress`, `picked_up`, `delivered`, `handover_verified`, `cancelled`

### Assign Volunteer
`POST /pickups/:id/volunteer`
- **Access:** Protected (Volunteer or Admin)

---

## 6. Secure Digital Handover Verification

### Initiate Handover Session & Generate PIN
`POST /handovers/initiate`
- **Access:** Protected (Authorized recipient or driver)
- **Request Body:** `{ "pickupId": "..." }`
- **Response:**
  ```json
  {
    "success": true,
    "verificationPin": "742918",
    "qrData": "{...}",
    "expiresAt": "2026-10-13T04:00:00Z"
  }
  ```

### Verify Cryptographic Handover PIN
`POST /handovers/verify`
- **Access:** Protected (Provider or Volunteer verifying recipient's PIN)
- **Request Body:**
  ```json
  {
    "pickupId": "...",
    "verificationCode": "742918"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Handover verified and food donation completed successfully!"
  }
  ```

---

## 7. Map & Navigation

### Map Entity Locations
`GET /map/locations`
- **Query Parameters:** `category`, `availability`, `maxDistance`, `userLat`, `userLng`

### Find Nearest Eligible NGOs
`GET /map/nearby-ngos`
- **Query Parameters:** `lat`, `lng`, `radiusKm`, `quantity`, `dietaryType`

### Road Routing Proxy (OSRM)
`POST /map/route`
- **Request Body:**
  ```json
  {
    "originLng": -73.9851,
    "originLat": 40.7488,
    "destLng": -73.9814,
    "destLat": 40.7431
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "isFallback": false,
    "distanceKm": 1.25,
    "durationMin": 5,
    "coordinates": [[-73.9851, 40.7488], ...],
    "summary": "Road route via OSRM (1.25 km, ~5 mins)"
  }
  ```

---

## 8. Platform Analytics & Admin

### Summary Analytics
`GET /analytics/summary`
- Aggregates meal estimates (portioned & kg FAO converted), active listings, completed handovers, and audit logs.

### Matching Weights Configuration
`GET /admin/settings` & `PATCH /admin/settings`
- Adjusts weights: `proximity` (0.40), `compatibility` (0.25), `capacity` (0.20), `availability` (0.15).
