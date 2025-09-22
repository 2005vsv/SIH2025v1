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
    Trophy,
    User
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalFees: number;
  pendingFees: number;
  attendancePercentage: number;
  cgpa: number;
  totalCredits: number;
  currentSemester: number;
  booksIssued: number;
  upcomingExams: number;
}

interface RecentActivity {
  id: string;
  type: 'fee' | 'grade' | 'attendance' | 'announcement' | 'library';
  title: string;
  description: string;
  date: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [stats] = useState<DashboardStats>({
    totalFees: 75000,
    pendingFees: 25000,
    attendancePercentage: 87,
    cgpa: 8.6,
    totalCredits: 152,
    currentSemester: 6,
    booksIssued: 3,
    upcomingExams: 4
  });

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'fee',
      title: 'Fee Payment Due',
      description: 'Semester fee payment due on Sept 30, 2025',
      date: '2025-09-20',
      status: 'warning'
    },
    {
      id: '2',
      type: 'grade',
      title: 'New Grade Posted',
      description: 'Machine Learning Assignment - Grade: A+',
      date: '2025-09-19',
      status: 'success'
    },
    {
      id: '3',
      type: 'library',
      title: 'Book Return Reminder',
      description: 'Return "Clean Code" by Sept 25, 2025',
      date: '2025-09-18',
      status: 'info'
    },
    {
      id: '4',
      type: 'attendance',
      title: 'Attendance Alert',
      description: 'Database Systems attendance: 72% (Below 75%)',
      date: '2025-09-17',
      status: 'warning'
    }
  ]);

  const quickActions = [
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'View Grades',
      description: 'Check semester grades and CGPA',
      color: 'from-blue-500 to-blue-600',
      href: '/grades',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
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
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Fees',
      value: `₹${stats.pendingFees.toLocaleString()}`,
      icon: <CreditCard className="w-8 h-8" />,
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'fee': return <CreditCard className="w-4 h-4" />;
      case 'grade': return <Award className="w-4 h-4" />;
      case 'library': return <BookOpen className="w-4 h-4" />;
      case 'attendance': return <Calendar className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-yellow-100 text-yellow-600';
      case 'error': return 'bg-red-100 text-red-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-1"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome back, {user?.name || 'Student'}! 👋
                  </h1>
                  <p className="text-blue-100 text-xl">
                    Semester {stats.currentSemester} • Computer Science Engineering
                  </p>
                  <p className="text-blue-200 text-sm mt-2">
                    Academic Year 2025-26 • Student ID: {user?.studentId || 'CS2023001'}
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <User className="h-16 w-16" />
                  </div>
                </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor} mt-1`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <div className={card.textColor}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={action.href}
                      className={`${action.bgColor} p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md cursor-pointer group block`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`${action.textColor} group-hover:scale-110 transition-transform duration-300`}>
                          {action.icon}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${action.textColor} text-lg group-hover:text-opacity-80`}>
                            {action.title}
                          </h3>
                          <p className="text-gray-600 mt-1 text-sm">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recent Activities */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Bell className="h-6 w-6 mr-3 text-blue-600" />
                Recent Activities
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-full ${getActivityStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {activity.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-2">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                  to="/notifications"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center"
                >
                  View All Activities
                  <TrendingUp className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Database Systems Exam</p>
                  <p className="text-sm text-gray-600">Sept 28, 2025</p>
                </div>
                <span className="text-blue-600 text-sm font-medium">3 days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Placement Drive - TCS</p>
                  <p className="text-sm text-gray-600">Oct 5, 2025</p>
                </div>
                <span className="text-green-600 text-sm font-medium">10 days</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Achievements
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Dean's List</p>
                  <p className="text-sm text-gray-600">Spring 2025</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <Award className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Perfect Attendance</p>
                  <p className="text-sm text-gray-600">Fall 2024</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;