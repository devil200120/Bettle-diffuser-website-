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
        <h1 style="color: #f9d423; margin: 0;">🔐 Password Reset Request</h1>
      </div>
      <div style="padding: 30px; background: #fff;">
        <h2 style="color: #333;">Hello ${user.name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          We received a request to reset the password for your Beetle Diffuser account (${user.email}).
        </p>
        <p style="color: #666; line-height: 1.6;">
          Click the button below to create a new password. This secure link will expire in 1 hour for your security.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #f9d423; color: #1a1a2e; padding: 15px 35px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
            Reset Your Password
          </a>
        </div>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. 
            Your password will remain unchanged and your account is secure.
          </p>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          For security reasons, we cannot send you your existing password. 
          This link allows you to create a new one securely.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #666; word-break: break-all;">${resetUrl}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; line-height: 1.6;">
          If you have any questions or concerns, please contact us at connect@beetlediffuser.com
        </p>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999;">
        <p style="margin: 5px 0;">© 2025 Beetle Diffuser. All rights reserved.</p>
        <p style="margin: 5px 0; font-size: 12px;">Professional Macro Photography Equipment</p>
      </div>
    </div>
  `;

  const text = `
Hello ${user.name},

We received a request to reset the password for your Beetle Diffuser account (${user.email}).

Click the link below to create a new password. This secure link will expire in 1 hour for your security.

${resetUrl}

Security Note: If you didn't request this password reset, please ignore this email. Your password will remain unchanged and your account is secure.

For security reasons, we cannot send you your existing password. This link allows you to create a new one securely.

If you have any questions or concerns, please contact us at connect@beetlediffuser.com

© 2025 Beetle Diffuser. All rights reserved.
Professional Macro Photography Equipment
  `;

  return this.sendEmail({
    to: user.email,
    subject: '🔐 Reset Your Beetle Diffuser Password',
    html,
    text
  });
};

exports.sendOrderNotificationToOwner = async (order, customerEmail) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #f9d423; margin: 0;">🛒 New Order Received!</h2>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <div style="margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
          <p style="margin: 0; color: #1e40af; font-weight: bold; font-size: 18px;">Order #${order.orderNumber}</p>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">Placed on: ${new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        <h3 style="color: #333; margin-top: 20px; margin-bottom: 15px; border-bottom: 2px solid #f9d423; padding-bottom: 10px;">Customer Information</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold; width: 150px;">Name:</td>
            <td style="padding: 8px 0; color: #333;">${order.shippingAddress.name || [order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(' ') || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${customerEmail}" style="color: #3b82f6; text-decoration: none;">${customerEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0; color: #333;">${order.shippingAddress.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Payment:</td>
            <td style="padding: 8px 0; color: #333;">${order.paymentMethod?.toUpperCase() || 'COD'}</td>
          </tr>
        </table>

        <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #f9d423; padding-bottom: 10px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px; text-align: left; font-weight: bold; color: #333;">Product</th>
              <th style="padding: 12px; text-align: left; font-weight: bold; color: #333;">Qty</th>
              <th style="padding: 12px; text-align: left; font-weight: bold; color: #333;">Price</th>
              <th style="padding: 12px; text-align: left; font-weight: bold; color: #333;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 2px solid #e5e7eb;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #666; text-align: right;">Subtotal:</td>
              <td style="padding: 8px 0; color: #333; text-align: right; font-weight: bold; width: 120px;">${order.currency} ${order.subtotal}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; text-align: right;">Tax:</td>
              <td style="padding: 8px 0; color: #333; text-align: right; font-weight: bold;">${order.currency} ${order.tax}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; text-align: right;">Shipping:</td>
              <td style="padding: 8px 0; color: #333; text-align: right; font-weight: bold;">${order.currency} ${order.shipping}</td>
            </tr>
            <tr style="border-top: 2px solid #f9d423;">
              <td style="padding: 12px 0; color: #1a1a2e; text-align: right; font-size: 18px; font-weight: bold;">Total Amount:</td>
              <td style="padding: 12px 0; color: #16a34a; text-align: right; font-size: 20px; font-weight: bold;">${order.currency} ${order.totalAmount}</td>
            </tr>
          </table>
        </div>
        
        <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #f9d423; padding-bottom: 10px;">Shipping Address</h3>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="color: #333; line-height: 1.8; margin: 0;">
            <strong>${order.shippingAddress.name || [order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(' ') || 'N/A'}</strong><br>
            ${order.shippingAddress.street || ''}<br>
            ${[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode].filter(Boolean).join(', ')}<br>
            ${order.shippingAddress.country || 'N/A'}<br>
            ${order.shippingAddress.phone ? `📱 ${order.shippingAddress.phone}` : ''}
          </p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border: 2px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.6;">
            <strong>⚡ Action Required:</strong> Please process this order and prepare it for shipment. 
            Update the order status in the admin panel once the order is confirmed and shipped.
          </p>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.CLIENT_URL}/admin/orders/${order._id}" 
             style="display: inline-block; background: #f9d423; color: #1a1a2e; padding: 14px 40px; 
                    text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View Order in Admin Panel
          </a>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p style="margin: 5px 0;">Beetle Diffuser - Order Management System</p>
        <p style="margin: 5px 0;">This is an automated notification email</p>
      </div>
    </div>
  `;

  const text = `
NEW ORDER RECEIVED
==================

Order Number: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleString()}

CUSTOMER INFORMATION:
- Name: ${order.shippingAddress.name || [order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(' ') || 'N/A'}
- Email: ${customerEmail}
- Phone: ${order.shippingAddress.phone || 'Not provided'}
- Payment Method: ${order.paymentMethod?.toUpperCase() || 'COD'}

ORDER ITEMS:
${order.items.map(item => `- ${item.name} x ${item.quantity} = ${order.currency} ${item.price * item.quantity}`).join('\n')}

ORDER SUMMARY:
- Subtotal: ${order.currency} ${order.subtotal}
- Tax: ${order.currency} ${order.tax}
- Shipping: ${order.currency} ${order.shipping}
- Total Amount: ${order.currency} ${order.totalAmount}

SHIPPING ADDRESS:
${order.shippingAddress.name || [order.shippingAddress.firstName, order.shippingAddress.lastName].filter(Boolean).join(' ') || 'N/A'}
${order.shippingAddress.street || ''}
${[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zipCode].filter(Boolean).join(', ')}
${order.shippingAddress.country || 'N/A'}
${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ''}

---
Action Required: Please process this order and update the status in the admin panel.
View order: ${process.env.CLIENT_URL}/admin/orders/${order._id}

Beetle Diffuser - Order Management System
  `;

  return this.sendEmail({
    to: process.env.SMTP_MAIL,
    subject: `🛒 New Order #${order.orderNumber} - ${order.currency} ${order.totalAmount}`,
    html,
    text
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
