const Notification = require('../models/Notification');
const User = require('../models/User');

// Custom APIError class
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}
exports.APIError = APIError;

// Create notification (admin only)
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      category,
      recipientType,
      targetAudience,
      priority,
      actionUrl,
      actionText,
      data,
      expiresAt
    } = req.body;

    if (!title || !message || !type || !category) {
      throw new APIError('Title, message, type, and category are required', 400);
    }

    let recipients = [];

    // Determine recipients based on type
    if (recipientType === 'all') {
      const users = await User.find({ role: 'student' }).select('_id');
      recipients = users.map(u => ({ _id: u._id }));
    } else if (recipientType === 'department' && targetAudience?.department) {
      const users = await User.find({
        role: 'student',
        'profile.department': targetAudience.department
      }).select('_id');
      recipients = users.map(u => ({ _id: u._id }));
    } else if (recipientType === 'semester' && targetAudience?.semester) {
      const users = await User.find({
        role: 'student',
        'profile.semester': targetAudience.semester
      }).select('_id');
      recipients = users.map(u => ({ _id: u._id }));
    } else if (recipientType === 'specific' && req.body.recipients) {
      recipients = req.body.recipients.map((id) => ({ _id: id }));
    } else {
      throw new APIError('Invalid recipient configuration', 400);
    }

    // Create individual notifications for each recipient
    const notifications = await Promise.all(
      recipients.map(async (recipient) => {
        const notification = new Notification({
          userId: recipient._id,
          title,
          message,
          type,
          category,
          priority: priority || 'medium',
          actionUrl,
          actionText,
          data,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          createdBy: req.user && req.user.id
        });

        return await notification.save();
      })
    );

    res.status(201).json({
      success: true,
      message: `${notifications.length} notifications created successfully`,
      data: { count: notifications.length, notifications: notifications.slice(0, 5) }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get notifications for user
exports.getUserNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      isRead,
      type,
      category,
      priority,
      unreadOnly
    } = req.query;

    const userId = req.user && req.user.id;
    if (!userId) {
      throw new APIError('User ID required', 400);
    }

    const filter = {
      userId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all notifications (admin only)
exports.getAllNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      isRead,
      type,
      category,
      priority,
      userId
    } = req.query;

    const filter = {};
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (userId) filter.userId = userId;

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(filter)
      .populate('userId', 'name email profile.rollNumber')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user.id;

    const notification = await Notification.findById(id)
      .populate('createdBy', 'name email')
      .populate('userId', 'name email profile.rollNumber');

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    // Check if user has access to this notification
    if (req.user && req.user.role === 'student' && notification.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user.id;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID required' });
      return;
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    // Check if user is the recipient
    if (notification.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Update read status
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID required' });
      return;
    }

    const result = await Notification.updateMany(
      {
        userId,
        isRead: false,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete notification (admin only)
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update notification (admin only)
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notification = await Notification.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('userId', 'name email profile.rollNumber');

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Notification updated successfully',
      data: notification
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get notification statistics (admin only)
exports.getNotificationStats = async (req, res) => {
  try {
    const { period = 'month', type, category, userId } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let matchStage = {
      createdAt: { $gte: startDate }
    };

    if (type) matchStage.type = type;
    if (category) matchStage.category = category;
    if (userId) matchStage.userId = userId;

    // Total notifications sent
    const totalSent = await Notification.countDocuments(matchStage);

    // Total notifications read
    const totalRead = await Notification.countDocuments({
      ...matchStage,
      isRead: true
    });

    // Notifications by type
    const notificationsByType = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          readCount: {
            $sum: { $cond: ['$isRead', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Notifications by category
    const notificationsByCategory = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          readCount: {
            $sum: { $cond: ['$isRead', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Notifications by priority
    const notificationsByPriority = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          readCount: {
            $sum: { $cond: ['$isRead', 1, 0] }
          }
        }
      }
    ]);

    // Daily trends
    const dailyTrends = await Notification.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          readCount: {
            $sum: { $cond: ['$isRead', 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const stats = {
      period,
      totalSent,
      totalRead,
      readRate: totalSent > 0 ? (totalRead / totalSent) * 100 : 0,
      notificationsByType,
      notificationsByCategory,
      notificationsByPriority,
      dailyTrends
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Send bulk notifications (admin only)
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      throw new APIError('Notifications array is required', 400);
    }

    const createdNotifications = [];
    const errors = [];

    for (let i = 0; i < notifications.length; i++) {
      try {
        const {
          title,
          message,
          type,
          category,
          recipientType,
          targetAudience,
          priority,
          actionUrl,
          actionText,
          data
        } = notifications[i];

        if (!title || !message || !type || !category) {
          errors.push(`Row ${i + 1}, message, type, and category are required`);
          continue;
        }

        let recipients = [];

        // Determine recipients based on type
        if (recipientType === 'all') {
          const users = await User.find({ role: 'student' }).select('_id');
          recipients = users.map(u => ({ _id: u._id }));
        } else if (recipientType === 'department' && targetAudience?.department) {
          const users = await User.find({
            role: 'student',
            'profile.department': targetAudience.department
          }).select('_id');
          recipients = users.map(u => ({ _id: u._id }));
        } else if (recipientType === 'specific' && notifications[i].recipients) {
          recipients = notifications[i].recipients.map((id) => ({ _id: id }));
        } else {
          errors.push(`Row ${i + 1}: Invalid recipient configuration`);
          continue;
        }

        // Create individual notifications for each recipient
        const batchNotifications = await Promise.all(
          recipients.map(async (recipient) => {
            const notification = new Notification({
              userId: recipient._id,
              title,
              message,
              type,
              category,
              priority: priority || 'medium',
              actionUrl,
              actionText,
              data,
              createdBy: req.user && req.user.id
            });

            return await notification.save();
          })
        );

        createdNotifications.push(...batchNotifications);

      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Created ${createdNotifications.length} notifications successfully`,
      data: {
        created: createdNotifications.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get unread count for user
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID required' });
      return;
    }

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};