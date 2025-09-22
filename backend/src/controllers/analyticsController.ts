import { Response } from 'express';
import User, { IUser } from '../models/User';
import Fee, { IFee } from '../models/Fee';
import Transaction, { ITransaction } from '../models/Transaction';
import BorrowRecord, { IBorrowRecord } from '../models/BorrowRecord';
import HostelAllocation, { IHostelAllocation } from '../models/HostelAllocation';
import ExamResult, { IExamResult } from '../models/ExamResult';
import { GamificationPoint } from '../models/Gamification';
import { AuthenticatedRequest } from '../types';

export class APIError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

// Get dashboard analytics (admin only)
export const getDashboardAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeStudents = await User.countDocuments({ role: 'student', isActive: true });
    const newUsersThisPeriod = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Fee statistics
    const totalFees = await Fee.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const feesCollected = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const pendingFees = await Fee.aggregate([
      {
        $match: {
          status: 'pending',
          dueDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Library statistics
    const libraryStats = await BorrowRecord.aggregate([
      {
        $facet: {
          active: [
            { $match: { status: 'borrowed' } },
            { $count: 'count' }
          ],
          returned: [
            {
              $match: {
                status: 'returned',
                returnedAt: { $gte: startDate, $lte: endDate }
              }
            },
            { $count: 'count' }
          ],
          overdue: [
            {
              $match: {
                status: 'borrowed',
                dueDate: { $lt: now }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Hostel statistics
    const hostelStats = await HostelAllocation.aggregate([
      {
        $facet: {
          occupied: [
            { $match: { status: 'allocated' } },
            { $count: 'count' }
          ],
          newAllocations: [
            {
              $match: {
                status: 'allocated',
                allocatedDate: { $gte: startDate, $lte: endDate }
              }
            },
            { $count: 'count' }
          ],
          checkouts: [
            {
              $match: {
                status: 'deallocated',
                updatedAt: { $gte: startDate, $lte: endDate }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    // Academic performance
    const academicStats = await ExamResult.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgPercentage: { $avg: '$percentage' },
          totalExams: { $sum: 1 },
          passCount: {
            $sum: {
              $cond: [{ $gte: ['$percentage', 40] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Gamification statistics
    const gamificationStats = await GamificationPoint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: { $multiply: ['$points', '$multiplier'] } },
          totalActivities: { $sum: 1 },
          activeUsers: { $addToSet: '$userId' }
        }
      }
    ]);

    const analytics = {
      period,
      dateRange: { startDate, endDate },
      users: {
        total: totalUsers,
        activeStudents,
        newUsersThisPeriod
      },
      fees: {
        total: totalFees[0]?.total || 0,
        totalCount: totalFees[0]?.count || 0,
        collected: feesCollected[0]?.total || 0,
        collectedCount: feesCollected[0]?.count || 0,
        pending: pendingFees[0]?.total || 0,
        pendingCount: pendingFees[0]?.count || 0,
        collectionRate: totalFees[0]?.total > 0 
          ? ((feesCollected[0]?.total || 0) / totalFees[0].total * 100).toFixed(2)
          : 0
      },
      library: {
        activeBorrows: libraryStats[0]?.active[0]?.count || 0,
        returnsThisPeriod: libraryStats[0]?.returned[0]?.count || 0,
        overdueBooks: libraryStats[0]?.overdue[0]?.count || 0
      },
      hostel: {
        occupiedRooms: hostelStats[0]?.occupied[0]?.count || 0,
        newAllocations: hostelStats[0]?.newAllocations[0]?.count || 0,
        checkouts: hostelStats[0]?.checkouts[0]?.count || 0
      },
      academic: {
        avgPercentage: academicStats[0]?.avgPercentage || 0,
        totalExams: academicStats[0]?.totalExams || 0,
        passRate: academicStats[0]?.totalExams > 0 
          ? ((academicStats[0]?.passCount || 0) / academicStats[0].totalExams * 100).toFixed(2)
          : 0
      },
      gamification: {
        totalPointsAwarded: gamificationStats[0]?.totalPoints || 0,
        totalActivities: gamificationStats[0]?.totalActivities || 0,
        activeGamificationUsers: gamificationStats[0]?.activeUsers?.length || 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get user analytics
export const getUserAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, semester, year } = req.query;

    const filter: any = { role: 'student' };
    if (department) filter['profile.department'] = department;
    if (semester) filter['profile.semester'] = Number(semester);
    if (year) filter['profile.admissionYear'] = Number(year);

    // User distribution by department
    const departmentDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$profile.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // User distribution by semester
    const semesterDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$profile.semester',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User registration trends (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          role: 'student',
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Active vs inactive users
    const userStatus = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        departmentDistribution,
        semesterDistribution,
        registrationTrends,
        userStatus: {
          active: userStatus.find(s => s._id === true)?.count || 0,
          inactive: userStatus.find(s => s._id === false)?.count || 0
        }
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get fee analytics
export const getFeeAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { period = 'year', department } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
    }

    let userFilter: any = { role: 'student' };
    if (department) userFilter['profile.department'] = department;

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    // Fee collection trends
    const collectionTrends = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Fee types analysis
    const feeTypeAnalysis = await Fee.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$feeType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
            }
          },
          paid: {
            $sum: {
              $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Payment method analysis
    const paymentMethodAnalysis = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    // Defaulter analysis
    const defaulters = await Fee.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          status: 'pending',
          dueDate: { $lt: now }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalPending: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalPending: -1 } },
      { $limit: 10 },
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
        $project: {
          name: '$user.name',
          email: '$user.email',
          studentId: '$user.studentId',
          department: '$user.profile.department',
          totalPending: 1,
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        collectionTrends,
        feeTypeAnalysis,
        paymentMethodAnalysis,
        defaulters
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get academic analytics
export const getAcademicAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { department, semester } = req.query;

    let userFilter: any = { role: 'student' };
    if (department) userFilter['profile.department'] = department;
    if (semester) userFilter['profile.semester'] = Number(semester);

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    // Performance trends over time
    const performanceTrends = await ExamResult.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          avgPercentage: { $avg: '$percentage' },
          examCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Grade distribution
    const gradeDistribution = await ExamResult.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Subject-wise performance
    const subjectPerformance = await ExamResult.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $lookup: {
          from: 'exams',
          localField: 'examId',
          foreignField: '_id',
          as: 'exam'
        }
      },
      { $unwind: '$exam' },
      {
        $group: {
          _id: '$exam.subject',
          avgPercentage: { $avg: '$percentage' },
          examCount: { $sum: 1 },
          passRate: {
            $avg: {
              $cond: [{ $gte: ['$percentage', 40] }, 1, 0]
            }
          }
        }
      },
      { $sort: { avgPercentage: -1 } }
    ]);

    // Top performers
    const topPerformers = await ExamResult.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: '$userId',
          avgPercentage: { $avg: '$percentage' },
          examCount: { $sum: 1 }
        }
      },
      { $match: { examCount: { $gte: 3 } } }, // At least 3 exams
      { $sort: { avgPercentage: -1 } },
      { $limit: 10 },
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
        $project: {
          name: '$user.name',
          studentId: '$user.studentId',
          department: '$user.profile.department',
          avgPercentage: { $round: ['$avgPercentage', 2] },
          examCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        performanceTrends,
        gradeDistribution,
        subjectPerformance,
        topPerformers
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get library analytics
export const getLibraryAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range
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
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Borrowing trends
    const borrowingTrends = await BorrowRecord.aggregate([
      {
        $match: {
          borrowedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$borrowedAt' },
            month: { $month: '$borrowedAt' },
            day: { $dayOfMonth: '$borrowedAt' }
          },
          borrowCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Most popular books
    const popularBooks = await BorrowRecord.aggregate([
      {
        $group: {
          _id: '$bookId',
          borrowCount: { $sum: 1 }
        }
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      { $unwind: '$book' },
      {
        $project: {
          title: '$book.title',
          author: '$book.author',
          isbn: '$book.isbn',
          borrowCount: 1
        }
      }
    ]);

    // Active borrowers
    const activeBorrowers = await BorrowRecord.aggregate([
      {
        $match: {
          borrowedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          borrowCount: { $sum: 1 }
        }
      },
      { $sort: { borrowCount: -1 } },
      { $limit: 10 },
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
        $project: {
          name: '$user.name',
          studentId: '$user.studentId',
          department: '$user.profile.department',
          borrowCount: 1
        }
      }
    ]);

    // Overdue analysis
    const overdueAnalysis = await BorrowRecord.aggregate([
      {
        $match: {
          status: 'borrowed',
          dueDate: { $lt: now }
        }
      },
      {
        $group: {
          _id: null,
          totalOverdue: { $sum: 1 },
          avgOverdueDays: {
            $avg: {
              $divide: [
                { $subtract: [now, '$dueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        borrowingTrends,
        popularBooks,
        activeBorrowers,
        overdueStats: {
          totalOverdue: overdueAnalysis[0]?.totalOverdue || 0,
          avgOverdueDays: Math.round(overdueAnalysis[0]?.avgOverdueDays || 0)
        }
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get custom report
export const getCustomReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      reportType,
      startDate,
      endDate,
      department,
      semester,
      filters
    } = req.body;

    if (!reportType || !startDate || !endDate) {
      throw new APIError('Report type, start date, and end date are required', 400);
    }

    const dateFilter = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    let userFilter: any = { role: 'student' };
    if (department) userFilter['profile.department'] = department;
    if (semester) userFilter['profile.semester'] = Number(semester);

    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    let reportData: any = {};

    switch (reportType) {
      case 'fee_collection':
        reportData = await Transaction.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              status: 'completed',
              createdAt: dateFilter
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
              },
              amount: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);
        break;

      case 'academic_performance':
        reportData = await ExamResult.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              createdAt: dateFilter
            }
          },
          {
            $group: {
              _id: '$userId',
              avgPercentage: { $avg: '$percentage' },
              examCount: { $sum: 1 }
            }
          },
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
            $project: {
              name: '$user.name',
              studentId: '$user.studentId',
              department: '$user.profile.department',
              avgPercentage: { $round: ['$avgPercentage', 2] },
              examCount: 1
            }
          },
          { $sort: { avgPercentage: -1 } }
        ]);
        break;

      case 'library_usage':
        reportData = await BorrowRecord.aggregate([
          {
            $match: {
              userId: { $in: userIds },
              borrowedAt: dateFilter
            }
          },
          {
            $group: {
              _id: '$userId',
              borrowCount: { $sum: 1 }
            }
          },
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
            $project: {
              name: '$user.name',
              studentId: '$user.studentId',
              department: '$user.profile.department',
              borrowCount: 1
            }
          },
          { $sort: { borrowCount: -1 } }
        ]);
        break;

      default:
        throw new APIError('Invalid report type', 400);
    }

    res.json({
      success: true,
      data: {
        reportType,
        dateRange: { startDate, endDate },
        filters: { department, semester },
        reportData
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};