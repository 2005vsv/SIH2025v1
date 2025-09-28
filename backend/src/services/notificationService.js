const Fee = require('../models/Fee');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const NotificationLog = require('../models/NotificationLog');
const HostelAllocation = require('../models/HostelAllocation');
const HostelRoom = require('../models/HostelRoom');
const emailService = require('./emailService');
const twilio = require('twilio');
const admin = require('firebase-admin');

class NotificationService {
  constructor() {
    // Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }

    // Firebase Admin SDK
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        this.firebaseEnabled = true;
      } catch (error) {
        console.error('Firebase initialization failed:', error);
        this.firebaseEnabled = false;
      }
    } else {
      this.firebaseEnabled = false;
    }
  }

  // Send due date reminders
  async sendDueDateReminders() {
    try {
      const now = new Date();
      const reminderDays = [7, 3, 1, 0]; // Days before due date to send reminders

      for (const days of reminderDays) {
        const reminderDate = new Date(now);
        reminderDate.setDate(reminderDate.getDate() + days);

        // Find fees due on this date that haven't been reminded recently
        const fees = await Fee.find({
          dueDate: {
            $gte: new Date(reminderDate.setHours(0, 0, 0, 0)),
            $lt: new Date(reminderDate.setHours(23, 59, 59, 999)),
          },
          status: { $in: ['pending', 'partial'] },
          $or: [
            { lastReminderSent: { $exists: false } },
            { lastReminderSent: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }, // Not reminded in last 24 hours
          ],
        }).populate('userId', 'name email phone studentId');

        for (const fee of fees) {
          await this.sendFeeReminder(fee, days);
        }
      }

      console.log('Due date reminders sent successfully');
    } catch (error) {
      console.error('Error sending due date reminders:', error);
    }
  }

  // Send individual fee reminder
  async sendFeeReminder(fee, daysUntilDue) {
    try {
      const user = fee.userId;
      if (!user) return;

      const reminderType = daysUntilDue === 0 ? 'urgent' : daysUntilDue <= 3 ? 'high' : 'medium';
      const reminderMessage = this.getReminderMessage(fee, daysUntilDue);

      // Create notification record
      const notification = new Notification({
        userId: user._id,
        title: `Fee Due ${daysUntilDue === 0 ? 'Today' : `in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}`,
        message: reminderMessage,
        type: 'warning',
        category: 'fee',
        priority: reminderType,
        actionUrl: '/student/fees',
        actionText: 'Pay Now',
        data: {
          feeId: fee._id,
          amount: fee.amount,
          dueDate: fee.dueDate,
          feeType: fee.feeType,
          daysUntilDue,
        },
        createdBy: null, // System generated
      });

      const savedNotification = await notification.save();

      // Send real-time notification via WebSocket
      if (global.io) {
        global.io.to(`user_${user._id}`).emit('notification', {
          id: savedNotification._id,
          title: savedNotification.title,
          message: savedNotification.message,
          type: savedNotification.type,
          category: savedNotification.category,
          priority: savedNotification.priority,
          actionUrl: savedNotification.actionUrl,
          actionText: savedNotification.actionText,
          data: savedNotification.data,
          createdAt: savedNotification.createdAt,
        });
      }

      // Send email notification
      if (user.email && this.isEmailConfigured()) {
        await this.sendEmailNotification(user.email, savedNotification);
      }

      // Send SMS notification for urgent reminders
      if (user.phone && reminderType === 'urgent' && this.isSmsConfigured()) {
        await this.sendSmsNotification(user.phone, savedNotification);
      }

      // Update last reminder sent
      await Fee.findByIdAndUpdate(fee._id, {
        lastReminderSent: new Date(),
        reminderCount: (fee.reminderCount || 0) + 1,
      });

    } catch (error) {
      console.error('Error sending fee reminder:', error);
    }
  }

  // Send payment confirmation notification
  async sendPaymentConfirmation(fee, transaction) {
    try {
      const user = await User.findById(fee.userId);
      if (!user) return;

      const notification = new Notification({
        userId: user._id,
        title: 'Payment Successful',
        message: `Your payment of ₹${transaction.amount} for ${fee.description} has been processed successfully.`,
        type: 'success',
        category: 'fee',
        priority: 'medium',
        actionUrl: '/student/fees',
        actionText: 'View Receipt',
        data: {
          feeId: fee._id,
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          paymentMethod: transaction.paymentMethod,
        },
        createdBy: null,
      });

      const savedNotification = await notification.save();

      // Send real-time notification
      if (global.io) {
        global.io.to(`user_${user._id}`).emit('notification', {
          id: savedNotification._id,
          title: savedNotification.title,
          message: savedNotification.message,
          type: savedNotification.type,
          category: savedNotification.category,
          priority: savedNotification.priority,
          actionUrl: savedNotification.actionUrl,
          actionText: savedNotification.actionText,
          data: savedNotification.data,
          createdAt: savedNotification.createdAt,
        });
      }

      // Send email confirmation
      if (user.email && this.isEmailConfigured()) {
        await this.sendEmailNotification(user.email, savedNotification);
      }

    } catch (error) {
      console.error('Error sending payment confirmation:', error);
    }
  }

  // Send overdue notifications
  async sendOverdueNotifications() {
    try {
      const overdueFees = await Fee.find({
        dueDate: { $lt: new Date() },
        status: { $in: ['pending', 'partial'] },
        $or: [
          { lastReminderSent: { $exists: false } },
          { lastReminderSent: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Not reminded in last 7 days
        ],
      }).populate('userId', 'name email phone studentId');

      for (const fee of overdueFees) {
        const daysOverdue = Math.floor((new Date() - fee.dueDate) / (1000 * 60 * 60 * 24));

        const notification = new Notification({
          userId: fee.userId._id,
          title: 'Fee Overdue',
          message: `Your fee of ₹${fee.amount} for ${fee.description} is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Please pay immediately to avoid penalties.`,
          type: 'error',
          category: 'fee',
          priority: 'urgent',
          actionUrl: '/student/fees',
          actionText: 'Pay Now',
          data: {
            feeId: fee._id,
            amount: fee.amount,
            dueDate: fee.dueDate,
            daysOverdue,
          },
          createdBy: null,
        });

        const savedNotification = await notification.save();

        // Send real-time notification
        if (global.io) {
          global.io.to(`user_${fee.userId._id}`).emit('notification', {
            id: savedNotification._id,
            title: savedNotification.title,
            message: savedNotification.message,
            type: savedNotification.type,
            category: savedNotification.category,
            priority: savedNotification.priority,
            actionUrl: savedNotification.actionUrl,
            actionText: savedNotification.actionText,
            data: savedNotification.data,
            createdAt: savedNotification.createdAt,
          });
        }

        // Send email for overdue fees
        if (fee.userId.email && this.isEmailConfigured()) {
          await this.sendEmailNotification(fee.userId.email, savedNotification);
        }

        // Update reminder tracking
        await Fee.findByIdAndUpdate(fee._id, {
          lastReminderSent: new Date(),
          reminderCount: (fee.reminderCount || 0) + 1,
          status: 'overdue', // Mark as overdue
        });
      }

      console.log(`Overdue notifications sent for ${overdueFees.length} fees`);
    } catch (error) {
      console.error('Error sending overdue notifications:', error);
    }
  }

  // Helper methods
  getReminderMessage(fee, daysUntilDue) {
    const amount = fee.amount - (fee.paidAmount || 0);
    const dueDate = fee.dueDate.toLocaleDateString();

    if (daysUntilDue === 0) {
      return `Your fee of ₹${amount} for ${fee.description} is due today (${dueDate}). Please make the payment to avoid penalties.`;
    } else if (daysUntilDue === 1) {
      return `Your fee of ₹${amount} for ${fee.description} is due tomorrow (${dueDate}). Please make the payment.`;
    } else {
      return `Your fee of ₹${amount} for ${fee.description} is due in ${daysUntilDue} days (${dueDate}). Please plan your payment.`;
    }
  }

  async sendEmailNotification(email, notification) {
    try {
      await emailService.sendNotificationEmail(email, notification);
    } catch (error) {
      console.error('Email notification error:', error);
    }
  }

  async sendSmsNotification(phone, notification) {
    try {
      if (!this.twilioClient) return;

      await this.twilioClient.messages.create({
        body: `${notification.title}: ${notification.message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
    } catch (error) {
      console.error('SMS notification error:', error);
    }
  }

  isEmailConfigured() {
    return emailService.isConfigured();
  }

  isSmsConfigured() {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
  }

  // Send system test notification to all users
  async sendSystemTestNotification(channel) {
    try {
      const User = require('../models/User');
      const users = await User.find({}).select('_id name email phone');

      const testMessage = `System notification: ${channel.toUpperCase()} notifications have been enabled successfully.`;

      const notification = {
        title: `${channel.toUpperCase()} Notifications Enabled`,
        message: testMessage,
        type: 'info',
        category: 'system',
        priority: 'medium',
        actionUrl: '/student/notifications',
        actionText: 'View Notifications'
      };

      let sentCount = 0;

      for (const user of users) {
        try {
          // Create notification record
          const Notification = require('../models/Notification');
          const savedNotification = await Notification.create({
            userId: user._id,
            ...notification,
            createdBy: null // System generated
          });

          // Send real-time notification
          if (global.io) {
            global.io.to(`user_${user._id}`).emit('notification', {
              id: savedNotification._id,
              title: savedNotification.title,
              message: savedNotification.message,
              type: savedNotification.type,
              category: savedNotification.category,
              priority: savedNotification.priority,
              actionUrl: savedNotification.actionUrl,
              actionText: savedNotification.actionText,
              createdAt: savedNotification.createdAt,
            });
          }

          // Send via specific channel
          if (channel === 'email' && user.email && this.isEmailConfigured()) {
            await this.sendEmailNotification(user.email, savedNotification);
            sentCount++;
          } else if (channel === 'sms' && user.phone && this.isSmsConfigured()) {
            await this.sendSmsNotification(user.phone, savedNotification);
            sentCount++;
          } else if (channel === 'push' && this.firebaseEnabled) {
            await this.sendPushNotification(user._id, savedNotification);
            sentCount++;
          }
        } catch (error) {
          console.error(`Error sending ${channel} notification to user ${user._id}:`, error);
        }
      }

      console.log(`System test notifications sent via ${channel}: ${sentCount} successful`);
      return sentCount;
    } catch (error) {
      console.error(`Error sending system ${channel} test notifications:`, error);
      return 0;
    }
  }

  // Send push notification (placeholder - needs Firebase implementation)
  async sendPushNotification(userId, notification) {
    try {
      if (!this.firebaseEnabled) return;

      // This would need proper Firebase token management
      // For now, just log that push notification would be sent
      console.log(`Push notification would be sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }
}

module.exports = new NotificationService();