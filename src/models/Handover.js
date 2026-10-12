import mongoose from 'mongoose';

const handoverSchema = new mongoose.Schema(
  {
    pickup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pickup',
      required: true
    },
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true
    },
    recipientOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    verificationCodeHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    providerConfirmed: {
      type: Boolean,
      default: false
    },
    providerConfirmedAt: {
      type: Date
    },
    providerConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipientConfirmed: {
      type: Boolean,
      default: false
    },
    recipientConfirmedAt: {
      type: Date
    },
    recipientConfirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attemptCount: {
      type: Number,
      default: 0
    },
    isExpired: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

handoverSchema.index({ pickup: 1 });
handoverSchema.index({ donation: 1 });
handoverSchema.index({ expiresAt: 1, isVerified: 1 });

export default mongoose.model('Handover', handoverSchema);
