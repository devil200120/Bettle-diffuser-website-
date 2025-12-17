const nodemailer = require('nodemailer');

// Google Workspace Email - Port 587 TLS
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'connect@beetlediffuser.com',
    pass: 'wzfj osfz oglf krwd'
  }
  
});

console.log('Testing SMTP connection (Google Workspace - Port 587)...\n');

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection Failed:', error.message);
    console.log('\nFull error:', error);
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful! Server is ready to send emails.\n');
    
    // Send a test email
    console.log('Sending test email...');
    transporter.sendMail({
      from: '"Beetle Diffuser" <connect@beetlediffuser.com>',
      to: 'connect@beetlediffuser.com',
      subject: 'Test Email - SMTP Configuration',
      html: '<h1>SMTP Test Successful!</h1><p>Your email configuration is working correctly.</p><p>Sent at: ' + new Date().toISOString() + '</p>'
    }).then(info => {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', info.messageId);
      process.exit(0);
    }).catch(err => {
      console.log('❌ Failed to send test email:', err.message);
      process.exit(1);
    });
  }
});
