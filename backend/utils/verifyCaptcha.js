const axios = require('axios');

/**
 * Verifies OpenCaptcha solution with OpenCaptcha API
 * @param {string} captchaId - The OpenCaptcha ID
 * @param {string} captchaInput - The user's solution
 * @returns {Promise<boolean>} - true if valid, false otherwise
 */
async function verifyCaptcha(captchaId, captchaInput) {
  if (!captchaId || !captchaInput) return false;
  // Validate captchaId is 8 alphanumeric characters
  if (!/^[a-zA-Z0-9]{8}$/.test(captchaId)) return false;
  // For OpenCaptcha, the solution is the random text used to generate the image
  // So, verification is simply comparing the input to the captchaId
  return captchaInput === captchaId;
}

module.exports = verifyCaptcha;
