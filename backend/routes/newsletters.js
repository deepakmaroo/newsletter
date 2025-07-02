const express = require('express');
const { body, validationResult } = require('express-validator');
const DatabaseAdapter = require('../utils/DatabaseAdapter');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');
const { convert } = require('html-to-text');

const router = express.Router();
const db = new DatabaseAdapter();

// Helper to sanitize and convert HTML to text
function prepareNewsletterContent(html) {
  // Allow images, lists, inline styles, and basic formatting
  const cleanHtml = sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'img', 'br', 'span', 'div', 'hr', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'style'],
      '*': ['style', 'class'] // Allow class for all tags
    },
    allowedStyles: {
      '*': {
        // Allow only safe inline styles
        'color': [/^.*$/],
        'background-color': [/^.*$/],
        'text-align': [/^.*$/],
        'font-weight': [/^.*$/],
        'font-size': [/^.*$/],
        'font-family': [/^.*$/],
        'width': [/^.*$/],
        'height': [/^.*$/],
        'border': [/^.*$/],
        'margin': [/^.*$/],
        'padding': [/^.*$/],
        'display': [/^.*$/]
      }
    },
    allowedSchemes: ['http', 'https', 'data'],
    allowProtocolRelative: true
  });
  const text = convert(cleanHtml, { wordwrap: 100 });
  return { cleanHtml, text };
}

// Modern HTML email template
function getEmailHtmlTemplate({ title, content }) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { background: #f4f4f7; margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; }
      .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px; }
      h1, h2, h3 { color: #2d3748; }
      p, li { color: #4a5568; line-height: 1.7; }
      a { color: #3182ce; text-decoration: underline; }
      img { max-width: 100%; border-radius: 4px; }
      .footer { margin-top: 32px; font-size: 13px; color: #a0aec0; text-align: center; }
      /* Quill alignment and color styles */
      .ql-align-center { text-align: center; }
      .ql-align-right { text-align: right; }
      .ql-align-justify { text-align: justify; }
      .ql-align-left { text-align: left; }
      .ql-color-red { color: red; }
      .ql-color-blue { color: blue; }
      .ql-color-green { color: green; }
      .ql-color-black { color: black; }
      .ql-color-white { color: white; }
      .ql-color-yellow { color: #fff500; }
      .ql-color-orange { color: orange; }
      .ql-color-purple { color: purple; }
      .ql-color-pink { color: pink; }
      .ql-color-brown { color: #964B00; }
      .ql-color-gray { color: gray; }
      .ql-background-red { background-color: red; }
      .ql-background-blue { background-color: blue; }
      .ql-background-green { background-color: green; }
      .ql-background-black { background-color: black; }
      .ql-background-white { background-color: white; }
      .ql-background-yellow { background-color: #fff500; }
      .ql-background-orange { background-color: orange; }
      .ql-background-purple { background-color: purple; }
      .ql-background-pink { background-color: pink; }
      .ql-background-brown { background-color: #964B00; }
      .ql-background-gray { background-color: gray; }
      @media (max-width: 640px) { .container { padding: 16px 4px; } }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>${title}</h1>
      <div class="ql-editor" style="padding:0; background:transparent;">${content}</div>
      <div class="footer">
        You are receiving this email because you subscribed to our newsletter.<br>
        <a href="{{unsubscribeUrl}}">Unsubscribe</a>
      </div>
    </div>
  </body>
  </html>`;
}

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

    // Prepare sanitized HTML and plain text
    const { cleanHtml, text } = prepareNewsletterContent(newsletter.content);

    // Send email to each subscriber
    const sendResults = await Promise.allSettled(subscribers.map(sub =>
      transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: sub.email,
        subject: newsletter.title,
        text,
        html: getEmailHtmlTemplate({ title: newsletter.title, content: cleanHtml }).replace('{{unsubscribeUrl}}', `${process.env.BASE_URL || ''}/unsubscribe?email=${encodeURIComponent(sub.email)}`)
      })
    ));

    const failedEmails = sendResults
      .map((r, i) => (r.status === 'rejected' ? subscribers[i].email : null))
      .filter(Boolean);
    const successCount = sendResults.length - failedEmails.length;
    const failCount = failedEmails.length;
    res.json({
      message: `Newsletter sent to ${successCount} subscribers. Failed: ${failCount}`,
      failedEmails
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Failed to send newsletter' });
  }
});

// Send newsletter to a specific email (admin only)
router.post('/:id/test-send', [auth, adminAuth], async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const newsletter = await db.findNewsletterById(id);
    if (!newsletter || !newsletter.published) {
      return res.status(404).json({ message: 'Published newsletter not found' });
    }

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Prepare sanitized HTML and plain text
    const { cleanHtml, text } = prepareNewsletterContent(newsletter.content);

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: newsletter.title,
      text,
      html: getEmailHtmlTemplate({ title: newsletter.title, content: cleanHtml }).replace('{{unsubscribeUrl}}', `${process.env.BASE_URL || ''}/unsubscribe?email=${encodeURIComponent(email)}`)
    });

    res.json({ message: `Newsletter sent to ${email}` });
  } catch (error) {
    console.error('Failed to send newsletter to email', email, ':', error);
    res.status(500).json({ message: 'Failed to send newsletter to email' });
  }
});

module.exports = router;
