const crypto = require('crypto');
const User = require('../models/User');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');

// Custom APIError class
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}
exports.APIError = APIError;

// Verify webhook signature
const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Payment gateway webhook (Razorpay/Stripe/etc.)
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || 'default-secret';

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const { event, data } = req.body;

    switch (event) {
      case 'payment.captured':
      case 'payment.success':
        await handlePaymentSuccess(data);
        break;
      case 'payment.failed':
        await handlePaymentFailure(data);
        break;
      case 'payment.refunded':
        await handlePaymentRefund(data);
        break;
      default:
        console.log(`Unhandled payment webhook event: ${event}`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle successful payment
const handlePaymentSuccess = async (paymentData) => {
  try {
    const { payment_id, order_id, amount, student_id, fee_type } = paymentData;

    // Find and update fee record
    const fee = await Fee.findOne({
      userId: student_id,
      feeType: fee_type,
      status: 'pending'
    });

    if (!fee) {
      throw new Error(`Fee record not found for student ${student_id} and type ${fee_type}`);
    }

    // Update fee status
    fee.status = 'paid';
    fee.transactionId = payment_id;
    fee.paidAt = new Date();
    fee.paymentMethod = 'online';
    await fee.save();

    // Create success notification
    await new Notification({
      userId: student_id,
      title: 'Payment Successful',
      message: `Your ${fee_type} payment of ₹${fee.amount} has been processed successfully.`,
      type: 'success',
      category: 'fee',
      priority: 'medium',
      actionUrl: '/fees',
      actionText: 'View Details',
      data: {
        paymentId: payment_id,
        orderId: order_id,
        amount: fee.amount,
        feeType: fee_type
      }
    }).save();

    console.log(`Payment successful for student ${student_id}, fee type ${fee_type}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
};

// Handle failed payment
const handlePaymentFailure = async (paymentData) => {
  try {
    const { payment_id, order_id, student_id, fee_type, error_description } = paymentData;

    // Create failure notification
    await new Notification({
      userId: student_id,
      title: 'Payment Failed',
      message: `Your ${fee_type} payment failed. ${error_description || 'Please try again.'}`,
      type: 'error',
      category: 'fee',
      priority: 'high',
      actionUrl: '/fees',
      actionText: 'Retry Payment',
      data: {
        paymentId: payment_id,
        orderId: order_id,
        feeType: fee_type,
        errorDescription: error_description
      }
    }).save();

    console.log(`Payment failed for student ${student_id}, fee type ${fee_type}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
};

// Handle payment refund
const handlePaymentRefund = async (paymentData) => {
  try {
    const { payment_id, refund_id, amount, student_id } = paymentData;

    // Find fee by payment ID
    const fee = await Fee.findOne({ transactionId: payment_id });

    if (fee) {
      // Update fee status back to pending (or set to 'refunded' if you have that status)
      fee.status = 'pending';
      await fee.save();

      // Create refund notification
      await new Notification({
        userId: student_id,
        title: 'Payment Refunded',
        message: `Your payment of ₹${amount / 100} has been refunded successfully.`,
        type: 'info',
        category: 'fee',
        priority: 'medium',
        actionUrl: '/fees',
        actionText: 'View Details',
        data: {
          paymentId: payment_id,
          refundId: refund_id,
          amount: amount / 100
        }
      }).save();
    }

    console.log(`Payment refunded for student ${student_id}`);
  } catch (error) {
    console.error('Error handling payment refund:', error);
    throw error;
  }
};

// SMS gateway webhook (Twilio/MSG91/etc.)
exports.handleSMSWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-sms-signature'];
    const webhookSecret = process.env.SMS_WEBHOOK_SECRET || 'default-secret';

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const { event, data } = req.body;

    switch (event) {
      case 'sms.delivered':
        console.log(`SMS delivered to ${data.to}: ${data.message_id}`);
        break;
      case 'sms.failed':
        console.log(`SMS failed to ${data.to}: ${data.error_description}`);
        break;
      case 'sms.received':
        await handleIncomingSMS(data);
        break;
      default:
        console.log(`Unhandled SMS webhook event: ${event}`);
    }

    res.status(200).json({ success: true, message: 'SMS webhook processed successfully' });
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle incoming SMS
const handleIncomingSMS = async (smsData) => {
  try {
    const { from, to, message, timestamp } = smsData;

    // Find user by phone number
    const user = await User.findOne({
      $or: [
        { 'profile.phone': from },
        { 'profile.parentPhone': from }
      ]
    });

    if (user) {
      // Create notification for incoming message
      await new Notification({
        userId: user._id,
        title: 'Message Received',
        message: `SMS received from ${from}: ${message}`,
        type: 'info',
        category: 'system',
        priority: 'low',
        data: {
          from,
          to,
          message,
          timestamp
        }
      }).save();

      // Process common commands
      const command = message.toLowerCase().trim();

      if (command.includes('fees') || command.includes('fee')) {
        await sendFeeStatusSMS(user._id.toString(), from);
      } else if (command.includes('attendance')) {
        await sendAttendanceStatusSMS(user._id.toString(), from);
      } else if (command.includes('help')) {
        await sendHelpSMS(from);
      }
    }

    console.log(`Incoming SMS processed from ${from}`);
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    throw error;
  }
};

// Send fee status via SMS
const sendFeeStatusSMS = async (userId, phoneNumber) => {
  try {
    const fees = await Fee.find({ userId }).limit(5);

    let message = 'Fee Status:\n';
    fees.forEach(fee => {
      message += `${fee.feeType}: ₹${fee.amount} - ${fee.status}\n`;
    });

    // Here you would integrate with your SMS service provider
    console.log(`Sending fee status SMS to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error('Error sending fee status SMS:', error);
  }
};

// Send attendance status via SMS
const sendAttendanceStatusSMS = async (userId, phoneNumber) => {
  try {
    // Here you would fetch attendance data and send SMS
    const message = 'Your current attendance: 85%. Keep it up!';

    console.log(`Sending attendance SMS to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error('Error sending attendance SMS:', error);
  }
};

// Send help SMS
const sendHelpSMS = async (phoneNumber) => {
  try {
    const message = 'Available commands:\n- FEES: Check fee status\n- ATTENDANCE: Check attendance\n- HELP: Show this help';

    console.log(`Sending help SMS to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error('Error sending help SMS:', error);
  }
};

// Email service webhook (SendGrid/Mailgun/etc.)
exports.handleEmailWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-email-signature'];
    const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET || 'default-secret';

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const { event, data } = req.body;

    switch (event) {
      case 'email.delivered':
        console.log(`Email delivered to ${data.to}: ${data.message_id}`);
        break;
      case 'email.bounced':
        console.log(`Email bounced for ${data.to}: ${data.reason}`);
        break;
      case 'email.opened':
        console.log(`Email opened by ${data.to}: ${data.message_id}`);
        break;
      case 'email.clicked':
        console.log(`Email link clicked by ${data.to}: ${data.url}`);
        break;
      default:
        console.log(`Unhandled email webhook event: ${event}`);
    }

    res.status(200).json({ success: true, message: 'Email webhook processed successfully' });
  } catch (error) {
    console.error('Email webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Third-party integration webhook (LMS/ERP/etc.)
exports.handleThirdPartyWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-integration-signature'];
    const webhookSecret = process.env.INTEGRATION_WEBHOOK_SECRET || 'default-secret';

    // Verify webhook signature
    const payload = JSON.stringify(req.body);
    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const { event, data, source } = req.body;

    switch (source) {
      case 'lms':
        await handleLMSWebhook(event, data);
        break;
      case 'erp':
        await handleERPWebhook(event, data);
        break;
      case 'library':
        await handleLibraryWebhook(event, data);
        break;
      default:
        console.log(`Unhandled third-party webhook from ${source}: ${event}`);
    }

    res.status(200).json({ success: true, message: 'Third-party webhook processed successfully' });
  } catch (error) {
    console.error('Third-party webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle LMS webhooks
const handleLMSWebhook = async (event, data) => {
  try {
    switch (event) {
      case 'course.enrolled':
        await handleCourseEnrollment(data);
        break;
      case 'assignment.submitted':
        await handleAssignmentSubmission(data);
        break;
      case 'grade.updated':
        await handleGradeUpdate(data);
        break;
      default:
        console.log(`Unhandled LMS event: ${event}`);
    }
  } catch (error) {
    console.error('Error handling LMS webhook:', error);
    throw error;
  }
};

// Handle ERP webhooks
const handleERPWebhook = async (event, data) => {
  try {
    switch (event) {
      case 'student.updated':
        await handleStudentUpdate(data);
        break;
      case 'fee.updated':
        await handleFeeUpdate(data);
        break;
      case 'attendance.marked':
        await handleAttendanceUpdate(data);
        break;
      default:
        console.log(`Unhandled ERP event: ${event}`);
    }
  } catch (error) {
    console.error('Error handling ERP webhook:', error);
    throw error;
  }
};

// Handle library webhooks
const handleLibraryWebhook = async (event, data) => {
  try {
    switch (event) {
      case 'book.issued':
        await handleBookIssued(data);
        break;
      case 'book.returned':
        await handleBookReturned(data);
        break;
      case 'book.overdue':
        await handleBookOverdue(data);
        break;
      default:
        console.log(`Unhandled library event: ${event}`);
    }
  } catch (error) {
    console.error('Error handling library webhook:', error);
    throw error;
  }
};

// Helper functions for specific webhook events
const handleCourseEnrollment = async (data) => {
  const { student_id, course_name, enrollment_date } = data;

  await new Notification({
    userId: student_id,
    title: 'Course Enrollment',
    message: `You have been enrolled in ${course_name}`,
    type: 'success',
    category: 'system',
    priority: 'medium',
    data
  }).save();
};

const handleAssignmentSubmission = async (data) => {
  const { student_id, assignment_name, course_name } = data;

  await new Notification({
    userId: student_id,
    title: 'Assignment Submitted',
    message: `Your assignment "${assignment_name}" for ${course_name} has been submitted successfully`,
    type: 'success',
    category: 'system',
    priority: 'low',
    data
  }).save();
};

const handleGradeUpdate = async (data) => {
  const { student_id, subject, grade, semester } = data;

  await new Notification({
    userId: student_id,
    title: 'Grade Updated',
    message: `Your grade for ${subject} (Semester ${semester}) has been updated: ${grade}`,
    type: 'info',
    category: 'exam',
    priority: 'medium',
    actionUrl: '/grades',
    actionText: 'View Grades',
    data
  }).save();
};

const handleStudentUpdate = async (data) => {
  const { student_id, updated_fields } = data;

  await new Notification({
    userId: student_id,
    title: 'Profile Updated',
    message: `Your profile information has been updated: ${updated_fields.join(', ')}`,
    type: 'info',
    category: 'system',
    priority: 'low',
    data
  }).save();
};

const handleFeeUpdate = async (data) => {
  const { student_id, fee_type, amount, due_date } = data;

  await new Notification({
    userId: student_id,
    title: 'Fee Update',
    message: `${fee_type} fee of ₹${amount} is due on ${new Date(due_date).toLocaleDateString()}`,
    type: 'warning',
    category: 'fee',
    priority: 'high',
    actionUrl: '/fees',
    actionText: 'Pay Now',
    data
  }).save();
};

const handleAttendanceUpdate = async (data) => {
  const { student_id, subject, attendance_percentage } = data;

  const type = attendance_percentage < 75 ? 'warning' : 'info';
  const priority = attendance_percentage < 75 ? 'high' : 'low';

  await new Notification({
    userId: student_id,
    title: 'Attendance Update',
    message: `Your attendance for ${subject} is now ${attendance_percentage}%`,
    type,
    category: 'system',
    priority,
    data
  }).save();
};

const handleBookIssued = async (data) => {
  const { student_id, book_title, issue_date, due_date } = data;

  await new Notification({
    userId: student_id,
    title: 'Book Issued',
    message: `"${book_title}" has been issued to you. Due date: ${new Date(due_date).toLocaleDateString()}`,
    type: 'success',
    category: 'library',
    priority: 'medium',
    actionUrl: '/library',
    actionText: 'View Books',
    data
  }).save();
};

const handleBookReturned = async (data) => {
  const { student_id, book_title, return_date } = data;

  await new Notification({
    userId: student_id,
    title: 'Book Returned',
    message: `"${book_title}" has been returned successfully`,
    type: 'success',
    category: 'library',
    priority: 'low',
    data
  }).save();
};

const handleBookOverdue = async (data) => {
  const { student_id, book_title, due_date, fine_amount } = data;

  await new Notification({
    userId: student_id,
    title: 'Book Overdue',
    message: `"${book_title}" is overdue (Due: ${new Date(due_date).toLocaleDateString()}). Fine: ₹${fine_amount}`,
    type: 'error',
    category: 'library',
    priority: 'high',
    actionUrl: '/library',
    actionText: 'Return Book',
    data
  }).save();
};

// Get webhook logs (admin only)
exports.getWebhookLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, source, event, startDate, endDate } = req.query;

    // This would typically query a webhook logs collection
    // For now, return mock data
    const logs = [
      {
        id: '1',
        source: 'payment',
        event: 'payment.success',
        timestamp: new Date(),
        status: 'processed',
        data: { payment_id: 'pay_123', amount: 5000 }
      }
    ];

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current: Number(page),
          pages: 1,
          total: logs.length
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};