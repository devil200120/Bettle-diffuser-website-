const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

// Send email function
exports.sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"Beetle Diffuser" <${process.env.SMTP_MAIL}>`,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
exports.sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #f9d423; margin: 0;">Verify Your Email</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Hello ${user.name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for registering with Beetle Diffuser! Please verify your email address by clicking the button below.
          This link will expire in 24 hours.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #f9d423; color: #1a1a2e; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #999; font-size: 12px; line-height: 1.6;">
          If you didn't create an account with Beetle Diffuser, please ignore this email.
        </p>
        <p style="color: #999; font-size: 12px;">
          Or copy and paste this link: <br>
          <a href="${verificationUrl}" style="color: #666;">${verificationUrl}</a>
        </p>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
        <p>© 2025 Beetle Diffuser. All rights reserved.</p>
      </div>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Beetle Diffuser',
    html
  });
};

exports.sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #f9d423; margin: 0;">Welcome to Beetle Diffuser!</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Hello ${user.name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for creating an account with Beetle Diffuser. 
          We're excited to have you on board!
        </p>
        <p style="color: #666; line-height: 1.6;">
          Explore our premium macro photography diffusers and take your photography to the next level.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}" 
             style="background: #f9d423; color: #1a1a2e; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Start Shopping
          </a>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
        <p>© 2025 Beetle Diffuser. All rights reserved.</p>
      </div>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Welcome to Beetle Diffuser!',
    html
  });
};

exports.sendOrderConfirmationEmail = async (order, email) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #f9d423; margin: 0;">Order Confirmed!</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Order #${order.orderNumber}</h2>
        <p style="color: #666;">Thank you for your order! We're processing it and will notify you when it ships.</p>
        
        <h3 style="color: #333; margin-top: 30px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Qty</th>
              <th style="padding: 10px; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₹${order.subtotal}</p>
          <p style="margin: 5px 0;"><strong>Tax:</strong> ₹${order.tax}</p>
          <p style="margin: 5px 0;"><strong>Shipping:</strong> ₹${order.shipping}</p>
          <p style="margin: 5px 0; font-size: 18px;"><strong>Total:</strong> ₹${order.totalAmount}</p>
        </div>
        
        <h3 style="color: #333; margin-top: 30px;">Shipping Address</h3>
        <p style="color: #666;">
          ${[order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(' ') || 'N/A'}<br>
          ${order.shippingAddress.street || ''}<br>
          ${[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode].filter(Boolean).join(', ')}<br>
          ${order.shippingAddress.country || 'N/A'}<br>
          ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ''}
        </p>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
        <p>© 2025 Beetle Diffuser. All rights reserved.</p>
      </div>
    </div>
  `;

  return this.sendEmail({
    to: email,
    subject: `Order Confirmation - #${order.orderNumber}`,
    html
  });
};

exports.sendContactConfirmationEmail = async (contact) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #f9d423; margin: 0;">Message Received!</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Hello ${contact.name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for contacting Beetle Diffuser. We have received your message and will get back to you within 24-48 hours.
        </p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${contact.subject}</p>
          <p style="margin: 5px 0;"><strong>Message:</strong></p>
          <p style="color: #666;">${contact.message}</p>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
        <p>© 2025 Beetle Diffuser. All rights reserved.</p>
      </div>
    </div>
  `;

  return this.sendEmail({
    to: contact.email,
    subject: 'We received your message - Beetle Diffuser',
    html
  });
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #f9d423; margin: 0;">Password Reset</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Hello ${user.name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          You requested a password reset. Click the button below to reset your password.
          This link will expire in 1 hour.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #f9d423; color: #1a1a2e; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #999; font-size: 12px;">
          If you didn't request this, please ignore this email.
        </p>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
        <p>© 2025 Beetle Diffuser. All rights reserved.</p>
      </div>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: 'Password Reset - Beetle Diffuser',
    html
  });
};

exports.sendAccountCreatedEmail = async (user, resetToken) => {
  const setPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
        <h1 style="color: #f9d423; margin: 0;">🎉 Account Created!</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Welcome ${user.name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          Great news! Your account has been automatically created during your purchase at Beetle Diffuser.
        </p>
        <p style="color: #666; line-height: 1.6;">
          <strong>Your account details:</strong><br>
          Email: ${user.email}<br>
          Phone: ${user.phone || 'Not provided'}
        </p>
        <p style="color: #666; line-height: 1.6;">
          To complete your account setup and be able to login, please set your password by clicking the button below.
          This link will expire in 7 days.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setPasswordUrl}" 
             style="background: #f9d423; color: #1a1a2e; padding: 15px 35px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Set Your Password
          </a>
        </div>
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
          <p style="color: #1e40af; margin: 0; font-size: 14px;">
            <strong>With your account you can:</strong><br>
            ✓ Track your orders<br>
            ✓ View order history<br>
            ✓ Faster checkout next time<br>
            ✓ Save your shipping addresses
          </p>
        </div>
        <p style="color: #999; font-size: 12px; line-height: 1.6;">
          If you don't want to set up an account, you can simply ignore this email. 
          Your order will still be processed normally.
        </p>
        <p style="color: #999; font-size: 12px;">
          Or copy and paste this link: <br>
          <a href="${setPasswordUrl}" style="color: #666;">${setPasswordUrl}</a>
        </p>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
        <p>© 2025 Beetle Diffuser. All rights reserved.</p>
      </div>
    </div>
  `;

  return this.sendEmail({
    to: user.email,
    subject: '🎉 Your Beetle Diffuser Account Has Been Created!',
    html
  });
};
