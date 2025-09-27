import { motion } from 'framer-motion';
import {
    Activity,
    Bell,
    BookOpen,
    Calendar,
    CreditCard,
    Home,
    Trophy,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { examAPI, feeAPI, gamificationAPI, libraryAPI, notificationAPI, placementAPI } from '../../services/api';

const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({
    totalFees: 0,
    pendingFees: 0,
    currentSemester: 1,
    attendancePercentage: 0,
    cgpa: 0,
    sgpa: 0,
    totalCredits: 0,
    upcomingExams: 0,
    borrowedBooks: 0,
    completedExams: 0,
    pendingAssignments: 0,
    totalPoints: 0,
    rank: 0,
    jobApplications: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (user?.profile) {
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
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.user && userData.user.profile) {
          const cgpa = userData.user.profile.cgpa ?? 0;
          const sgpa = userData.user.profile.sgpa ?? 0;
          const currentSemester = userData.user.profile.semester ?? 1;
          setStats(prev => ({
            ...prev,
            cgpa,
            sgpa,
            currentSemester
          }));
          if (updateUser) {
            updateUser({
              ...userData.user,
              profile: {
                ...userData.user.profile,
                cgpa,
                sgpa,
                semester: currentSemester
              }
            });
          }
        }
      }
    } catch (profileError) {
      console.error('Dashboard - Error fetching profile:', profileError);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await fetchUserProfile();

      if (user?.role === 'student') {
        const feesResponse = await feeAPI.getMy();
        const userFees = feesResponse.data.data.fees || [];
        const totalFees = userFees.reduce((sum, fee) => sum + fee.amount, 0);
        const pendingFees = userFees.filter((fee) => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);

        try {
          const pointsResponse = await gamificationAPI.getMyPoints();
          const leaderboardResponse = await gamificationAPI.getLeaderboard({ limit: 100 });
          const totalPoints = pointsResponse.data.data.points || 0;
          const leaderboard = leaderboardResponse.data.data.leaderboard || [];
          const myRank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1;
          setStats(prev => ({
            ...prev,
            totalFees,
            pendingFees,
            totalPoints,
            rank: myRank || 15,
          }));
        } catch {
          setStats(prev => ({
            ...prev,
            totalFees,
            pendingFees,
          }));
        }

        try {
          const examsResponse = await examAPI.getMy();
          const userExams = examsResponse.data.data.exams || [];
          const upcomingExams = userExams.filter((exam) => new Date(exam.date) > new Date()).length;
          const completedExams = userExams.filter((exam) => new Date(exam.date) <= new Date()).length;
          setStats(prev => ({
            ...prev,
            upcomingExams,
            completedExams
          }));
        } catch {}

        try {
          const applicationsResponse = await placementAPI.getMyApplications();
          const applications = applicationsResponse.data.data.applications || [];
          setStats(prev => ({
            ...prev,
            jobApplications: applications.length
          }));
        } catch {}

        try {
          const libraryResponse = await libraryAPI.getBorrowHistory();
          const borrowHistory = libraryResponse.data.data.borrowHistory || [];
          const activeBorrows = borrowHistory.filter((borrow) => !borrow.returnedAt).length;
          setStats(prev => ({
            ...prev,
            borrowedBooks: activeBorrows
          }));
        } catch {}
      }

      const notificationsResponse = await notificationAPI.getMy({ limit: 10 });
      const userNotifications = notificationsResponse.data.data.notifications || [];
      setNotifications(userNotifications.map((notification) => ({
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        read: notification.isRead || false,
        createdAt: notification.createdAt
      })));

      const activities = [
        ...userNotifications.slice(0, 3).map((notification) => ({
          id: notification._id,
          type: 'announcement',
          title: notification.title,
          description: notification.message,
          date: new Date(notification.createdAt).toLocaleDateString(),
          status: notification.isRead ? 'info' : 'warning',
          icon: <Bell className="w-5 h-5 text-blue-500 mr-2" />
        })),
        {
          id: 'activity-1',
          type: 'fee',
          title: 'Fee Payment Reminder',
          description: 'Semester fee payment due in 5 days',
          date: new Date().toLocaleDateString(),
          status: 'warning',
          icon: <CreditCard className="w-5 h-5 text-yellow-500 mr-2" />
        },
        {
          id: 'activity-2',
          type: 'library',
          title: 'Book Return Reminder',
          description: 'Return "Data Structures" by tomorrow',
          date: new Date().toLocaleDateString(),
          status: 'warning',
          icon: <BookOpen className="w-5 h-5 text-purple-500 mr-2" />
        },
        {
          id: 'activity-3',
          type: 'exam',
          title: 'Upcoming Exam',
          description: 'Database Systems exam on Oct 15th',
          date: new Date(Date.now() - 86400000).toLocaleDateString(),
          status: 'info',
          icon: <Calendar className="w-5 h-5 text-green-500 mr-2" />
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'fee': return <CreditCard className="w-5 h-5 text-yellow-500 mr-2" />;
      case 'library': return <BookOpen className="w-5 h-5 text-purple-500 mr-2" />;
      case 'exam': return <Calendar className="w-5 h-5 text-green-500 mr-2" />;
      default: return <Activity className="w-5 h-5 text-blue-500 mr-2" />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
  <div className="max-w-6xl mx-auto p-4 bg-white dark:bg-gray-900 min-h-screen">
      {/* Welcome Section with Profile Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        {/* Profile Info */}
  <div className="flex items-center gap-6 bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="text-xl font-semibold">{user?.name || 'Student Name'}</div>
            <div className="text-gray-500">{user?.email || 'student@university.edu'}</div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span>Semester {stats.currentSemester}</span>
              <span>Computer Science</span>
              <span>CGPA {stats.cgpa?.toFixed(2)}</span>
              <span>SGPA {stats.sgpa?.toFixed(2)}</span>
            </div>
          </div>
          <div className="ml-auto flex flex-col gap-2 text-right">
            <span className="text-blue-600 font-bold">{stats.totalPoints} Points</span>
            <span className="text-purple-600 font-bold">#{stats.rank} Rank</span>
            <span className="text-green-600 font-bold">{stats.attendancePercentage}% Attendance</span>
            <span className="text-gray-600 font-bold">{stats.totalCredits} Credits</span>
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
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-lg">Recent Notifications</div>
          <button
            onClick={() => notificationAPI.markAllAsRead()}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Mark all as read
          </button>
        </div>
        <div className="space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-2 rounded-lg ${
                !notification.read ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                !notification.read ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
              <div>
                <div className="font-medium">{notification.title}</div>
                <div className="text-gray-600 text-sm">{notification.message}</div>
              </div>
              <div className="ml-auto text-xs text-gray-400">{new Date(notification.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-gray-500 text-center">No new notifications</div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Completed Exams</div>
          <div className="text-2xl font-bold">{stats.completedExams}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Upcoming Exams</div>
          <div className="text-2xl font-bold">{stats.upcomingExams}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Borrowed Books</div>
          <div className="text-2xl font-bold">{stats.borrowedBooks}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Pending Fees</div>
          <div className="text-2xl font-bold">₹{stats.pendingFees?.toLocaleString()}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Pending Assignments</div>
          <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Gamification Points</div>
          <div className="text-2xl font-bold">{stats.totalPoints}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Job Applications</div>
          <div className="text-2xl font-bold">{stats.jobApplications}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="font-semibold text-gray-600">Class Rank</div>
          <div className="text-2xl font-bold">#{stats.rank}</div>
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-4"
        >
          <div className="font-semibold text-lg mb-2">Recent Activity</div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${getActivityColor(activity.status)}`}
                >
                  <div>{activity.icon || getActivityIcon(activity.type)}</div>
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-gray-600 text-sm">{activity.description}</div>
                    <div className="text-xs text-gray-400">{activity.date}</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-gray-500">No recent activities</div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions & Academic Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4"
        >
          <div>
            <div className="font-semibold text-lg mb-2">Quick Actions</div>
            <div className="space-y-2">
              <Link
                to="/fees"
                className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Pay Fees
              </Link>
              <Link
                to="/library"
                className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                Browse Library
              </Link>
              <Link
                to="/grades"
                className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Trophy className="w-5 h-5 mr-2 text-green-600" />
                View Exams & Grades
              </Link>
              <Link
                to="/hostel"
                className="w-full flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Home className="w-5 h-5 mr-2 text-orange-600" />
                Hostel Services
              </Link>
              <Link
                to="/profile"
                className="w-full flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                My Profile
              </Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-lg mb-2">Academic Overview</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Total Credits</span>
                <span className="font-bold">{stats.totalCredits}</span>
              </div>
              <div className="flex justify-between">
                <span>Upcoming Exams</span>
                <span className="font-bold">{stats.upcomingExams}</span>
              </div>
              <div className="flex justify-between">
                <span>Borrowed Books</span>
                <span className="font-bold">{stats.borrowedBooks}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;