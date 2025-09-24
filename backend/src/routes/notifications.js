const express = require('express');
const {
  createNotification,
  getUserNotifications,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updateNotification,
  getNotificationStats,
  sendBulkNotifications,
  getUnreadCount
} = require('../controllers/notificationController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - type
 *               - category
 *             properties:
              title:
                type: string
                example: "Fee Payment Reminder"
              message:
                type: string
                example: "Your tuition fee is due on December 31st"
              type:
                type: string
                enum: [info, success, warning, error, reminder, achievement]
              category:
                type: string
                enum: [system, fee, exam, library, hostel, placement, certificate, gamification]
              recipientType:
                type: string
                enum: [all, department, semester, specific]
              targetAudience:
                type: object
                properties:
                  department:
                    type: string
                  semester:
                    type: integer
              recipients:
                type: array
                items:
                  type: string
              priority:
                type: string
                enum: [low, medium, high, urgent]
                default: medium
              actionUrl:
                type: string
              actionText:
                type: string
              data:
                type: object
              expiresAt:
                type: string
                format: date-time
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', auth, authorize('admin'), createNotification);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Send bulk notifications (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notifications
 *             properties:
 *               notifications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type
 *                     message:
 *                       type
 *                     type:
 *                       type
 *                     category:
 *                       type
 *                     recipientType:
 *                       type
 *                     targetAudience:
 *                       type: object
 *                     priority:
 *                       type
 *     responses:
 *       200:
 *         description: Bulk notifications processed
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/bulk', auth, authorize('admin'), sendBulkNotifications);

/**
 * @swagger
 * /api/notifications/my:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
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
 *           default: 20
 *       - in: query
 *         name: isRead
 *         schema:
 *           type
 *       - in: query
 *         name: type
 *         schema:
 *           type
 *       - in: query
 *         name: category
 *         schema:
 *           type
 *       - in: query
 *         name: priority
 *         schema:
 *           type
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type
 *     responses:
 *       200:
 *         description: User notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', auth, getUserNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count for user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type
 *                 data:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', auth, getUnreadCount);

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Get notification statistics (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type
 *           enum: [week, month, year]
 *           default: month
 *       - in: query
 *         name: type
 *         schema:
 *           type
 *       - in: query
 *         name: category
 *         schema:
 *           type
 *       - in: query
 *         name: userId
 *         schema:
 *           type
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/stats', auth, authorize('admin'), getNotificationStats);

/**
 * @swagger
 * /api/notifications/all:
 *   get:
 *     summary: Get all notifications (admin only)
 *     tags: [Notifications]
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
 *           default: 20
 *       - in: query
 *         name: isRead
 *         schema:
 *           type
 *       - in: query
 *         name: type
 *         schema:
 *           type
 *       - in: query
 *         name: category
 *         schema:
 *           type
 *       - in: query
 *         name: priority
 *         schema:
 *           type
 *       - in: query
 *         name: userId
 *         schema:
 *           type
 *     responses:
 *       200:
 *         description: All notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/all', auth, authorize('admin'), getAllNotifications);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.patch('/mark-all-read', auth, markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Notification not found
 */
router.get('/:id', auth, getNotificationById);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', auth, markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Update notification (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type
 *               message:
 *                 type
 *               type:
 *                 type
 *               category:
 *                 type
 *               priority:
 *                 type
 *               actionUrl:
 *                 type
 *               actionText:
 *                 type
 *               data:
 *                 type: object
 *               expiresAt:
 *                 type
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Notification not found
 */
router.put('/:id', auth, authorize('admin'), updateNotification);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', auth, authorize('admin'), deleteNotification);

module.exports = router;
