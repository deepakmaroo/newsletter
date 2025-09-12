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
  try {
    const response = await axios.post('https://api.opencaptcha.com/verify', {
      id: captchaId,
      value: captchaInput
    });
    return !!response.data.success;
  } catch (err) {
    console.error('OpenCaptcha verification error:', err.message);
    return false;
  }
}

module.exports = verifyCaptcha;
