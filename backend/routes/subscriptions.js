const express = require('express');
const { body, validationResult } = require('express-validator');
const DatabaseAdapter = require('../utils/DatabaseAdapter');
const nodemailer = require('nodemailer');

const router = express.Router();
const db = new DatabaseAdapter();

// Subscribe to newsletter
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if already subscribed
    let subscription = await db.findSubscriptionByEmail(email);
    if (subscription && subscription.isActive) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    if (subscription && !subscription.isActive) {
      // Reactivate subscription
      subscription = await db.updateSubscription(subscription, {
        isActive: true,
        subscribedAt: new Date(),
        unsubscribedAt: null
      });
    } else {
      // Create new subscription
      subscription = await db.createSubscription({
        email,
        isActive: true
      });
    }

    // Send welcome email (optional)
    // await sendWelcomeEmail(email);

    res.status(201).json({ 
      message: 'Successfully subscribed to newsletter!',
      subscription: {
        email: subscription.email,
        subscribedAt: subscription.subscribedAt
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const subscription = await db.findSubscriptionByEmail(email);
    if (!subscription || !subscription.isActive) {
      return res.status(404).json({ message: 'Email not found in subscriptions' });
    }

    await db.updateSubscription(subscription, {
      isActive: false,
      unsubscribedAt: new Date()
    });

    res.json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subscription status
router.get('/status/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const subscription = await db.findSubscriptionByEmail(email);
    
    if (!subscription) {
      return res.json({ isSubscribed: false });
    }

    res.json({ 
      isSubscribed: subscription.isActive,
      subscribedAt: subscription.subscribedAt
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all subscriptions (admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const subscriptions = await db.findActiveSubscriptions();
    
    res.json({
      count: subscriptions.length,
      subscriptions: db.formatArrayForClient(subscriptions)
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to send welcome email
async function sendWelcomeEmail(email) {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Welcome to our Newsletter!',
      html: `
        <h1>Welcome!</h1>
        <p>Thank you for subscribing to our newsletter. You'll receive our latest updates and content directly in your inbox.</p>
        <p>If you no longer wish to receive these emails, you can unsubscribe at any time.</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

module.exports = router;
