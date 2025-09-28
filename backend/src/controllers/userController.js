const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all users (Admin only)
// Admin-only registration
const registerAdmin = async (req, res) => {
  try {
    // Allow registration if no admin exists, otherwise only admins can register new admins
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can register new admins',
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create admin user
    const user = new User({ name, email, password, role: 'admin' });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Admin-only password change
// Student password change
const changePassword = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can change their password',
      });
    }
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user || user.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student user not found',
      });
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
const changeAdminPassword = async (req, res) => {
  try {
    // Only allow admins to change their password
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can change admin password',
      });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found',
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Admin password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error occurred while changing admin password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      role,
      isActive,
      department,
      semester
    } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: { $regex: searchRegex, $options: 'i' } },
        { email: { $regex: searchRegex, $options: 'i' } },
        { studentId: { $regex: searchRegex, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (department) query['profile.department'] = department;
    if (semester) query['profile.semester'] = parseInt(semester);

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort
    };

    const users = await User.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create a new user (Admin only)
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Check if studentId is provided and already exists
    if (userData.studentId) {
      const existingStudentId = await User.findOne({ studentId: userData.studentId });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'User with this student ID already exists',
        });
      }
    }

    let user;
    try {
      user = new User(userData);
      await user.save();
    } catch (err) {
      console.error('User save error:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: err.message,
      });
    }

    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while creating user',
      error: error.message,
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates.isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update user by ID (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Hash password if it's being updated
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete user by ID (Admin only)
const deleteUser = async (req, res) => {
  const { logger } = require('../config/logger');
  try {
    const { id } = req.params;
    const admin = req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : null;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      logger.warn({
        event: 'user_delete_attempt',
        admin,
        targetUserId: id,
        result: 'not_found',
        timestamp: new Date().toISOString(),
      });
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    logger.info({
      event: 'user_deleted',
      admin,
      deletedUser: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error({
      event: 'user_delete_error',
      error: error.message,
      stack: error.stack,
      admin: req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : null,
      targetUserId: req.params.id,
      timestamp: new Date().toISOString(),
    });
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get users statistics (Admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const studentCount = await User.countDocuments({ role: 'student' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    const departmentStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$profile.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const semesterStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$profile.semester', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          students: studentCount,
          admins: adminCount,
        },
        departments: departmentStats,
        semesters: semesterStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Bulk import users from CSV (Admin only)
const bulkImport = async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users)) {
      res.status(400).json({
        success: false,
        message: 'Users array is required',
      });
      return;
    }

    const results = {
      successful: [],
      failed: [],
    };

    for (const userData of users) {
      try {
        // Generate a default password
        const defaultPassword = `student${Math.random().toString(36).substr(2, 8)}`;
        const user = new User({
          ...userData,
          password: defaultPassword,
        });
        await user.save();
        results.successful.push({
          email: user.email,
          name: user.name,
          studentId: user.studentId,
          defaultPassword, // Include in response for admin to share
        });
      } catch (error) {
        results.failed.push({
          userData,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.successful.length} users created, ${results.failed.length} failed.`,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to import users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Search users (Admin only)
const searchUsers = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
      });
    }

    const searchRegex = new RegExp(q, 'i');
    let query = {
      $or: [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { studentId: { $regex: searchRegex } },
      ]
    };

    if (type !== 'all') {
      query.role = type;
    }

    const users = await User.find(query)
      .select('-password')
      .limit(20)
      .sort('name');

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Export users to CSV (Admin only)
const bulkExport = async (req, res) => {
  try {
    const { role, department, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (department) query['profile.department'] = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password -__v')
      .lean();

    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No users found for export',
      });
      return;
    }

    // Convert to CSV format
    const csvData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId || '',
      department: user.profile?.department || '',
      semester: user.profile?.semester || '',
      phone: user.profile?.phone || '',
      isActive: user.isActive,
      createdAt: user.createdAt,
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');

    // Simple CSV generation
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};



// Password reset confirmation (using token)
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    // Find user by reset token and check expiry
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error occurred while resetting password',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getProfile,
  updateProfile,
  updateUser,
  deleteUser,
  getUserById,
  getUserStats,
  bulkImport,
  searchUsers,
  bulkExport,
  resetPassword,
  registerAdmin,
  changeAdminPassword,
  changePassword,
};