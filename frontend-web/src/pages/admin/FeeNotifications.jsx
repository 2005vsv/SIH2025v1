import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  Users,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Target,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { notificationAPI } from '../../services/api';

const FeeNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    totalSent: 0,
    totalRead: 0,
    readRate: 0
  });

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    recipientType: 'all',
    targetAudience: {
      department: '',
      semester: '',
      admissionYear: ''
    },
    priority: 'high',
    actionUrl: '/student/fees',
    actionText: 'View Fee Details',
    feeData: {
      amount: '',
      dueDate: '',
      feeType: 'tuition'
    },
    expiresAt: ''
  });

  const [recentNotifications, setRecentNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchStats();
    fetchRecentNotifications();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await notificationAPI.getStats({ period: 'month', category: 'fee' });
      if (response.data.success) {
        const stats = response.data.data;
        setStats({
          totalSent: stats.totalSent,
          totalRead: stats.totalRead,
          readRate: stats.readRate
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const response = await notificationAPI.getAll({
        category: 'fee',
        limit: 10,
        sort: '-createdAt'
      });
      if (response.data.success) {
        setRecentNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setSending(true);

      const payload = {
        ...notificationForm,
        feeData: {
          ...notificationForm.feeData,
          amount: notificationForm.feeData.amount ? parseFloat(notificationForm.feeData.amount) : undefined
        }
      };

      // Remove empty targetAudience fields
      if (payload.recipientType !== 'department') delete payload.targetAudience.department;
      if (payload.recipientType !== 'semester') delete payload.targetAudience.semester;
      if (payload.recipientType !== 'admissionYear') delete payload.targetAudience.admissionYear;

      if (!payload.expiresAt) delete payload.expiresAt;

      const response = await notificationAPI.sendFeeNotification(payload);

      if (response.data.success) {
        toast.success(`Fee notification sent to ${response.data.data.count} students!`);
        setNotificationForm({
          title: '',
          message: '',
          recipientType: 'all',
          targetAudience: {
            department: '',
            semester: '',
            admissionYear: ''
          },
          priority: 'high',
          actionUrl: '/student/fees',
          actionText: 'View Fee Details',
          feeData: {
            amount: '',
            dueDate: '',
            feeType: 'tuition'
          },
          expiresAt: ''
        });
        fetchStats();
        fetchRecentNotifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const filteredNotifications = recentNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesType;
  });

  const getRecipientTypeLabel = (type, audience) => {
    switch (type) {
      case 'all': return 'All Students';
      case 'department': return `Department: ${audience?.department}`;
      case 'semester': return `Semester: ${audience?.semester}`;
      case 'admissionYear': return `Admission Year: ${audience?.admissionYear}`;
      case 'specific': return 'Specific Students';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-500" />
          Fee Notifications
        </h1>
        <div className="text-gray-500">Send targeted fee notifications to students</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="font-semibold text-blue-600 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Total Sent
          </div>
          <div className="text-2xl font-bold">{stats.totalSent}</div>
          <div className="text-xs text-gray-500 mt-1">This month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="font-semibold text-green-600 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Read
          </div>
          <div className="text-2xl font-bold">{stats.totalRead}</div>
          <div className="text-xs text-gray-500 mt-1">Notifications read</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="font-semibold text-purple-600 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Read Rate
          </div>
          <div className="text-2xl font-bold">{stats.readRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">Engagement rate</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Notification Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Send Fee Notification
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block font-medium mb-1">Notification Title *</label>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Tuition Fee Due Reminder"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block font-medium mb-1">Message *</label>
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Detailed message about the fee notification..."
                required
              />
            </div>

            {/* Recipient Type */}
            <div>
              <label className="block font-medium mb-1">Target Audience</label>
              <select
                value={notificationForm.recipientType}
                onChange={(e) => setNotificationForm({ ...notificationForm, recipientType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Students</option>
                <option value="department">By Department</option>
                <option value="semester">By Semester</option>
                <option value="admissionYear">By Admission Year</option>
              </select>
            </div>

            {/* Target Audience Fields */}
            {notificationForm.recipientType === 'department' && (
              <div>
                <label className="block font-medium mb-1">Department</label>
                <select
                  value={notificationForm.targetAudience.department}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    targetAudience: { ...notificationForm.targetAudience, department: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>
            )}

            {notificationForm.recipientType === 'semester' && (
              <div>
                <label className="block font-medium mb-1">Semester</label>
                <select
                  value={notificationForm.targetAudience.semester}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    targetAudience: { ...notificationForm.targetAudience, semester: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            )}

            {notificationForm.recipientType === 'admissionYear' && (
              <div>
                <label className="block font-medium mb-1">Admission Year</label>
                <input
                  type="number"
                  value={notificationForm.targetAudience.admissionYear}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    targetAudience: { ...notificationForm.targetAudience, admissionYear: e.target.value }
                  })}
                  min="1990"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 2024"
                />
              </div>
            )}

            {/* Fee Data */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Fee Information (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    value={notificationForm.feeData.amount}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      feeData: { ...notificationForm.feeData, amount: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={notificationForm.feeData.dueDate}
                    onChange={(e) => setNotificationForm({
                      ...notificationForm,
                      feeData: { ...notificationForm.feeData, dueDate: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Priority and Expiration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Priority</label>
                <select
                  value={notificationForm.priority}
                  onChange={(e) => setNotificationForm({ ...notificationForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={notificationForm.expiresAt}
                  onChange={(e) => setNotificationForm({ ...notificationForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendNotification}
              disabled={sending}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Recent Fee Notifications
          </h2>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{notification.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notification.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{getRecipientTypeLabel(notification.data?.recipientType, notification.data?.targetAudience)}</span>
                    <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {notification.data?.count || 0} recipients
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No fee notifications found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeeNotifications;