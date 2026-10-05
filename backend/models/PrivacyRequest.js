const mongoose = require('mongoose');

const PrivacyRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  requestType: {
    type: String,
    enum: ['export', 'anonymize', 'delete'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  verificationToken: {
    type: String,
    required: true,
    index: true
  },
  verificationExpires: {
    type: Date,
    required: true
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  downloadUrl: {
    type: String,
    default: null
  },
  downloadExpires: {
    type: Date,
    default: null
  },
  reason: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PrivacyRequest', PrivacyRequestSchema);
