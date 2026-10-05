const express = require('express');
const { body, validationResult } = require('express-validator');
const DatabaseAdapter = require('../utils/DatabaseAdapter');
const {
  generateVerificationToken,
  hashToken,
  isNotExpired,
  getExpirationDate,
  sendPrivacyVerificationEmail,
  sendConsentConfirmationEmail,
  formatDataForExport,
  anonymizeSubscriber,
  logPrivacyAction
} = require('../utils/privacyUtils');
const {
  privacyEndpointLimiter,
  consentLimiter,
  verificationLimiter
} = require('../middleware/privacyRateLimit');

const router = express.Router();
const db = new DatabaseAdapter();
const Consent = require('../models/Consent');
const PrivacyRequest = require('../models/PrivacyRequest');

// ============= CONSENT MANAGEMENT =============

router.post('/consent', consentLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('consentType').isIn(['marketing', 'analytics', 'tracking', 'profiling']).withMessage('Invalid consent type'),
  body('policyVersion').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, consentType, policyVersion = '1.0.0' } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const existingConsent = await Consent.findOne({
      email,
      consentType,
      status: 'confirmed'
    });

    if (existingConsent) {
      return res.status(400).json({ message: 'Consent already confirmed for this type' });
    }

    const confirmationToken = generateVerificationToken();
    const hashedToken = hashToken(confirmationToken);

    const consent = new Consent({
      email,
      consentType,
      status: 'pending',
      policyVersion,
      confirmationToken: hashedToken,
      ipAddress,
      userAgent: req.get('user-agent')
    });

    await consent.save();
    await sendConsentConfirmationEmail(email, consentType, confirmationToken);

    await logPrivacyAction({
      action: 'consent_created',
      relatedEmail: email,
      details: { consentType, policyVersion },
      ipAddress,
      status: 'success'
    });

    res.status(201).json({
      message: 'Consent record created. Please check your email to confirm.',
      consentId: consent._id
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/consent/confirm', verificationLimiter, [
  body('token').notEmpty().withMessage('Verification token is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, email } = req.body;
    const hashedToken = hashToken(token);

    const consent = await Consent.findOne({
      email,
      confirmationToken: hashedToken,
      status: 'pending'
    });

    if (!consent) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    consent.status = 'confirmed';
    consent.confirmedAt = new Date();
    consent.confirmationToken = null;
    await consent.save();

    await logPrivacyAction({
      action: 'consent_confirmed',
      relatedEmail: email,
      details: { consentType: consent.consentType },
      ipAddress: req.ip
    });

    res.json({ message: 'Consent confirmed successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/consent/status/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const consents = await Consent.find({ email }).select('consentType status confirmedAt policyVersion');

    const consentMap = {};
    consents.forEach(c => {
      consentMap[c.consentType] = {
        status: c.status,
        confirmedAt: c.confirmedAt,
        policyVersion: c.policyVersion
      };
    });

    res.json({ email, consents: consentMap });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/consent/revoke', consentLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('consentType').isIn(['marketing', 'analytics', 'tracking', 'profiling']).withMessage('Invalid consent type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, consentType, reason } = req.body;
    const consent = await Consent.findOne({ email, consentType, status: 'confirmed' });
    if (!consent) {
      return res.status(404).json({ message: 'No active consent found' });
    }

    consent.status = 'revoked';
    consent.revokedAt = new Date();
    consent.revokeReason = reason || null;
    await consent.save();

    await logPrivacyAction({
      action: 'consent_revoked',
      relatedEmail: email,
      details: { consentType, reason },
      ipAddress: req.ip
    });

    res.json({ message: 'Consent revoked successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= PRIVACY REQUESTS =============

router.post('/request/export', privacyEndpointLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const existingRequest = await PrivacyRequest.findOne({
      email,
      requestType: 'export',
      status: { $in: ['pending', 'processing'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Export request already in progress' });
    }

    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);

    const request = new PrivacyRequest({
      email,
      requestType: 'export',
      status: 'pending',
      verificationToken: hashedToken,
      verificationExpires: getExpirationDate(24),
      ipAddress
    });

    await request.save();
    await sendPrivacyVerificationEmail(email, 'export', verificationToken);

    await logPrivacyAction({
      action: 'export_requested',
      relatedEmail: email,
      ipAddress,
      status: 'success'
    });

    res.status(201).json({
      message: 'Export request submitted. Please check your email to confirm.',
      requestId: request._id
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request/anonymize', privacyEndpointLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const existingRequest = await PrivacyRequest.findOne({
      email,
      requestType: 'anonymize',
      status: { $in: ['pending', 'processing'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Anonymization request already in progress' });
    }

    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);

    const request = new PrivacyRequest({
      email,
      requestType: 'anonymize',
      status: 'pending',
      verificationToken: hashedToken,
      verificationExpires: getExpirationDate(24),
      ipAddress
    });

    await request.save();
    await sendPrivacyVerificationEmail(email, 'anonymize', verificationToken);

    await logPrivacyAction({
      action: 'anonymize_requested',
      relatedEmail: email,
      ipAddress,
      status: 'success'
    });

    res.status(201).json({
      message: 'Anonymization request submitted. Please check your email to confirm.',
      requestId: request._id
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request/delete', privacyEndpointLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const existingRequest = await PrivacyRequest.findOne({
      email,
      requestType: 'delete',
      status: { $in: ['pending', 'processing'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Deletion request already in progress' });
    }

    const verificationToken = generateVerificationToken();
    const hashedToken = hashToken(verificationToken);

    const request = new PrivacyRequest({
      email,
      requestType: 'delete',
      status: 'pending',
      verificationToken: hashedToken,
      verificationExpires: getExpirationDate(24),
      ipAddress
    });

    await request.save();
    await sendPrivacyVerificationEmail(email, 'delete', verificationToken);

    await logPrivacyAction({
      action: 'delete_requested',
      relatedEmail: email,
      ipAddress,
      status: 'success'
    });

    res.status(201).json({
      message: 'Deletion request submitted. Please check your email to confirm.',
      requestId: request._id
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request/verify', verificationLimiter, [
  body('token').notEmpty().withMessage('Verification token is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, email } = req.body;
    const hashedToken = hashToken(token);

    const request = await PrivacyRequest.findOne({
      email,
      verificationToken: hashedToken,
      status: 'pending'
    });

    if (!request || !isNotExpired(request.verificationExpires)) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    request.status = 'processing';
    request.verifiedAt = new Date();
    request.verificationToken = null;

    try {
      switch (request.requestType) {
        case 'export': {
          const subscription = await db.findSubscriptionByEmail(email);
          const consents = await Consent.find({ email });
          const exportData = {
            subscription: subscription ? formatDataForExport(db.formatIdForClient(subscription)) : null,
            consents: consents.map(c => formatDataForExport(db.formatIdForClient(c))),
            exportedAt: new Date()
          };

          request.downloadUrl = `/api/privacy/download/${request._id}`;
          request.downloadExpires = getExpirationDate(48);
          request.status = 'completed';
          request.completedAt = new Date();

          await logPrivacyAction({
            action: 'export_completed',
            relatedEmail: email,
            details: { recordCount: Object.keys(exportData).length },
            ipAddress: req.ip
          });
          break;
        }
        case 'anonymize': {
          const subscription = await db.findSubscriptionByEmail(email);
          if (subscription) {
            const anonymized = anonymizeSubscriber(email);
            await db.updateSubscription(subscription, anonymized);
          }
          request.status = 'completed';
          request.completedAt = new Date();

          await logPrivacyAction({
            action: 'anonymize_completed',
            relatedEmail: email,
            ipAddress: req.ip
          });
          break;
        }
        case 'delete': {
          const subscription = await db.findSubscriptionByEmail(email);
          if (subscription) {
            await db.updateSubscription(subscription, { isActive: false });
          }

          request.status = 'completed';
          request.completedAt = new Date();

          await logPrivacyAction({
            action: 'delete_completed',
            relatedEmail: email,
            ipAddress: req.ip
          });
          break;
        }
      }
    } catch (processingError) {
      request.status = 'failed';
      await logPrivacyAction({
        action: `${request.requestType}_completed`,
        relatedEmail: email,
        ipAddress: req.ip,
        status: 'failure',
        errorMessage: processingError.message
      });
    }

    await request.save();

    res.json({
      message: `${request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} request completed`,
      requestId: request._id,
      downloadUrl: request.downloadUrl || undefined
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/request/status/:requestId', async (req, res) => {
  try {
    const request = await PrivacyRequest.findById(req.params.requestId).select('requestType status createdAt completedAt downloadExpires');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============= ADMIN ENDPOINTS =============

router.get('/admin/audit-logs', async (req, res) => {
  try {
    const PrivacyAuditLog = require('../models/PrivacyAuditLog');
    const { action, startDate, endDate, limit = 100 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await PrivacyAuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ count: logs.length, logs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/execute-retention-cleanup', async (req, res) => {
  try {
    const { executeRetentionCleanup } = require('../utils/privacyUtils');
    const summary = await executeRetentionCleanup();

    await logPrivacyAction({
      action: 'data_retention_cleanup',
      adminUser: req.user?.id || 'system',
      details: summary,
      status: 'success'
    });

    res.json({
      message: 'Retention cleanup executed',
      summary
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
