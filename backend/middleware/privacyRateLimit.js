const rateLimit = require('express-rate-limit');

const privacyEndpointLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many privacy requests from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false
});

const consentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many consent requests, please try again later'
});

const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many verification attempts, please try again after an hour'
});

module.exports = {
  privacyEndpointLimiter,
  consentLimiter,
  verificationLimiter
};
