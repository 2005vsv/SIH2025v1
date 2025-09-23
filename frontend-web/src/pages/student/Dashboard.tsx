import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CreditCard,
  Home,
  Trophy,
  User,
  GraduationCap,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Camera,
  Edit2,
  Star,
  Target,
  Award,
  BookMarked,
  MapPin,
  Mail,
  Phone,
  Users,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { feeAPI, libraryAPI, notificationAPI, examAPI, gamificationAPI, placementAPI } from '../../services/api';

interface DashboardStats {
  totalFees: number;
  pendingFees: number;
  currentSemester: number;
  attendancePercentage: number;
  cgpa: number;
  sgpa: number;
  totalCredits: number;
  upcomingExams: number;
  borrowedBooks: number;
  completedExams: number;
  pendingAssignments: number;
  totalPoints: number;
  rank: number;
  jobApplications: number;
}

interface RecentActivity {
  id: string;
  type: 'fee' | 'library' | 'exam' | 'announcement' | 'placement' | 'gamification' | 'assignment';
  title: string;
  description: string;
  date: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

const StudentDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalFees: 0,
    pendingFees: 0,
    currentSemester: 1, // Start with default 1 instead of 6
    attendancePercentage: 87,
    cgpa: 0, // Start with 0 instead of hardcoded value
    sgpa: 0, // Start with 0 instead of hardcoded value
    totalCredits: 152,
    upcomingExams: 4,
    borrowedBooks: 2,
    completedExams: 12,
    pendingAssignments: 3,
    totalPoints: 850,
    rank: 15,
    jobApplications: 5
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Set initial data from user context when available
  useEffect(() => {
    if (user?.profile) {
      console.log('Dashboard - Setting initial data from user context:', user.profile);
      setStats(prev => ({
        ...prev,
        cgpa: user.profile?.cgpa ?? 0,
        sgpa: user.profile?.sgpa ?? 0,
        currentSemester: user.profile?.semester ?? 1
      }));
    }
  }, [user?.profile?.cgpa, user?.profile?.sgpa, user?.profile?.semester]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Dashboard - No token found for profile fetch');
        return;
      }

      console.log('Dashboard - Fetching user profile for CGPA/SGPA/Semester...');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Dashboard - Fresh profile data:', userData);
        
        if (userData.user && userData.user.profile) {
          const profileCgpa = userData.user.profile.cgpa !== undefined ? userData.user.profile.cgpa : 0;
          const profileSgpa = userData.user.profile.sgpa !== undefined ? userData.user.profile.sgpa : 0;
          const profileSemester = userData.user.profile.semester !== undefined ? userData.user.profile.semester : 1;
          
          console.log('Dashboard - Updating stats with fresh data:');
          console.log('  - CGPA:', profileCgpa);
          console.log('  - SGPA:', profileSgpa);
          console.log('  - Semester:', profileSemester);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            cgpa: profileCgpa,
            sgpa: profileSgpa,
            currentSemester: profileSemester
          }));

          // Also update the user context with fresh profile data
          if (updateUser) {
            updateUser({
              ...userData.user,
              profile: {
                ...userData.user.profile,
                cgpa: profileCgpa,
                sgpa: profileSgpa,
                semester: profileSemester
              }
            });
          }
        } else {
          console.log('Dashboard - No profile data found in response');
        }
      } else {
        console.error('Dashboard - Failed to fetch profile:', response.status);
      }
    } catch (profileError) {
      console.error('Dashboard - Error fetching profile:', profileError);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // First, fetch fresh user profile data to ensure we have the latest CGPA/SGPA/Semester
      await fetchUserProfile();

      // Fetch user fees
      if (user?.role === 'student') {
        const feesResponse = await feeAPI.getMy();
        const userFees = feesResponse.data.data.fees || [];
        
        // Calculate fee stats
        const totalFees = userFees.reduce((sum: number, fee: any) => sum + fee.amount, 0);
        const pendingFees = userFees
          .filter((fee: any) => fee.status === 'pending')
          .reduce((sum: number, fee: any) => sum + fee.amount, 0);

        // Fetch gamification data
        try {
          const pointsResponse = await gamificationAPI.getMyPoints();
          const leaderboardResponse = await gamificationAPI.getLeaderboard({ limit: 100 });
          
          const myPoints = pointsResponse.data.data.points || 0;
          const leaderboard = leaderboardResponse.data.data.leaderboard || [];
          const myRank = leaderboard.findIndex((entry: any) => entry.userId === user.id) + 1;

          setStats(prev => ({
            ...prev,
            totalFees,
            pendingFees,
            totalPoints: myPoints,
            rank: myRank || 15,
          }));
        } catch (gamificationError) {
          console.warn('Gamification data not available');
          setStats(prev => ({
            ...prev,
            totalFees,
            pendingFees,
          }));
        }

        // Fetch exam data
        try {
          const examsResponse = await examAPI.getMy();
          const userExams = examsResponse.data.data.exams || [];
          const upcomingExams = userExams.filter((exam: any) => 
            new Date(exam.date) > new Date()
          ).length;
          const completedExams = userExams.filter((exam: any) => 
            new Date(exam.date) <= new Date()
          ).length;

          setStats(prev => ({
            ...prev,
            upcomingExams,
            completedExams
          }));
        } catch (examError) {
          console.warn('Exam data not available');
        }

        // Fetch placement applications
        try {
          const applicationsResponse = await placementAPI.getMyApplications();
          const applications = applicationsResponse.data.data.applications || [];
          
          setStats(prev => ({
            ...prev,
            jobApplications: applications.length
          }));
        } catch (placementError) {
          console.warn('Placement data not available');
        }

        // Fetch library data
        try {
          const libraryResponse = await libraryAPI.getBorrowHistory();
          const borrowHistory = libraryResponse.data.data.borrowHistory || [];
          const activeBorrows = borrowHistory.filter((borrow: any) => !borrow.returnedAt).length;
          
          setStats(prev => ({
            ...prev,
            borrowedBooks: activeBorrows
          }));
        } catch (libraryError) {
          console.warn('Library data not available');
        }
      }

      // Fetch notifications
      const notificationsResponse = await notificationAPI.getMy({ limit: 10 });
      const userNotifications = notificationsResponse.data.data.notifications || [];
      
      setNotifications(userNotifications.map((notification: any) => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        read: notification.isRead || false,
        createdAt: notification.createdAt
      })));

      // Convert notifications to recent activities and add mock activities
      const activities: RecentActivity[] = [
        ...userNotifications.slice(0, 3).map((notification: any) => ({
          id: notification._id,
          type: 'announcement' as const,
          title: notification.title,
          description: notification.message,
          date: new Date(notification.createdAt).toLocaleDateString(),
          status: notification.isRead ? 'info' as const : 'warning' as const,
          icon: <Bell className="w-4 h-4" />
        })),
        {
          id: 'activity-1',
          type: 'fee' as const,
          title: 'Fee Payment Reminder',
          description: 'Semester fee payment due in 5 days',
          date: new Date().toLocaleDateString(),
          status: 'warning' as const,
          icon: <CreditCard className="w-4 h-4" />
        },
        {
          id: 'activity-2',
          type: 'library' as const,
          title: 'Book Return Reminder',
          description: 'Return "Data Structures" by tomorrow',
          date: new Date().toLocaleDateString(),
          status: 'warning' as const,
          icon: <BookOpen className="w-4 h-4" />
        },
        {
          id: 'activity-3',
          type: 'exam' as const,
          title: 'Upcoming Exam',
          description: 'Database Systems exam on Oct 15th',
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
          status: 'info' as const,
          icon: <GraduationCap className="w-4 h-4" />
        }
      ];

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fee': return <CreditCard className="w-5 h-5" />;
      case 'library': return <BookOpen className="w-5 h-5" />;
      case 'exam': return <GraduationCap className="w-5 h-5" />;
      default: return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section with Profile Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Profile Info */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0) || 'S'}
                  </div>
                  <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.name || 'Student Name'}
                  </h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email || 'student@university.edu'}
                  </p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      Semester {stats.currentSemester}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Computer Science
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      CGPA {stats.cgpa.toFixed(2)}
                    </span>
                    <span className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      SGPA {stats.sgpa.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
                  <div className="text-xs text-gray-500">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">#{stats.rank}</div>
                  <div className="text-xs text-gray-500">Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.attendancePercentage}%</div>
                  <div className="text-xs text-gray-500">Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.totalCredits}</div>
                  <div className="text-xs text-gray-500">Credits</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notifications Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Recent Notifications
              </h2>
              <button 
                onClick={() => notificationAPI.markAllAsRead()}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Mark all as read
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-2 rounded-lg ${
                    !notification.read ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    !notification.read ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedExams}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingExams}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Borrowed Books</p>
                <p className="text-2xl font-bold text-gray-900">{stats.borrowedBooks}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Fees</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.pendingFees.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <Trophy className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gamification Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100">
                <Award className="w-8 h-8 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Job Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.jobApplications}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Target className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Class Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{stats.rank}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-600" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${getActivityColor(activity.status)} mr-4`}>
                        {activity.icon || getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{activity.date}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activities</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <Link 
                  to="/fees" 
                  className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">Pay Fees</span>
                </Link>
                <Link 
                  to="/library" 
                  className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <BookOpen className="w-6 h-6 text-purple-600 mr-3" />
                  <span className="font-medium text-gray-900">Browse Library</span>
                </Link>
                <Link 
                  to="/grades" 
                  className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Calendar className="w-6 h-6 text-green-600 mr-3" />
                  <span className="font-medium text-gray-900">View Exams & Grades</span>
                </Link>
                <Link 
                  to="/hostel" 
                  className="w-full flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Home className="w-6 h-6 text-orange-600 mr-3" />
                  <span className="font-medium text-gray-900">Hostel Services</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="w-full flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <User className="w-6 h-6 text-indigo-600 mr-3" />
                  <span className="font-medium text-gray-900">My Profile</span>
                </Link>
              </div>

              {/* Quick Stats Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Academic Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Credits</span>
                    <span className="text-sm font-medium text-gray-900">{stats.totalCredits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Upcoming Exams</span>
                    <span className="text-sm font-medium text-gray-900">{stats.upcomingExams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Borrowed Books</span>
                    <span className="text-sm font-medium text-gray-900">{stats.borrowedBooks}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;