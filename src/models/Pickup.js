import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    providerOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    recipientOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pickupAddress: {
      type: String,
      required: true
    },
    destinationAddress: {
      type: String,
      required: true
    },
    scheduledTime: {
      type: Date
    },
    collectionWindow: {
      start: { type: Date },
      end: { type: Date }
    },
    status: {
      type: String,
      enum: [
        'awaiting_acceptance',
        'accepted',
        'awaiting_scheduling',
        'scheduled',
        'volunteer_assigned',
        'pickup_in_progress',
        'picked_up',
        'delivered',
        'handover_verified',
        'cancelled'
      ],
      default: 'accepted'
    },
    instructions: {
      type: String,
      default: ''
    },
    routeInfo: {
      distanceKm: Number,
      durationMin: Number,
      geometry: Object // GeoJSON line or polyline coords
    },
    history: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: { type: String }
      }
    ],
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

pickupSchema.index({ donation: 1 });
pickupSchema.index({ volunteer: 1, status: 1 });
pickupSchema.index({ recipientOrg: 1, status: 1 });
pickupSchema.index({ providerOrg: 1, status: 1 });

export default mongoose.model('Pickup', pickupSchema);
