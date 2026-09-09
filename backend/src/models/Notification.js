const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedIssue: {
      type: mongoose.Schema.ObjectId,
      ref: 'Issue',
      default: null
    }
  },
  { timestamps: true }
);

// Index to quickly fetch unread notifications for a user
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);