const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      console.log('🔧 Initializing email service...');

      // Check if SMTP is configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('❌ SMTP not configured. Email notifications will not work.');
        console.warn('📝 Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file');
        this.isConfigured = false;
        return;
      }

      console.log('✅ SMTP configuration found, setting up transporter...');

      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        // Additional options for better delivery
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });

      console.log('🔗 SMTP transporter created, verifying connection...');

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ SMTP connection failed:', error.message);
          this.isConfigured = false;
        } else {
          console.log('✅ SMTP server is ready to send emails');
          this.isConfigured = true;
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.isConfigured || !this.transporter) {
      throw new Error('Email service is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file');
    }

    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Student Portal'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: html,
        ...(text && { text: text })
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully via SMTP:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send email via SMTP:', error);
      throw error;
    }
  }

  async sendTestEmail(to) {
    const subject = 'Test Email - Student Portal Notification System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">🎓 Student Portal</h2>
          <p style="color: #666; margin: 5px 0 0 0;">Notification System Test</p>
        </div>

        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e9ecef;">
          <h3 style="color: #28a745; margin-top: 0;">✅ Email Notification Test Successful!</h3>

          <p style="color: #666; line-height: 1.6; margin: 20px 0;">
            This is a test email to verify that the Student Portal notification system is working correctly.
          </p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Test Details:</strong><br>
            • Email service: Configured and working<br>
            • Timestamp: ${new Date().toLocaleString()}<br>
            • Status: ✅ Active
          </div>

          <p style="color: #666; margin: 20px 0;">
            If you received this email, it means the notification system is properly configured and ready to send notifications to all users.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>This is an automated test message from Student Portal</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    `;

    return await this.sendEmail(to, subject, html);
  }

  async sendNotificationEmail(to, notification) {
    const subject = notification.title;
    const html = this.generateNotificationTemplate(notification);

    return await this.sendEmail(to, subject, html);
  }

  generateNotificationTemplate(notification) {
    const priorityColors = {
      urgent: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };

    const color = priorityColors[notification.priority] || '#007bff';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">🎓 Student Portal</h2>
          <p style="color: #666; margin: 5px 0 0 0;">Notification Alert</p>
        </div>

        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e9ecef;">
          <div style="display: inline-block; padding: 5px 15px; background-color: ${color}; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;">
            ${notification.priority || 'medium'} priority
          </div>

          <h3 style="color: #333; margin: 15px 0 20px 0;">${notification.title}</h3>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            ${notification.message}
          </div>

          ${notification.data ? `
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Additional Details:</strong><br>
              ${Object.entries(notification.data).map(([key, value]) =>
                `<span style="color: #666;">${key}: ${value}</span><br>`
              ).join('')}
            </div>
          ` : ''}

          ${notification.actionUrl ? `
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${notification.actionUrl}"
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                ${notification.actionText || 'View Details'}
              </a>
            </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
          <p>This is an automated notification from Student Portal</p>
          <p>Please do not reply to this email</p>
          <p>© ${new Date().getFullYear()} Student Portal. All rights reserved.</p>
        </div>
      </div>
    `;
  }

  isConfigured() {
    return this.isConfigured;
  }

  // Method to reconfigure transporter (useful for testing different SMTP settings)
  reconfigure(options) {
    try {
      this.transporter = nodemailer.createTransporter({
        host: options.host || process.env.SMTP_HOST,
        port: options.port || parseInt(process.env.SMTP_PORT) || 587,
        secure: options.secure !== undefined ? options.secure : (process.env.SMTP_SECURE === 'true' || false),
        auth: {
          user: options.user || process.env.SMTP_USER,
          pass: options.pass || process.env.SMTP_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      });

      this.isConfigured = true;
      console.log('Email transporter reconfigured successfully');
    } catch (error) {
      console.error('Failed to reconfigure email transporter:', error);
      this.isConfigured = false;
    }
  }
}

module.exports = new EmailService();