const crypto = require('crypto');
const nodemailer = require('nodemailer');

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isNotExpired(expiresAt) {
  return new Date() < expiresAt;
}

function getExpirationDate(hoursFromNow = 24) {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hoursFromNow);
  return expiration;
}

async function sendPrivacyVerificationEmail(email, requestType, token) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-privacy-request?token=${token}&type=${requestType}`;
    const actionText = {
      export: 'download your data',
      anonymize: 'anonymize your personal information',
      delete: 'delete your account and data'
    };

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Verify Your ${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request`,
      html: `
        <h2>Privacy Request Verification</h2>
        <p>You requested to ${actionText[requestType]}.</p>
        <p>To proceed, please click the link below:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify ${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request
        </a>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not make this request, you can safely ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending privacy verification email:', error);
    return false;
  }
}

async function sendConsentConfirmationEmail(email, consentType, token) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const confirmationUrl = `${process.env.CLIENT_URL}/confirm-consent?token=${token}&type=${consentType}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Confirm Your Consent Preferences',
      html: `
        <h2>Double Opt-In Confirmation</h2>
        <p>Please confirm your consent for ${consentType}.</p>
        <a href="${confirmationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Confirm Consent
        </a>
        <p>This link will expire in 48 hours.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending consent confirmation email:', error);
    return false;
  }
}

function formatDataForExport(subscriber) {
  const exported = { ...subscriber };
  delete exported.__v;
  delete exported.createdAt;
  delete exported.updatedAt;
  delete exported._id;
  return exported;
}

function anonymizeSubscriber(email) {
  const hashedEmail = crypto.createHash('sha256').update(email).digest('hex');
  return {
    email: `anonymized_${hashedEmail.substring(0, 12)}@anonymized.local`,
    isActive: false,
    anonymizedAt: new Date()
  };
}

async function logPrivacyAction({
  action,
  relatedEmail,
  adminUser = null,
  details = {},
  ipAddress = null,
  status = 'success',
  errorMessage = null
}) {
  try {
    const PrivacyAuditLog = require('../models/PrivacyAuditLog');

    const sanitizedDetails = { ...details };
    const sensitiveFields = ['password', 'token', 'userAgent'];
    sensitiveFields.forEach(field => {
      if (sanitizedDetails[field]) {
        sanitizedDetails[field] = '[REDACTED]';
      }
    });

    const auditLog = new PrivacyAuditLog({
      action,
      relatedEmail: relatedEmail ? relatedEmail.toLowerCase() : null,
      adminUser,
      details: sanitizedDetails,
      ipAddress,
      status,
      errorMessage
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error logging privacy action:', error);
  }
}

async function executeRetentionCleanup() {
  try {
    const RetentionPolicy = require('../models/RetentionPolicy');
    const PrivacyRequest = require('../models/PrivacyRequest');
    const Consent = require('../models/Consent');
    const PrivacyAuditLog = require('../models/PrivacyAuditLog');
    const Subscription = require('../models/Subscription');

    const policies = await RetentionPolicy.find({ active: true });
    const summary = {};

    for (const policy of policies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      switch (policy.dataType) {
        case 'inactive_subscription': {
          const result = await Subscription.deleteMany({
            isActive: false,
            unsubscribedAt: { $lt: cutoffDate }
          });
          summary[policy.name] = result.deletedCount || 0;
          break;
        }
        case 'unconfirmed_consent': {
          const result = await Consent.deleteMany({
            status: 'pending',
            createdAt: { $lt: cutoffDate }
          });
          summary[policy.name] = result.deletedCount || 0;
          break;
        }
        case 'privacy_request': {
          const result = await PrivacyRequest.updateMany(
            {
              status: 'pending',
              createdAt: { $lt: cutoffDate }
            },
            { status: 'expired' }
          );
          summary[policy.name] = result.modifiedCount || 0;
          break;
        }
        case 'audit_log': {
          const result = await PrivacyAuditLog.deleteMany({
            timestamp: { $lt: cutoffDate }
          });
          summary[policy.name] = result.deletedCount || 0;
          break;
        }
        default:
          break;
      }

      policy.lastExecuted = new Date();
      await policy.save();
    }

    return summary;
  } catch (error) {
    console.error('Error executing retention cleanup:', error);
    throw error;
  }
}

module.exports = {
  generateVerificationToken,
  hashToken,
  isNotExpired,
  getExpirationDate,
  sendPrivacyVerificationEmail,
  sendConsentConfirmationEmail,
  formatDataForExport,
  anonymizeSubscriber,
  logPrivacyAction,
  executeRetentionCleanup
};
