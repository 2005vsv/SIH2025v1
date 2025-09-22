import { Response } from 'express';
import { Badge, IBadge, GamificationPoint, IGamificationPoint, UserBadge, IUserBadge } from '../models/Gamification';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../types';

export class APIError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

// Get user gamification profile
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.role === 'student' ? req.user.id : req.params.userId;

    if (!userId) {
      throw new APIError('User ID required', 400);
    }

    // Get user's points
    const points = await GamificationPoint.find({ userId })
      .sort({ createdAt: -1 })
      .populate('badgeId', 'name description icon');

    // Get user's badges
    const badges = await UserBadge.find({ userId })
      .populate('badgeId', 'name description icon category rarity')
      .sort({ earnedAt: -1 });

    // Calculate total points
    const totalPoints = points.reduce((sum, point) => sum + (point.points * point.multiplier), 0);

    // Calculate level (100 points per level)
    const currentLevel = Math.floor(totalPoints / 100) + 1;

    // Get recent activities
    const recentActivities = points.slice(0, 10);

    const profile = {
      userId,
      totalPoints,
      currentLevel,
      badgeCount: badges.length,
      badges: badges.slice(0, 5), // Show recent 5 badges
      recentActivities,
      pointsToNextLevel: 100 - (totalPoints % 100)
    };

    res.json({
      success: true,
      data: profile
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Add points to user
export const addPoints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, points, type, description, relatedEntity, multiplier = 1 } = req.body;

    if (!userId || !points || !type) {
      throw new APIError('User ID, points, and type are required', 400);
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError('User not found', 404);
    }

    const gamificationPoint = new GamificationPoint({
      userId,
      type,
      points,
      description: description || `Earned ${points} points for ${type}`,
      relatedEntity,
      multiplier,
      awardedBy: req.user?.id
    });

    await gamificationPoint.save();

    // Calculate new total points
    const allPoints = await GamificationPoint.find({ userId });
    const totalPoints = allPoints.reduce((sum, point) => sum + (point.points * point.multiplier), 0);
    const newLevel = Math.floor(totalPoints / 100) + 1;

    res.json({
      success: true,
      message: 'Points added successfully',
      data: {
        pointsAdded: points * multiplier,
        totalPoints,
        currentLevel: newLevel,
        gamificationPoint
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Award badge
export const awardBadge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, badgeId } = req.body;

    if (!userId || !badgeId) {
      throw new APIError('User ID and badge ID are required', 400);
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Verify badge exists
    const badge = await Badge.findById(badgeId);
    if (!badge) {
      throw new APIError('Badge not found', 404);
    }

    // Check if badge already awarded
    const existingBadge = await UserBadge.findOne({ userId, badgeId });
    if (existingBadge) {
      throw new APIError('Badge already awarded to this user', 400);
    }

    // Award badge
    const userBadge = new UserBadge({
      userId,
      badgeId,
      earnedAt: new Date()
    });

    await userBadge.save();

    // Add points for badge
    const gamificationPoint = new GamificationPoint({
      userId,
      type: 'badge_earned',
      points: badge.points,
      description: `Earned badge: ${badge.name}`,
      badgeId,
      awardedBy: req.user?.id
    });

    await gamificationPoint.save();

    res.json({
      success: true,
      message: 'Badge awarded successfully',
      data: {
        userBadge,
        pointsEarned: badge.points
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get leaderboard
export const getLeaderboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      type = 'points', 
      period = 'all',
      limit = 10,
      department
    } = req.query;

    let matchStage: any = {};

    // Filter by period
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

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
          startDate = new Date(0);
      }

      if (period !== 'all') {
        matchStage.createdAt = { $gte: startDate };
      }
    }

    // Get leaderboard based on points
    const leaderboard = await GamificationPoint.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: { $multiply: ['$points', '$multiplier'] } },
          activityCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'userbadges',
          localField: '_id',
          foreignField: 'userId',
          as: 'badges'
        }
      },
      {
        $project: {
          name: '$user.name',
          studentId: '$user.studentId',
          department: '$user.profile.department',
          totalPoints: 1,
          currentLevel: { $add: [{ $floor: { $divide: ['$totalPoints', 100] } }, 1] },
          badgeCount: { $size: '$badges' },
          activityCount: 1,
          lastActivity: 1
        }
      }
    ]);

    // Filter by department if specified
    const filteredLeaderboard = department 
      ? leaderboard.filter(user => user.department === department)
      : leaderboard;

    // Add rank to each user
    filteredLeaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.json({
      success: true,
      data: {
        leaderboard: filteredLeaderboard,
        type,
        period,
        total: filteredLeaderboard.length
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get all badges
export const getAllBadges = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      rarity,
      isActive = true 
    } = req.query;

    const filter: any = { isActive };
    
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;

    const skip = (Number(page) - 1) * Number(limit);
    
    const badges = await Badge.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Badge.countDocuments(filter);

    res.json({
      success: true,
      data: {
        badges,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Create badge (admin only)
export const createBadge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const badgeData = req.body;
    
    const badge = new Badge({
      ...badgeData,
      createdBy: req.user?.id
    });
    
    await badge.save();
    
    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: badge
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get gamification statistics (admin only)
export const getGamificationStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department } = req.query;

    // Get users filter
    let userFilter: any = {};
    if (department) {
      userFilter['profile.department'] = department;
    }

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    // Total points distributed
    const totalPointsResult = await GamificationPoint.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: { $multiply: ['$points', '$multiplier'] } },
          totalActivities: { $sum: 1 },
          avgPoints: { $avg: { $multiply: ['$points', '$multiplier'] } }
        }
      }
    ]);

    // Points by type
    const pointsByType = await GamificationPoint.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$type',
          totalPoints: { $sum: { $multiply: ['$points', '$multiplier'] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    // Total badges awarded
    const totalBadges = await UserBadge.countDocuments({ userId: { $in: userIds } });

    // Most awarded badges
    const topBadges = await UserBadge.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$badgeId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'badges',
          localField: '_id',
          foreignField: '_id',
          as: 'badge'
        }
      },
      { $unwind: '$badge' },
      {
        $project: {
          name: '$badge.name',
          icon: '$badge.icon',
          count: 1
        }
      }
    ]);

    // Active users (users with points in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await GamificationPoint.distinct('userId', {
      userId: { $in: userIds },
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalPoints: totalPointsResult[0]?.totalPoints || 0,
      totalActivities: totalPointsResult[0]?.totalActivities || 0,
      avgPointsPerUser: totalPointsResult[0]?.avgPoints || 0,
      totalBadges,
      pointsByType,
      topBadges
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

