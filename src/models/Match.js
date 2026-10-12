import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    scoreBreakdown: {
      proximityScore: { type: Number, default: 0 },
      compatibilityScore: { type: Number, default: 0 },
      capacityScore: { type: Number, default: 0 },
      availabilityScore: { type: Number, default: 0 }
    },
    geographicDistanceKm: {
      type: Number,
      required: true
    },
    roadDistanceKm: {
      type: Number,
      default: null
    },
    roadDurationMin: {
      type: Number,
      default: null
    },
    eligibilityExplanation: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['offered', 'accepted', 'declined', 'expired'],
      default: 'offered'
    },
    offeredAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date
    },
    declineReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

matchSchema.index({ donation: 1, recipient: 1 });
matchSchema.index({ recipient: 1, status: 1 });

export default mongoose.model('Match', matchSchema);
