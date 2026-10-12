import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipientOrg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    role: {
      type: String,
      enum: ['provider', 'ngo', 'volunteer', 'admin', 'all']
    },
    type: {
      type: String,
      required: true,
      enum: [
        'new_donation_offer',
        'donation_accepted',
        'donation_declined',
        'new_recipient_match',
        'pickup_scheduled',
        'pickup_reminder',
        'volunteer_assigned',
        'pickup_status_updated',
        'handover_awaiting_confirmation',
        'handover_completed',
        'donation_expired',
        'no_recipient_found',
        'organization_verified'
      ]
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    data: {
      donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
      pickupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pickup' },
      matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
      organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipientUser: 1, isRead: 1 });
notificationSchema.index({ recipientOrg: 1, isRead: 1 });
notificationSchema.index({ role: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
