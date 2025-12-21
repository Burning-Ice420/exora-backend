const nodemailer = require('nodemailer');
const config = require('../config/environment');

// Create transporter
const createTransporter = () => {
  // Use Gmail SMTP or any other service
  // For production, use environment variables
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Use Gmail with app password
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Development: Use Ethereal Email (fake SMTP for testing)
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass',
    },
  });
};

const generatePassHTML = (passData) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Activity Pass - Exora</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0a7ea4;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #0a7ea4;
      margin-bottom: 10px;
    }
    .pass-card {
      background: linear-gradient(135deg, #0a7ea4 0%, #08759a 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
    }
    .pass-id {
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 15px 0;
      font-family: 'Courier New', monospace;
    }
    .attendee-name {
      font-size: 20px;
      margin: 10px 0;
    }
    .activity-details {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    .detail-value {
      color: #333;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 14px;
    }
    .qr-placeholder {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">EXORA</div>
      <h1 style="margin: 0; color: #333;">Activity Confirmation</h1>
    </div>

    <p>Hi ${passData.attendeeName},</p>
    
    <p>Your booking for <strong>${passData.activityName}</strong> has been confirmed! 🎉</p>

    <div class="pass-card">
      <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">YOUR PASS</div>
      <div class="attendee-name">${passData.attendeeName}</div>
      <div class="pass-id">${passData.passId}</div>
      <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">
        Present this pass at the venue for entry
      </div>
    </div>

    <div class="activity-details">
      <div class="detail-row">
        <span class="detail-label">Activity:</span>
        <span class="detail-value">${passData.activityName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date:</span>
        <span class="detail-value">${passData.date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time:</span>
        <span class="detail-value">${passData.time}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${passData.location}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Amount Paid:</span>
        <span class="detail-value">₹${passData.amount.toLocaleString('en-IN')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Pass ID:</span>
        <span class="detail-value" style="font-family: 'Courier New', monospace;">${passData.passId}</span>
      </div>
    </div>

    <div class="qr-placeholder">
      <p style="margin: 0; font-size: 12px; color: #666;">
        📱 Show this email or the Pass ID at the venue for verification
      </p>
    </div>

    <p style="margin-top: 30px;">
      <strong>Important:</strong> Please save this email and bring a valid ID to the venue. 
      Your Pass ID (${passData.passId}) will be used for verification.
    </p>

    <p>We're excited to have you join us! If you have any questions, feel free to reach out.</p>

    <div class="footer">
      <p>Happy Travels! ✈️</p>
      <p style="margin: 5px 0;"><strong>Exora Team</strong></p>
      <p style="margin: 5px 0; font-size: 12px;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};

const sendActivityPassEmail = async (passData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Exora" <${process.env.GMAIL_USER || 'noreply@exora.in'}>`,
      to: passData.attendeeEmail,
      subject: `Your Pass for ${passData.activityName} - Exora`,
      html: generatePassHTML(passData),
      text: `
Hi ${passData.attendeeName},

Your booking for ${passData.activityName} has been confirmed!

PASS DETAILS:
- Pass ID: ${passData.passId}
- Name: ${passData.attendeeName}
- Activity: ${passData.activityName}
- Date: ${passData.date}
- Time: ${passData.time}
- Location: ${passData.location}
- Amount Paid: ₹${passData.amount.toLocaleString('en-IN')}

Please present this Pass ID (${passData.passId}) at the venue for entry.

Happy Travels!
Exora Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendActivityPassEmail,
};


