const express = require('express');
const Contact = require('../models/Contact');
const { validateContact, handleValidationErrors } = require('../middleware/validation');
const { sendContactConfirmationEmail, sendEmail } = require('../utils/emailService');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', validateContact, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Save contact message
    const contact = new Contact({
      name,
      email,
      subject,
      message
    });

    await contact.save();

    // Send confirmation email to user
    await sendContactConfirmationEmail(contact);

    // Send notification email to admin
    await sendEmail({
      to: process.env.SMTP_MAIL,
      subject: `📧 New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h2 style="color: #f9d423; margin: 0;">📧 New Contact Form Submission</h2>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-weight: bold;">Customer Details</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 12px; background: #f5f5f5; font-weight: bold; border-bottom: 1px solid #ddd; width: 30%;">Name:</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #f5f5f5; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #f5f5f5; font-weight: bold; border-bottom: 1px solid #ddd;">Subject:</td>
                <td style="padding: 12px; border-bottom: 1px solid #ddd;"><strong>${subject}</strong></td>
              </tr>
            </table>
            
            <div style="margin-top: 20px;">
              <p style="font-weight: bold; color: #333; margin-bottom: 10px;">Message:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; border-left: 4px solid #f9d423;">
                <p style="color: #333; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-radius: 4px; border: 1px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                💡 <strong>Action Required:</strong> Please respond to this customer inquiry within 24 hours.
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                 style="display: inline-block; background: #f9d423; color: #1a1a2e; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reply to Customer
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 15px; color: #666; font-size: 12px;">
            <p style="margin: 5px 0;">Beetle Diffuser - Contact Management System</p>
            <p style="margin: 5px 0;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
NEW CONTACT FORM SUBMISSION
===========================

Customer Details:
- Name: ${name}
- Email: ${email}
- Subject: ${subject}

Message:
${message}

---
Action Required: Please respond to this customer inquiry within 24 hours.
Reply directly to: ${email}

Timestamp: ${new Date().toLocaleString()}
Beetle Diffuser - Contact Management System
      `
    });

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
