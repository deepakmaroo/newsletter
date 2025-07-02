const express = require('express');
const { body, validationResult } = require('express-validator');
const DatabaseAdapter = require('../utils/DatabaseAdapter');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const nodemailer = require('nodemailer');

const router = express.Router();
const db = new DatabaseAdapter();

// Get all newsletters (public)
router.get('/', async (req, res) => {
  try {
    const newsletters = await db.findPublishedNewsletters();
    res.json(db.formatArrayForClient(newsletters));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get newsletter by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const newsletter = await db.findNewsletterById(req.params.id);
    
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }
    
    res.json(db.formatIdForClient(newsletter));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all newsletters for admin
router.get('/admin/all', [auth, adminAuth], async (req, res) => {
  try {
    const newsletters = await db.findAllNewsletters();
    res.json(db.formatArrayForClient(newsletters));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create newsletter (admin only)
router.post('/', [
  auth,
  adminAuth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('excerpt').trim().isLength({ min: 1 }).withMessage('Excerpt is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, published } = req.body;

    const newsletterData = {
      title,
      content,
      excerpt,
      published: published || false,
      publishedAt: published ? new Date() : null
    };

    const newsletter = await db.createNewsletter(newsletterData);
    res.status(201).json(db.formatIdForClient(newsletter));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update newsletter (admin only)
router.put('/:id', [
  auth,
  adminAuth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
  body('excerpt').trim().isLength({ min: 1 }).withMessage('Excerpt is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, published } = req.body;
    
    let newsletter = await db.findNewsletterByIdForUpdate(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    // Prepare update data
    const updateData = {
      title,
      content,
      excerpt,
      published
    };

    // If publishing for the first time
    if (published && !newsletter.published) {
      updateData.publishedAt = new Date();
    }

    const updatedNewsletter = await db.updateNewsletter(req.params.id, updateData);
    res.json(db.formatIdForClient(updatedNewsletter));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete newsletter (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const newsletter = await db.findNewsletterByIdForUpdate(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    await db.deleteNewsletter(req.params.id);
    res.json({ message: 'Newsletter deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send newsletter to all subscribers (admin only)
router.post('/:id/send', [auth, adminAuth], async (req, res) => {
  try {
    const newsletter = await db.findNewsletterById(req.params.id);
    if (!newsletter || !newsletter.published) {
      return res.status(404).json({ message: 'Published newsletter not found' });
    }
    const subscribers = await db.findActiveSubscriptions();
    if (!subscribers.length) {
      return res.status(400).json({ message: 'No active subscribers to send to' });
    }

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Send email to each subscriber
    const sendResults = await Promise.allSettled(subscribers.map(sub =>
      transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: sub.email,
        subject: newsletter.title,
        text: newsletter.excerpt + '\n\n' + newsletter.content,
        html: `<h2>${newsletter.title}</h2><p>${newsletter.excerpt}</p><hr>${newsletter.content}`
      })
    ));

    const successCount = sendResults.filter(r => r.status === 'fulfilled').length;
    const failCount = sendResults.length - successCount;
    res.json({ message: `Newsletter sent to ${successCount} subscribers. Failed: ${failCount}` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to send newsletter' });
  }
});

module.exports = router;
