import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Food title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Food category is required'],
      enum: [
        'prepared_meals',
        'bakery',
        'produce',
        'dairy',
        'packaged',
        'beverages',
        'canned'
      ]
    },
    description: {
      type: String,
      required: [true, 'Food description is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than zero']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: ['portions', 'kg', 'boxes', 'liters'],
      default: 'portions'
    },
    preparationTime: {
      type: Date,
      required: [true, 'Preparation time is required']
    },
    collectionDeadline: {
      type: Date,
      required: [true, 'Permitted collection deadline is required']
    },
    storageConditions: {
      type: String,
      required: [true, 'Storage conditions are required'],
      enum: ['ambient', 'refrigerated', 'frozen', 'hot_holding'],
      default: 'ambient'
    },
    allergenInfo: {
      type: [String],
      default: []
    },
    dietaryType: {
      type: String,
      enum: ['vegetarian', 'vegan', 'non_vegetarian', 'any'],
      default: 'any'
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
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
    imageUrl: {
      type: String,
      default: ''
    },
    pickupInstructions: {
      type: String,
      trim: true
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person is required'],
      trim: true
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    specialHandlingRequirements: {
      type: String,
      trim: true
    },
    foodSafetyDeclaration: {
      isSafeForConsumption: {
        type: Boolean,
        required: [true, 'Safety confirmation is required']
      },
      preparedUnderHygieneStandards: {
        type: Boolean,
        required: [true, 'Hygiene declaration is required']
      },
      temperatureMaintained: {
        type: Boolean,
        required: [true, 'Temperature control confirmation is required']
      },
      declaredAt: {
        type: Date,
        default: Date.now
      }
    },
    status: {
      type: String,
      enum: [
        'available',
        'matching',
        'reserved',
        'accepted',
        'scheduled',
        'picked_up',
        'completed',
        'expired',
        'cancelled'
      ],
      default: 'available'
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    providerOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    currentMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    matchQueue: [
      {
        recipient: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Organization'
        },
        score: Number,
        status: {
          type: String,
          enum: ['pending', 'offered', 'declined', 'expired', 'accepted'],
          default: 'pending'
        },
        offeredAt: Date,
        respondedAt: Date,
        declineReason: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1, collectionDeadline: 1 });
donationSchema.index({ providerOrg: 1, status: 1 });
donationSchema.index({ acceptedBy: 1, status: 1 });

export default mongoose.model('Donation', donationSchema);
