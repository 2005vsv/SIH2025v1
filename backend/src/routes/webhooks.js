const express = require('express');
const {
  handlePaymentWebhook,
  handleSMSWebhook,
  handleEmailWebhook,
  handleThirdPartyWebhook,
  getWebhookLogs
} = require('../controllers/webhookController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Webhooks
 *   description: Webhook endpoints for external integrations
 */

/**
 * @swagger
 * /api/webhooks/payment:
 *   post:
 *     summary: Handle payment gateway webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
              event:
                type: string
                example: payment.success
              data:
                type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/payment', handlePaymentWebhook);

/**
 * @swagger
 * /api/webhooks/sms:
 *   post:
 *     summary: Handle SMS gateway webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type
 *                 example: sms.received
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/sms', handleSMSWebhook);

/**
 * @swagger
 * /api/webhooks/email:
 *   post:
 *     summary: Handle email service webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type
 *                 example: email.delivered
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/email', handleEmailWebhook);

/**
 * @swagger
 * /api/webhooks/integration:
 *   post:
 *     summary: Handle third-party integration webhooks
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type
 *                 example: course.enrolled
 *               source:
 *                 type
 *                 example: lms
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post('/integration', handleThirdPartyWebhook);

/**
 * @swagger
 * /api/webhooks/logs:
 *   get:
 *     summary: Get webhook logs (admin only)
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: source
 *         schema:
 *           type
 *       - in: query
 *         name: event
 *         schema:
 *           type
 *     responses:
 *       200:
 *         description: Webhook logs retrieved successfully
 */
router.get('/logs', auth, authorize('admin'), getWebhookLogs);

// Legacy WhatsApp webhook (keeping for backward compatibility)
router.post('/whatsapp', (req, res) => {
  const { Body, From } = req.body;
  
  // Simple intent detection
  let response = 'Hello! How can I help you today?';
  
  if (Body?.toLowerCase().includes('fees')) {
    response = 'Your current fee status: Tuition - ₹50,000 due by Dec 31st. You can pay online through the portal.';
  } else if (Body?.toLowerCase().includes('hostel')) {
    response = 'Your hostel details: Room 201, Block A. Contact hostel office for any changes.';
  } else if (Body?.toLowerCase().includes('exam')) {
    response = 'Upcoming exams: Mathematics on Dec 15th, Physics on Dec 18th. Check the portal for detailed schedule.';
  }
  
  res.json({ success, message });
});

// Legacy Telegram webhook (keeping for backward compatibility)
router.post('/telegram', (req, res) => {
  const message = req.body.message;
  
  if (message) {
    const text = message.text?.toLowerCase() || '';
    let response = 'Hello! How can I help you today?';
    
    if (text.includes('fees')) {
      response = 'Your current fee status: Tuition - ₹50,000 due by Dec 31st.';
    } else if (text.includes('hostel')) {
      response = 'Your hostel details: Room 201, Block A.';
    } else if (text.includes('exam')) {
      response = 'Upcoming exams: Mathematics on Dec 15th, Physics on Dec 18th.';
    }
    
    res.json({ 
      method: 'sendMessage',
      chat_id: message.chat.id,
      text
    });
  } else {
    res.status(400).json({ success, message: 'Invalid request' });
  }
});

module.exports = router;
