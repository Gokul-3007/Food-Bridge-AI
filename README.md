# FoodBridge AI — Intelligent Food Redistribution & Navigation Platform

FoodBridge AI is a full-stack, responsive web application connecting commercial food providers (restaurants, hotels, college canteens, bakeries, grocery stores) with verified recipient organizations (NGOs, shelters, community kitchens, food banks) and volunteer drivers to redistribute surplus edible food before its safe-use deadline.

---

## 🌟 Key Features

1. **Role-Based Portals & Access Control:**
   - **Food Providers:** Create surplus food listings, manage collection windows, certify mandatory food safety attestations, and view matching recipient queues.
   - **Recipient NGOs:** Real-time available surplus feed, capacity headroom monitoring, atomic acceptance, and automatic decline-cascade re-routing.
   - **Volunteers & Drivers:** Claim delivery assignments, view turn-by-turn road routes, and perform digital handovers.
   - **Administrators:** Review and approve/reject recipient NGOs, manage system audit logs, inspect aggregation metrics, and tune AI matching weights.

2. **Core Feature: Interactive OpenStreetMap Navigation:**
   - Dedicated **Live Map** with custom colored SVG marker pins for Providers (Amber), Available Food (Emerald), Verified NGOs (Blue), Shelters (Purple), and Volunteers.
   - **"Use My Location"** browser geolocation with manual search fallback.
   - Real road routing polyline, road distance (km), and travel duration (minutes) powered by **OSRM**.
   - **"Find Nearest NGO"** geospatial discovery tool based on distance, capacity, and dietary compatibility.
   - One-click external directions integration.

3. **Explainable AI Recipient Matching Engine:**
   - **FastAPI Python Service:** Evaluates candidates in 2 stages without opaque black boxes.
   - **Stage 1 Mandatory Eligibility Filters:** Unverified NGOs, expired deadlines, capacity deficits, and food safety attestation failures are immediately rejected.
   - **Stage 2 Weighted Scoring Formula:**
     $$\text{matchScore} = (0.40 \times \text{proximity}) + (0.25 \times \text{compatibility}) + (0.20 \times \text{capacity}) + (0.15 \times \text{availability})$$
   - Automatic cascade re-routing to the next ranked recipient if an NGO declines.

4. **Cryptographic Handover Verification:**
   - Cryptographically random 6-digit PIN generated upon acceptance.
   - Only the **SHA-256 hash** is persisted in the database with strict expiration.
   - Code verification prevents replay attacks and locks dual confirmation records.

5. **Real MongoDB Aggregations & Analytics:**
   - Aggregated portion counts and kilogram weights converted to estimated meals using documented FAO standards (1 portion = 1 meal; 1 kg = 2.5 meals).
   - Dynamic charts powered by **Recharts**.

---

## 🏗️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Leaflet, React-Leaflet, Lucide React, Recharts.
- **Backend API:** Node.js, Express.js, MongoDB, Mongoose, JWT authentication, bcryptjs, GeoJSON 2dsphere indexing, MongoMemoryServer fallback.
- **Matching Engine:** Python 3.11, FastAPI, Uvicorn, Pydantic, Pytest.
- **Geospatial & Routing:** Leaflet, OpenStreetMap tiles, OSRM routing engine, Nominatim geocoder.

---

## 🚀 Quick Start Guide (Windows & VS Code)

### Prerequisites
- **Node.js** v18+ (`node -v`)
- **Python** 3.10+ (`python --version`)
- **Git**

---

### Step 1: Install Dependencies

#### Backend:
```powershell
cd d:\SNS\backend
npm install
```

#### Frontend:
```powershell
cd d:\SNS\frontend
npm install
```

#### Python Matching Service:
```powershell
cd d:\SNS\matching-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
```

---

### Step 2: Seed the Database

The backend comes pre-configured with a resilient zero-config in-memory MongoDB fallback if no external MongoDB URI is provided.

To populate realistic demo providers, verified NGOs, test listings, and completed handovers:
```powershell
cd d:\SNS\backend
npm run seed
```

---

### Step 3: Run the Services

Open 3 terminal tabs in VS Code or PowerShell:

#### Terminal 1 — Express Backend API (Port 5000):
```powershell
cd d:\SNS\backend
npm start
```

#### Terminal 2 — React Frontend (Port 5173):
```powershell
cd d:\SNS\frontend
npm run dev
```

#### Terminal 3 — Python FastAPI Matching Service (Port 8000):
```powershell
cd d:\SNS\matching-service
.\venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Open your browser to: **`http://localhost:5173`**

---

## 👥 Pre-Configured Demo Accounts

All demo accounts share the password: **`Password123!`**

| Role | Account Name | Email | Highlights |
|---|---|---|---|
| **Administrator** | Platform Admin | `admin@foodbridge.org` | Verify NGOs, tune matching weights, audit logs |
| **Provider** | Chef Marco (Grand Regal Hotel) | `provider@regalhotel.demo` | Large prepared meals buffet surplus |
| **Provider** | Elena Rostova (Artisan Bakery) | `provider@artisanbakery.demo` | Daily artisanal bread & bakery batches |
| **Recipient NGO** | Sarah Jenkins (Hope Community Kitchen) | `ngo@hopekitchen.demo` | **Verified NGO** ready to accept offers |
| **Recipient NGO** | David Chen (Harbor Shelter & Food Bank) | `ngo@harborshelter.demo` | **Verified Shelter** with large capacity |
| **Recipient NGO** | Maya Lin (New Horizon Center) | `ngo@newhorizon.demo` | **Pending Verification** (test admin approval) |
| **Volunteer** | Alex Rivera | `volunteer@foodbridge.demo` | Claim delivery routes & verify PINs |

*Tip: The Login Page includes a convenient **One-Click Demo Account Picker** to test any role instantly.*

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests (Jest)
Covers registration, login, food safety validation, atomic acceptance concurrency, cryptographic handover hashing, and analytics:
```powershell
cd d:\SNS\backend
npm test
```
*Result: 16 passing integration tests.*

### Python Matching Engine Tests (Pytest)
Covers the 2-stage eligibility pipeline, explainable scoring weights, expiration exclusion, and safety gates:
```powershell
cd d:\SNS\matching-service
.\venv\Scripts\python -m pytest
```
*Result: 4 passing unit tests.*

---

## 📂 Project Structure

```
foodbridge-ai/
├── frontend/                 # React 18 + Vite + Tailwind CSS + Leaflet
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, Custom SVG Pin Markers
│   │   ├── context/          # AuthContext, NotificationContext
│   │   ├── layouts/          # DashboardLayout, PublicLayout
│   │   ├── pages/
│   │   │   ├── public/       # Landing, About, HowItWorks, FoodSafety, Login, Register
│   │   │   ├── provider/     # Dashboard, NewDonation, Listings, Detail, Pickups, History
│   │   │   ├── ngo/          # Dashboard, AvailableDonations, Matches, Pickups, Profile
│   │   │   ├── volunteer/    # Dashboard & Deliveries
│   │   │   ├── admin/        # Dashboard, VerifyOrganizations, Analytics, AuditLogs, Settings
│   │   │   └── MapPage.jsx   # Dedicated Interactive Leaflet & OSRM Map
│   │   └── services/         # Axios API Client
├── backend/                  # Node.js + Express + Mongoose + GeoJSON
│   ├── src/
│   │   ├── config/           # Database (Atlas / Memory Server fallback)
│   │   ├── controllers/      # Auth, Organizations, Donations, Matches, Pickups, Handover, Map, Admin
│   │   ├── middleware/       # JWT Auth, Role-Based Access, Error Handler
│   │   ├── models/           # User, Organization, Donation, Match, Pickup, Handover, Notification, AuditLog
│   │   ├── routes/           # Express REST Endpoints
│   │   ├── services/         # MatchingProxyService, RoutingService, NotificationService, AuditService
│   │   └── utils/            # Security (bcrypt, SHA-256 PIN), GeoJSON, Seed script
│   └── tests/                # Jest integration test suite
├── matching-service/         # Python 3.11 + FastAPI + Pydantic
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint (/api/match)
│   │   ├── schemas.py        # Pydantic request/response schemas
│   │   ├── scoring.py        # 40/25/20/15 Explainable scoring engine
│   │   ├── matching.py       # Stage 1 filters & Stage 2 ranking
│   │   └── tests/            # Pytest test suite
│   └── requirements.txt
├── docs/                     # API.md, ARCHITECTURE.md, DATABASE.md
├── .env.example
└── README.md
```

---

## 🌐 Production Deployment

- **Frontend:** Deploy to **Vercel** or **Netlify** with root directory `frontend` and build command `npm run build`. Set `VITE_API_BASE_URL` to your production backend URL.
- **Backend:** Deploy to **Render** with root directory `backend` and build command `npm install`. Set `MONGODB_URI`, `JWT_SECRET`, and `MATCHING_SERVICE_URL`.
- **Matching Service:** Deploy to **Render** (Python web service) with root directory `matching-service` and start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Database:** Connect to **MongoDB Atlas** cluster with `MONGODB_URI` connection string.

---

## 📜 License & Compliance
This software is provided under the MIT License and complies with Good Samaritan food donation guidelines and UN Sustainable Development Goals (SDG 2 & SDG 12).
