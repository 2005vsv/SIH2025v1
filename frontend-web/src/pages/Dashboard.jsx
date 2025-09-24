import { motion } from 'framer-motion';
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Home,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { feeAPI, notificationAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFees,
    pendingFees,
    attendancePercentage,
    cgpa,
    totalCredits,
    currentSemester,
    booksIssued,
    upcomingExams: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [fees, setFees] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user fees
        if (user?.role === 'student') {
          const feesResponse = await feeAPI.getMy();
          const userFees = feesResponse.data.data.fees || [];
          setFees(userFees);
          
          // Calculate fee stats
          const totalFees = userFees.reduce((sum, fee) => sum + fee.amount, 0);
          const pendingFees = userFees
            .filter((fee) => fee.status === 'pending')
            .reduce((sum, fee) => sum + fee.amount, 0);
          
          setStats(prev => ({
            ...prev,
            totalFees,
            pendingFees,
            currentSemester: user.profile?.semester || 6,
            attendancePercentage, // Mock data for now
            cgpa: 8.6, // Mock data for now
            totalCredits, // Mock data for now
            upcomingExams: 4 // Mock data for now
          }));
        }

        // Fetch notifications
        const notificationsResponse = await notificationAPI.getMy({ limit: 5 });
        const userNotifications = notificationsResponse.data.data.notifications || [];
        setNotifications(userNotifications);

        // Convert notifications to recent activities
        const activities= userNotifications.map((notification) => ({
          id: notification._id,
          type: 'announcement',
          title: notification.title,
          description: notification.message,
          date: new Date(notification.createdAt).toLocaleDateString(),
          status: notification.isRead ? 'info' : 'warning'
        }));

        setRecentActivities(activities);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      icon: <Award className="w-6 h-6" />,
      title: 'View Grades',
      description: 'Check semester grades and CGPA',
      color: 'from-blue-500 to-blue-600',
      href: '/grades',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Pay Fees',
      description: 'Make fee payments online',
      color: 'from-green-500 to-green-600',
      href: '/fees',
      bgColor: 'bg-green-50 hover:bg-green-100',
      textColor: 'text-green-600'
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: 'Hostel Services',
      description: 'Manage hostel bookings',
      color: 'from-purple-500 to-purple-600',
      href: '/hostel',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Library',
      description: 'Browse and reserve books',
      color: 'from-orange-500 to-orange-600',
      href: '/library',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      textColor: 'text-orange-600'
    }
  ];

  const statCards = [
    {
      title: 'Current CGPA',
      value: stats.cgpa.toFixed(1),
      icon: <Trophy className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Attendance',
      value: `${stats.attendancePercentage}%`,
      icon: <Clock className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Fees',
      value: `₹${stats.pendingFees.toLocaleString()}`,
      icon: <DollarSign className="w-8 h-8" />,
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Books Issued',
      value: stats.booksIssued.toString(),
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'fee': return <CreditCard className="w-4 h-4" />;
      case 'grade': return <Award className="w-4 h-4" />;
      case 'library': return <BookOpen className="w-4 h-4" />;
      case 'attendance': return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      case 'error': return 'bg-red-100 text-red-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name || 'Student'}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Semester {stats.currentSemester} • Computer Science Engineering
              </p>
              <p className="text-blue-200 text-sm">
                Academic Year 2025-26 • Student ID: {user?.studentId || 'CS2023001'}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl opacity-20">🎓</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <div className={card.textColor}>{card.icon}</div>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.href}
                className={`block p-6 rounded-xl ${action.bgColor} border border-gray-200 hover:border-gray-300 transition-all duration-300 group`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                    {action.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getActivityStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <Link
            to="/notifications"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm mt-4"
          >
            View all activities
            <TrendingUp className="w-4 h-4 ml-1" />
          </Link>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Events</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Database Systems Exam</p>
                <p className="text-sm text-gray-600">Sept 28, 2025</p>
                <p className="text-xs text-blue-600 mt-1">3 days remaining</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50">
              <Bell className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Placement Drive - TCS</p>
                <p className="text-sm text-gray-600">Oct 5, 2025</p>
                <p className="text-xs text-green-600 mt-1">10 days remaining</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
