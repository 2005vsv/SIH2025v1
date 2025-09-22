import { Request, Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/roleCheck';
// import csv from 'csv-parser';
import { Transform } from 'stream';
import fs from 'fs';
import path from 'path';

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      role,
      isActive,
      department,
      semester,
    } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (department) query['profile.department'] = department;
    if (semester) query['profile.semester'] = parseInt(semester as string);

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: sort as string,
      populate: [],
      lean: false,
    };

    const users = await User.find(query)
      .sort(sort as string)
      .limit(options.limit * options.page)
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
          limit: options.limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get current user profile
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update current user profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get user by ID (Admin only)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update user (Admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Bulk import users from CSV (Admin only)
export const bulkImport = async (req: Request, res: Response): Promise<void> => {
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
      successful: [] as any[],
      failed: [] as any[],
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
      } catch (error: any) {
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
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Export users to CSV (Admin only)
export const bulkExport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, department, isActive } = req.query;
    
    const query: any = {};
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
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};