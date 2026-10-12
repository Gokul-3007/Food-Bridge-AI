import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Organization type is required'],
      enum: [
        'restaurant',
        'hotel',
        'canteen',
        'bakery',
        'grocery',
        'ngo',
        'shelter',
        'community_kitchen',
        'food_bank'
      ]
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    serviceAreaKm: {
      type: Number,
      default: 15,
      min: 1
    },
    maxCapacity: {
      type: Number,
      default: 200, // standard portions/kg capacity
      min: 1
    },
    currentCapacityUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactPerson: {
      type: String,
      trim: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    operatingHours: {
      type: String,
      default: '08:00 - 22:00'
    },
    dietaryAccepted: {
      type: [String],
      default: ['vegetarian', 'vegan', 'non_vegetarian']
    },
    storageFacilities: {
      type: [String],
      default: ['ambient', 'refrigerated']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for geospatial location queries
organizationSchema.index({ location: '2dsphere' });
organizationSchema.index({ isVerified: 1, type: 1 });

export default mongoose.model('Organization', organizationSchema);
