const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { pool } = require('../db/pool');

// Initialize services
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && 
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio SMS service initialized');
  } else {
    console.log('ℹ️ Twilio SMS service disabled (credentials not configured)');
  }
} catch (error) {
  console.log('⚠️ Twilio initialization failed:', error.message);
  twilioClient = null;
}

// Create email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Email templates
const emergencyEmailTemplate = (data) => {
  const {
    patientName,
    alertType,
    severity,
    location,
    timestamp,
    emergencyId
  } = data;

  const severityColors = {
    low: '#fbbf24',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  };

  const alertTypeMessages = {
    medical: '🏥 Medical Emergency',
    fire: '🔥 Fire Emergency',
    police: '🚔 Police Emergency',
    general: '🚨 General Emergency',
    fall_detected: '🤕 Fall Detected',
    vitals_critical: '💗 Critical Vital Signs',
    panic: '😰 Panic Button Activated'
  };

  return {
    subject: `EMERGENCY ALERT: ${patientName} - ${alertTypeMessages[alertType] || 'Emergency'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emergency Alert</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background-color: ${severityColors[severity]}; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT 🚨</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">Immediate Attention Required</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px 20px;">
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0; color: #dc2626; font-size: 18px;">
                ${alertTypeMessages[alertType] || 'Emergency Alert'}
              </h2>
              <p style="margin: 0; color: #7f1d1d; font-weight: 500;">
                Severity Level: <span style="text-transform: uppercase; color: ${severityColors[severity]};">${severity}</span>
              </p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Emergency Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500; width: 120px;">Patient:</td>
                  <td style="padding: 8px 0; color: #374151; font-weight: 600;">${patientName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Time:</td>
                  <td style="padding: 8px 0; color: #374151;">${new Date(timestamp).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Location:</td>
                  <td style="padding: 8px 0; color: #374151;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Alert ID:</td>
                  <td style="padding: 8px 0; color: #6b7280; font-family: monospace;">${emergencyId}</td>
                </tr>
              </table>
            </div>
            
            <!-- Action buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/emergency/${emergencyId}" 
                 style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px;">
                View Emergency Details
              </a>
            </div>
            
            <!-- Important note -->
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Important:</strong> This is an automated emergency alert. If this is a genuine emergency, 
                please contact emergency services immediately. If this is a false alarm, please log into the 
                TeleTabib portal to update the alert status.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This alert was sent by TeleTabib Emergency System<br>
              © ${new Date().getFullYear()} TeleTabib. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
EMERGENCY ALERT - IMMEDIATE ATTENTION REQUIRED

Patient: ${patientName}
Alert Type: ${alertTypeMessages[alertType] || 'Emergency'}
Severity: ${severity.toUpperCase()}
Time: ${new Date(timestamp).toLocaleString()}
Location: ${location}
Emergency ID: ${emergencyId}

This is an automated emergency alert from TeleTabib. If this is a genuine emergency, please contact emergency services immediately.

View details at: ${process.env.FRONTEND_URL}/emergency/${emergencyId}
    `
  };
};

// SMS template
const emergencySMSTemplate = (data) => {
  const {
    patientName,
    alertType,
    severity,
    location,
    emergencyId
  } = data;

  const alertIcons = {
    medical: '🏥',
    fire: '🔥',
    police: '🚔',
    general: '🚨',
    fall_detected: '🤕',
    vitals_critical: '💗',
    panic: '😰'
  };

  return `🚨 EMERGENCY ALERT ${alertIcons[alertType] || '⚠️'}

Patient: ${patientName}
Type: ${alertType.replace('_', ' ').toUpperCase()}
Severity: ${severity.toUpperCase()}
Location: ${location}

${severity === 'critical' ? 'CALL 911 IMMEDIATELY!' : 'Immediate attention needed.'}

Details: ${process.env.FRONTEND_URL}/emergency/${emergencyId}

TeleTabib Emergency System`;
};

// Push notification payload
const emergencyPushTemplate = (data) => {
  const {
    patientName,
    alertType,
    severity
  } = data;

  const alertTypeMessages = {
    medical: 'Medical Emergency',
    fire: 'Fire Emergency',
    police: 'Police Emergency',
    general: 'General Emergency',
    fall_detected: 'Fall Detected',
    vitals_critical: 'Critical Vital Signs',
    panic: 'Panic Button Activated'
  };

  return {
    title: '🚨 EMERGENCY ALERT',
    body: `${patientName} - ${alertTypeMessages[alertType]} (${severity.toUpperCase()})`,
    icon: '/icons/emergency-icon.png',
    badge: '/icons/badge-icon.png',
    tag: 'emergency-alert',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'call_911',
        title: 'Call 911',
        icon: '/icons/call-icon.png'
      }
    ],
    data: {
      emergencyId: data.emergencyId,
      url: `${process.env.FRONTEND_URL}/emergency/${data.emergencyId}`
    },
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    sound: 'emergency-alert.mp3'
  };
};

// Main notification function
const sendEmergencyNotification = async (data) => {
  try {
    const {
      emergencyId,
      contactPhone,
      contactEmail,
      patientName,
      alertType,
      severity,
      location,
      timestamp
    } = data;

    const notificationPromises = [];
    const notificationResults = {
      sms: { success: false, error: null },
      email: { success: false, error: null },
      push: { success: false, error: null }
    };

    // Send SMS notification
    if (twilioClient && contactPhone) {
      const smsPromise = twilioClient.messages.create({
        body: emergencySMSTemplate(data),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: contactPhone
      }).then(() => {
        notificationResults.sms.success = true;
      }).catch((error) => {
        console.error('SMS sending failed:', error);
        notificationResults.sms.error = error.message;
      });
      
      notificationPromises.push(smsPromise);
    }

    // Send email notification
    if (contactEmail && emailTransporter) {
      const emailTemplate = emergencyEmailTemplate(data);
      
      const emailPromise = emailTransporter.sendMail({
        from: `"TeleTabib Emergency" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: contactEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      }).then(() => {
        notificationResults.email.success = true;
      }).catch((error) => {
        console.error('Email sending failed:', error);
        notificationResults.email.error = error.message;
      });
      
      notificationPromises.push(emailPromise);
    }

    // Send push notification (if user has push subscription)
    const pushNotificationPromise = sendPushNotification(
      patientName, 
      emergencyPushTemplate(data)
    ).then(() => {
      notificationResults.push.success = true;
    }).catch((error) => {
      console.error('Push notification failed:', error);
      notificationResults.push.error = error.message;
    });
    
    notificationPromises.push(pushNotificationPromise);

    // Wait for all notifications to complete
    await Promise.allSettled(notificationPromises);

    // Log notification attempts
    await pool.query(`
      INSERT INTO notification_logs (
        emergency_id, contact_phone, contact_email, 
        sms_status, email_status, push_status,
        sms_error, email_error, push_error, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [
      emergencyId, contactPhone, contactEmail,
      notificationResults.sms.success, 
      notificationResults.email.success,
      notificationResults.push.success,
      notificationResults.sms.error,
      notificationResults.email.error,
      notificationResults.push.error
    ]);

    return notificationResults;

  } catch (error) {
    console.error('Error sending emergency notifications:', error);
    throw error;
  }
};

// Send push notification to user's devices
const sendPushNotification = async (userId, payload) => {
  try {
    // Get user's push subscriptions
    const subscriptionsResult = await pool.query(`
      SELECT push_subscription FROM users 
      WHERE id = $1 AND push_subscription IS NOT NULL
    `, [userId]);

    if (subscriptionsResult.rows.length === 0) {
      return { success: false, error: 'No push subscriptions found' };
    }

    const webpush = require('web-push');
    
    // Configure web-push
    webpush.setVapidDetails(
      'mailto:' + process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const pushPromises = subscriptionsResult.rows.map(async (row) => {
      try {
        const subscription = JSON.parse(row.push_subscription);
        return webpush.sendNotification(subscription, JSON.stringify(payload));
      } catch (error) {
        console.error('Failed to send push notification:', error);
        throw error;
      }
    });

    await Promise.all(pushPromises);
    return { success: true };

  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
};

// Send appointment reminder
const sendAppointmentReminder = async (appointmentData) => {
  try {
    const {
      patientEmail,
      patientPhone,
      patientName,
      doctorName,
      appointmentTime,
      appointmentId
    } = appointmentData;

    const reminderEmailTemplate = {
      subject: `Appointment Reminder - TeleTabib`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Upcoming Appointment Reminder</h2>
          <p>Dear ${patientName},</p>
          <p>This is a reminder for your upcoming appointment:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date & Time:</strong> ${new Date(appointmentTime).toLocaleString()}</p>
            <p><strong>Appointment ID:</strong> ${appointmentId}</p>
          </div>
          <p>Please join the consultation 5 minutes before the scheduled time.</p>
          <a href="${process.env.FRONTEND_URL}/appointments/${appointmentId}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
            Join Consultation
          </a>
          <p>Best regards,<br>TeleTabib Team</p>
        </div>
      `,
      text: `
Appointment Reminder - TeleTabib

Dear ${patientName},

This is a reminder for your upcoming appointment:
- Doctor: ${doctorName}
- Date & Time: ${new Date(appointmentTime).toLocaleString()}
- Appointment ID: ${appointmentId}

Please join the consultation 5 minutes before the scheduled time.
Link: ${process.env.FRONTEND_URL}/appointments/${appointmentId}

Best regards,
TeleTabib Team
      `
    };

    const results = {};

    // Send email reminder
    if (patientEmail) {
      try {
        await emailTransporter.sendMail({
          from: `"TeleTabib" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: patientEmail,
          subject: reminderEmailTemplate.subject,
          html: reminderEmailTemplate.html,
          text: reminderEmailTemplate.text
        });
        results.email = { success: true };
      } catch (error) {
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS reminder
    if (twilioClient && patientPhone) {
      try {
        await twilioClient.messages.create({
          body: `Appointment reminder: ${doctorName} at ${new Date(appointmentTime).toLocaleString()}. Join: ${process.env.FRONTEND_URL}/appointments/${appointmentId} - TeleTabib`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: patientPhone
        });
        results.sms = { success: true };
      } catch (error) {
        results.sms = { success: false, error: error.message };
      }
    }

    return results;

  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    throw error;
  }
};

// Test notification services
const testNotificationServices = async () => {
  const testResults = {
    email: false,
    sms: false,
    push: false
  };

  try {
    // Test email
    if (emailTransporter) {
      const emailInfo = await emailTransporter.verify();
      testResults.email = emailInfo;
    }
  } catch (error) {
    console.error('Email service test failed:', error);
  }

  try {
    // Test SMS
    if (twilioClient) {
      const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      testResults.sms = account.status === 'active';
    }
  } catch (error) {
    console.error('SMS service test failed:', error);
  }

  try {
    // Test push notifications
    const webpush = require('web-push');
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      testResults.push = true;
    }
  } catch (error) {
    console.error('Push notification test failed:', error);
  }

  return testResults;
};

module.exports = {
  sendEmergencyNotification,
  sendPushNotification,
  sendAppointmentReminder,
  testNotificationServices,
  
  // Templates for external use
  templates: {
    emergencyEmailTemplate,
    emergencySMSTemplate,
    emergencyPushTemplate
  }
};