# FoodBridge AI — Database Schema Specification

## 1. Overview
The database layer is implemented using MongoDB with Mongoose ODM. Geospatial entities use GeoJSON `Point` objects indexed with MongoDB `2dsphere` indexes for high-performance proximity queries.

---

## 2. Collections & Schemas

### `User`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required, Trim | Full name of user |
| `email` | String | Required, Unique, Lowercase | User account email |
| `password` | String | Required, Select: false | bcrypt-hashed password |
| `phone` | String | Required | Contact phone |
| `role` | String | Enum: `provider`, `ngo`, `volunteer`, `admin` | User authorization role |
| `organization` | ObjectId | Ref: `Organization` | Linked organization |
| `isActive` | Boolean | Default: `true` | Account active state |

---

### `Organization`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `name` | String | Required | Organization title |
| `type` | String | Enum: `restaurant`, `hotel`, `canteen`, `bakery`, `grocery`, `ngo`, `shelter`, `community_kitchen`, `food_bank` | Type of establishment |
| `address` | String | Required | Physical address |
| `location` | GeoJSON Point | `{ type: 'Point', coordinates: [lng, lat] }` | 2dsphere indexed coordinates |
| `serviceAreaKm` | Number | Default: `15` | Maximum service radius |
| `maxCapacity` | Number | Default: `200` | Total portion/kg capacity |
| `currentCapacityUsed` | Number | Default: `0` | Active intake volume in use |
| `isVerified` | Boolean | Default: `false` (NGOs) | Administrator verification flag |
| `dietaryAccepted` | [String] | Array | Supported diets (`vegetarian`, `vegan`, `non_vegetarian`) |
| `storageFacilities` | [String] | Array | Storage facilities (`ambient`, `refrigerated`, `hot_holding`) |

**Indexes:**
- `location`: `2dsphere`
- `isVerified`: `1`, `type`: `1`

---

### `Donation`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `title` | String | Required | Food title summary |
| `category` | String | Enum: `prepared_meals`, `bakery`, `produce`, `dairy`, `packaged`, `beverages`, `canned` | Classification |
| `quantity` | Number | Required, Min: 0.1 | Surplus amount |
| `unit` | String | Enum: `portions`, `kg`, `boxes`, `liters` | Measurement unit |
| `preparationTime` | Date | Required | When food was prepared |
| `collectionDeadline` | Date | Required | Safe consumption cut-off |
| `storageConditions` | String | Enum: `ambient`, `refrigerated`, `frozen`, `hot_holding` | Storage mode |
| `dietaryType` | String | Enum: `vegetarian`, `vegan`, `non_vegetarian`, `any` | Dietary label |
| `location` | GeoJSON Point | 2dsphere indexed | Pickup location |
| `foodSafetyDeclaration` | Object | `{ isSafeForConsumption, preparedUnderHygieneStandards, temperatureMaintained, declaredAt }` | Mandatory safety attestation |
| `status` | String | Enum: `available`, `matching`, `reserved`, `accepted`, `scheduled`, `picked_up`, `completed`, `expired`, `cancelled` | Lifecycle status |
| `provider` | ObjectId | Ref: `User` | Listing creator |
| `providerOrg` | ObjectId | Ref: `Organization` | Commercial provider |
| `acceptedBy` | ObjectId | Ref: `Organization` | Recipient organization |
| `matchQueue` | Array | `[{ recipient, score, status, offeredAt, respondedAt }]` | Prioritized recipient queue |

**Indexes:**
- `location`: `2dsphere`
- `status`: `1`, `collectionDeadline`: `1`
- `providerOrg`: `1`, `status`: `1`
- `acceptedBy`: `1`, `status`: `1`

---

### `Match`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `donation` | ObjectId | Ref: `Donation` | Donation reference |
| `recipient` | ObjectId | Ref: `Organization` | Recipient organization |
| `score` | Number | 0 – 100 | Normalized match score |
| `scoreBreakdown` | Object | `{ proximityScore, compatibilityScore, capacityScore, availabilityScore }` | 4-factor breakdown |
| `geographicDistanceKm`| Number | | Haversine distance |
| `status` | String | Enum: `offered`, `accepted`, `declined`, `expired` | Offer status |

---

### `Pickup`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `donation` | ObjectId | Ref: `Donation` | Donation reference |
| `providerOrg` | ObjectId | Ref: `Organization` | Pickup origin |
| `recipientOrg` | ObjectId | Ref: `Organization` | Delivery destination |
| `volunteer` | ObjectId | Ref: `User` | Assigned volunteer driver |
| `status` | String | Enum: `awaiting_acceptance`, `accepted`, `awaiting_scheduling`, `scheduled`, `volunteer_assigned`, `pickup_in_progress`, `picked_up`, `delivered`, `handover_verified`, `cancelled` | Delivery stage |
| `scheduledTime` | Date | | Scheduled pickup time |
| `history` | Array | `[{ status, timestamp, updatedBy, note }]` | Audit tracking of state changes |

---

### `Handover`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `pickup` | ObjectId | Ref: `Pickup` | Linked pickup |
| `donation` | ObjectId | Ref: `Donation` | Linked donation |
| `verificationCodeHash`| String | Required | SHA-256 hash of 6-digit PIN |
| `expiresAt` | Date | Required | PIN validity window |
| `isVerified` | Boolean | Default: `false` | Verification state |
| `verifiedAt` | Date | | Verification timestamp |
| `verifiedBy` | ObjectId | Ref: `User` | User confirming code |
| `attemptCount` | Number | Default: `0`, Max: 5 | Brute-force throttling |
| `isExpired` | Boolean | Default: `false` | Invalidation flag |

---

### `Notification`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `recipientUser` | ObjectId | Ref: `User` | Targeted user |
| `recipientOrg` | ObjectId | Ref: `Organization` | Targeted organization |
| `role` | String | Enum: `provider`, `ngo`, `volunteer`, `admin`, `all` | Role-wide broadcast |
| `type` | String | Enum: `new_donation_offer`, `donation_accepted`, `donation_declined`, etc. | Alert type |
| `title` | String | Required | Notification heading |
| `message` | String | Required | Notification text |
| `isRead` | Boolean | Default: `false` | Read tracking |

---

### `AuditLog`
| Field | Type | Attributes | Description |
|---|---|---|---|
| `action` | String | Required | Action code |
| `performedBy` | ObjectId | Ref: `User` | User performing action |
| `entityType` | String | Enum: `User`, `Organization`, `Donation`, `Pickup`, `Handover`, `Match`, `System` | Target domain entity |
| `entityId` | String | | Target entity ID |
| `details` | Mixed | | Payload context |
| `timestamp` | Date | Default: `Date.now` | Event timestamp |
