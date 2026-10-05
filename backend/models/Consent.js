const mongoose = require('mongoose');

const ConsentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  consentType: {
    type: String,
    enum: ['marketing', 'analytics', 'tracking', 'profiling'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'revoked'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'email', 'api', 'import']
  },
  policyVersion: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  confirmationToken: {
    type: String,
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  revokedAt: {
    type: Date,
    default: null
  },
  revokeReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consent', ConsentSchema);
