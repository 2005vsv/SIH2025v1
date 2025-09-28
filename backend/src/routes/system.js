const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const { seedAcademicData } = require('../utils/seedAcademicData');
const SystemConfig = require('../models/SystemConfig');
const notificationService = require('../services/notificationService');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System configuration and management endpoints (Admin only)
 */

/**
 * @swagger
 * /api/system/config:
 *   get:
 *     summary: Get system configuration (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
                success:
                  type: boolean
                data:
                  type: object
                  properties:
                    app:
                      type: object
                    database:
                      type: object
                    security:
                      type: object
 */
router.get('/config', auth, authorize('admin'), async (req, res) => {
   try {
     const systemConfig = await SystemConfig.getConfig();

     const config = {
       app: {
         name: 'Student Portal',
         version: '1.0.0',
         environment: process.env.NODE_ENV,
         uptime: process.uptime(),
         maintenance: false
       },
       database: {
         status: 'connected',
         host: process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Local MongoDB',
         lastBackup: new Date(Date.now() - 86400000).toISOString()
       },
       security: {
         authEnabled: true,
         rateLimitEnabled: false,
         corsEnabled: true,
         lastSecurityUpdate: new Date().toISOString()
       },
       features: {
         chatbot: true,
         notifications: true,
         analytics: true,
         fileUpload: true
       },
       settings: systemConfig.toObject()
     };

     res.json({
       success: true,
       data: config
     });
   } catch (error) {
     res.status(500).json({
       success: false,
       message: 'Failed to retrieve system configuration',
       error: process.env.NODE_ENV === 'development' ? error : undefined
     });
   }
 });

/**
 * @swagger
 * /api/system/config:
 *   put:
 *     summary: Update system configuration (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               general:
 *                 type: object
 *               notifications:
 *                 type: object
 *               security:
 *                 type: object
 *               academic:
 *                 type: object
 *               fees:
 *                 type: object
 *               library:
 *                 type: object
 *     responses:
 *       200:
 *         description: System configuration updated successfully
 */
router.put('/config', auth, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;

    // Update the configuration
    const config = await SystemConfig.updateConfig(updates);

    // Check if notification settings were updated and send test notifications
    if (updates.notifications) {
      const oldConfig = await SystemConfig.getConfig();
      const oldNotifications = oldConfig.notifications || {};

      // Send test notifications for newly enabled channels
      if (updates.notifications.emailEnabled && !oldNotifications.emailEnabled) {
        await notificationService.sendSystemTestNotification('email');
      }
      if (updates.notifications.smsEnabled && !oldNotifications.smsEnabled) {
        await notificationService.sendSystemTestNotification('sms');
      }
      if (updates.notifications.pushEnabled && !oldNotifications.pushEnabled) {
        await notificationService.sendSystemTestNotification('push');
      }
    }

    res.json({
      success: true,
      message: 'System configuration updated successfully',
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update system configuration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
  * @swagger
  * /api/system/stats:
  *   get:
  *     summary: Get system statistics (Admin only)
  *     tags: [System]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: System statistics retrieved successfully
  */
 router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const stats = {
      users: {
        total,
        students,
        admins,
        faculty,
        active,
        newThisMonth: 45
      },
      system: {
        totalRequests,
        averageResponseTime: '245ms',
        errorRate: '0.2%',
        uptime: '99.8%'
      },
      storage: {
        totalSize: '2.4 GB',
        used: '1.8 GB',
        available: '0.6 GB',
        percentage: 75
      }
    };

    res.json({
      success,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: 'Failed to retrieve system statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/system/maintenance:
 *   post:
 *     summary: Enable/disable maintenance mode (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type
 *               message:
 *                 type
 *     responses:
 *       200:
 *         description: Maintenance mode updated successfully
 */
router.post('/maintenance', auth, authorize('admin'), async (req, res) => {
  try {
    const { enabled, message } = req.body;

    // In a real implementation, this would update a configuration store
    const maintenanceConfig = {
      enabled,
      message: message || 'System is under maintenance. Please try again later.',
      scheduledBy: req.user?.id,
      scheduledAt: new Date().toISOString()
    };

    res.json({
      success,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      data: maintenanceConfig
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: 'Failed to update maintenance mode',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/system/backup:
 *   post:
 *     summary: Trigger system backup (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup initiated successfully
 */
router.post('/backup', auth, authorize('admin'), async (req, res) => {
  try {
    // Mock backup process
    const backupId = `backup_${Date.now()}`;
    
    res.json({
      success,
      message: 'Backup initiated successfully',
      data: {
        backupId,
        status: 'initiated',
        estimatedTime: '5-10 minutes',
        startedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success,
      message: 'Failed to initiate backup',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/system/logs:
 *   get:
 *     summary: Get system logs (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type
 *           enum: [error, warn, info, debug]
 *         description: Log level filter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description of log entries to retrieve
 *     responses:
 *       200:
 *         description: System logs retrieved successfully
 */
router.get('/logs', auth, authorize('admin'), async (req, res) => {
  try {
    const { level, limit = 100 } = req.query;

    // Mock log entries
    const logs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'User logged in successfully',
        module: 'auth',
        userId: 'user123'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'error',
        message: 'Database connection timeout',
        module: 'database',
        error: 'Connection timeout after 5000ms'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'warn',
        message: 'High API response time detected',
        module: 'performance',
        responseTime: '2500ms'
      }
    ];

    const filteredLogs = level 
      ? logs.filter(log => log.level === level)
      :

    res.json({
      success,
      data: {
        logs: filteredLogs.slice(0, Number(limit)),
        total: filteredLogs.length,
        filters: { level, limit }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system logs',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * @swagger
 * /api/system/seed-academic:
 *   post:
 *     summary: Seed academic data for testing (Admin only)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic data seeded successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/seed-academic', auth, authorize('admin'), async (req, res) => {
  try {
    await seedAcademicData();

    res.json({
      success: true,
      message: 'Academic data seeded successfully',
      data: {
        seededAt: new Date().toISOString(),
        description: 'Sample semesters, courses, grades, and exams created for testing'
      }
    });
  } catch (error) {
    console.error('Seed academic data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed academic data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
