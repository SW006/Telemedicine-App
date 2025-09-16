const nodemailer = require('nodemailer');

// Initialize transporter variable
let transporter = null;

// Initialize SMTP transporter
const initializeTransporter = async () => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in .env');
      return false;
    }

    console.log('📧 Initializing SMTP email transporter');
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 15000, // Increased timeout
      socketTimeout: 20000,
      pool: true,
      maxConnections: 1,
      maxMessages: 5
    });
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP transporter initialized successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize SMTP transporter:', error.message);
    
    // Detailed error guidance
    if (error.code === 'EAUTH') {
      console.log('\n🔐 GMAIL SETUP INSTRUCTIONS:');
      console.log('1. Enable 2-factor authentication on your Gmail account');
      console.log('2. Generate an App Password: https://myaccount.google.com/apppasswords');
      console.log('3. Select "Mail" as the app and "Other" as the device');
      console.log('4. Use the generated 16-character password as GMAIL_PASS');
      console.log('5. Make sure SMTP_USER is your full email address');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      console.error('🌐 Network issue detected. Check:');
      console.error('- Internet connection');
      console.error('- Firewall settings (ports 465/587)');
      console.error('- Try different network');
    }
    
    transporter = null;
    return false;
  }
};

// Initialize transporter on module load
initializeTransporter();

// Verify Gmail connection
const verifyTransporter = async () => {
  if (!transporter) {
    console.error('❌ Transporter not initialized');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Gmail transporter is ready');
    return true;
  } catch (error) {
    console.error('❌ Gmail verification failed:', error.message);
    return false;
  }
};

// Send email function
const sendEmail = async (mailOptions, emailType = 'email') => {
  if (!transporter) {
    console.error(`❌ Cannot send ${emailType} - Gmail transporter not initialized`);
    return { success: false, error: 'Gmail not configured' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ ${emailType} sent to: ${mailOptions.to}`);
    console.log('📧 Message ID:', info.messageId);
    
    return { 
      success: true, 
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error(`❌ Failed to send ${emailType}:`, error.message);
    
    // Provide specific error details
    if (error.code === 'EAUTH') {
      console.error('🔐 Gmail authentication failed. Check your App Password');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Gmail connection timeout. Check your network');
    }
    
    return { 
      success: false, 
      error: error.message,
      details: 'Check Gmail credentials and internet connection'
    };
  }
};

// OTP Email
const sendOTPEmail = async (email, otp, name = 'User') => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your OTP Code - TeleTabib',
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 5px; }
                .otp-code { 
                    font-size: 32px; 
                    font-weight: bold; 
                    color: #007bff; 
                    text-align: center;
                    margin: 20px 0;
                    letter-spacing: 5px;
                }
                .footer { 
                    margin-top: 20px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>TeleTabib</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Your One-Time Password (OTP) for verification is:</p>
                    <div class="otp-code">${otp}</div>
                    <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2025 TeleTabib. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
  };

  return sendEmail(mailOptions, 'OTP email');
};

// Password Reset Email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset Request - TeleTabib',
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 5px; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #007bff; 
                    color: #ffffff; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }
                .footer { 
                    margin-top: 20px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset</h1>
                </div>
                <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>You requested to reset your password. Click the button below to proceed:</p>
                    <p style="text-align: center;">
                        <a href="${resetLink}" class="button" style="color: #ffffff;">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: rgba(247, 248, 248, 0);">${resetLink}</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© 2025 TeleTabib. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
  };

  return sendEmail(mailOptions, 'password reset email');
};

// Password Change Notification Email
const sendPasswordChangeNotification = async (email, name = 'User') => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your Password Has Been Changed - TeleTabib',
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #28a745; color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 5px; }
                .alert-box { 
                    background: #e8f5e8; 
                    border-left: 4px solid #28a745;
                    padding: 15px;
                    margin: 20px 0;
                }
                .footer { 
                    margin-top: 20px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 12px;
                }
                .support {
                    margin-top: 20px;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Changed Successfully</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    
                    <div class="alert-box">
                        <p><strong>This is a confirmation that your password for Medical Booking App was recently changed.</strong></p>
                    </div>
                    
                    <p>If you made this change, no further action is needed.</p>
                    
                    <p>If you did NOT change your password, please take immediate action:</p>
                    <ol>
                        <li>Reset your password using the "Forgot Password" feature</li>
                        <li>Check your account security settings</li>
                        <li>Contact our support team if you notice any suspicious activity</li>
                    </ol>
                    
                    <div class="support">
                        <p><strong>Need help?</strong></p>
                        <p>Contact our support team at: <a href="mailto:support@medicalbookingapp.com">support@medicalbookingapp.com</a></p>
                    </div>
                    
                    <p>Thank you for helping us keep your account secure.</p>
                </div>
                <div class="footer">
                    <p>© 2025 TeleTabib. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `
  };

  return sendEmail(mailOptions, 'password change notification');
};

// Welcome Email
const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || '"Medical Booking App" <noreply@medicalbooking.com>',
    to: user.email,
    subject: 'Welcome to TeleTabib',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: '#333'; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: '#28a745'; color: white; padding: 20px; text-align: center; }
              .content { background: '#f9f9f9'; padding: 30px; border-radius: 5px; }
              .footer { 
                  margin-top: 20px; 
                  text-align: center; 
                  color: '#666'; 
                  font-size: 12px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to TeleTabib</h1>
              </div>
              <div class="content">
                  <h2>Hello ${user.name},</h2>
                  <p>Welcome to our medical booking service! We're excited to have you on board.</p>
                  <p>You can now book appointments with doctors easily through our platform.</p>
                  <p>If you have any questions, feel free to contact our support team.</p>
              </div>
              <div class="footer">
                  <p>© 2025 TeleTabib. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `
  };

  return sendEmail(mailOptions, 'welcome email');
};

// Appointment Confirmation Email
const sendAppointmentConfirmation = async (user, appointment) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || '"Medical Booking App" <noreply@medicalbooking.com>',
    to: user.email,
    subject: 'Appointment Confirmation',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: '#333'; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: '#17a2b8'; color: white; padding: 20px; text-align: center; }
              .content { background: '#f9f9f9'; padding: 30px; border-radius: 5px; }
              .appointment-details { background: '#e9ecef'; padding: 15px; border-radius: 5px; }
              .footer { 
                  margin-top: 20px; 
                  text-align: center; 
                  color: '#666'; 
                  font-size: 12px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Appointment Confirmed</h1>
              </div>
              <div class="content">
                  <h2>Hello ${user.name},</h2>
                  <p>Your appointment has been successfully confirmed. Here are the details:</p>
                  
                  <div class="appointment-details">
                      <p><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
                      <p><strong>Date:</strong> ${appointment.date}</p>
                      <p><strong>Time:</strong> ${appointment.time}</p>
                      ${appointment.location ? `<p><strong>Location:</strong> ${appointment.location}</p>` : ''}
                  </div>
                  
                  <p>Please arrive 15 minutes before your scheduled time.</p>
                  <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
              </div>
              <div class="footer">
                  <p>© 2025 TeleTabib. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `
  };

  return sendEmail(mailOptions, 'appointment confirmation email');
};

// Test function
const testEmailConnection = async () => {
  console.log('🧪 Testing Gmail configuration...');
  return await verifyTransporter();
};

module.exports = { 
  sendOTPEmail, 
  sendPasswordResetEmail,
  sendPasswordChangeNotification,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  testEmailConnection,
  verifyTransporter
};