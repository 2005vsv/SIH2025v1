import { Bell, Calendar, Edit, Eye, Filter, Megaphone, MessageSquare, Plus, Search, Send, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AdminNotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    scheduled: 0,
    drafts: 0,
    totalRecipients: 0,
    averageReadRate: 0,
    urgentNotifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetails, setShowDetails] = useState(null);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    priority: 'medium',
    audience: 'all',
    targetBranches: [],
    targetSemesters: [],
    scheduledAt: '',
    expiresAt: '',
    actionUrl: '',
    actionText: ''
  });

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);

      // Mock data for development
      const mockNotifications = [
        {
          _id: '1',
          title: 'Fee Payment Reminder',
          message: 'Semester fees are due by September 30, 2024. Please ensure timely payment to avoid late fees.',
          type: 'fee',
          priority: 'high',
          audience: 'students',
          targetBranches: ['CSE', 'ECE', 'ME', 'CE'],
          targetSemesters: [1, 2, 3, 4, 5, 6, 7, 8],
          createdBy: {
            name: 'Finance Admin',
            email: 'finance@university.edu',
            role: 'admin'
          },
          status: 'sent',
          sentAt: '2024-09-15T10:00:00Z',
          expiresAt: '2024-09-30T23:59:59Z',
          recipientCount: 200,
          readCount: 150,
          actionUrl: '/student/fees',
          actionText: 'Pay Fees'
        },
        {
          _id: '2',
          title: 'Mid-term Exam Schedule Released',
          message: 'The mid-term examination schedule for all courses has been published. Please check your exam dates and prepare accordingly.',
          type: 'academic',
          priority: 'medium',
          audience: 'students',
          targetBranches: ['CSE', 'ECE'],
          targetSemesters: [3, 4, 5, 6],
          createdBy: {
            name: 'Academic Office',
            email: 'academic@university.edu',
            role: 'admin'
          },
          status: 'sent',
          sentAt: '2024-09-14T14:30:00Z',
          recipientCount: 120,
          readCount: 90,
          actionUrl: '/student/academics',
          actionText: 'View Schedule',
          attachments: [
            {
              name: 'exam-schedule.pdf',
              url: '/attachments/exam-schedule.pdf',
              type: 'application/pdf'
            }
          ]
        },
        {
          _id: '3',
          title: 'Campus Placement Drive - TechCorp',
          message: 'TechCorp will be conducting campus interviews on September 25, 2024. Eligible students can apply through the placement portal.',
          type: 'placement',
          priority: 'high',
          audience: 'students',
          targetBranches: ['CSE', 'ECE'],
          targetSemesters: [7, 8],
          createdBy: {
            name: 'Placement Cell',
            email: 'placement@university.edu',
            role: 'admin'
          },
          status: 'scheduled',
          scheduledAt: '2024-09-20T09:00:00Z',
          recipientCount: 80,
          readCount: 0,
          actionUrl: '/student/placements',
          actionText: 'Apply Now'
        },
        {
          _id: '4',
          title: 'Library New Book Arrivals',
          message: 'New computer science and engineering books have arrived at the library. Check out the latest additions.',
          type: 'library',
          priority: 'low',
          audience: 'all',
          createdBy: {
            name: 'Library Staff',
            email: 'library@university.edu',
            role: 'staff'
          },
          status: 'draft',
          recipientCount: 300,
          readCount: 0,
          actionUrl: '/student/library',
          actionText: 'Browse Books'
        }
      ];

      const mockTemplates = [
        {
          _id: '1',
          name: 'Fee Payment Reminder',
          title: 'Fee Payment Reminder - {semester} Semester',
          message: 'Your {semester} semester fees are due by {due_date}. Please ensure timely payment to avoid late fees.',
          type: 'fee',
          priority: 'high',
          isActive: true,
          usageCount: 15
        },
        {
          _id: '2',
          name: 'Exam Schedule Notification',
          title: 'Exam Schedule Released - {exam_type}',
          message: 'The {exam_type} examination schedule has been published. Please check your exam dates.',
          type: 'academic',
          priority: 'medium',
          isActive: true,
          usageCount: 8
        },
        {
          _id: '3',
          name: 'Placement Drive Announcement',
          title: 'Campus Placement Drive - {company_name}',
          message: '{company_name} will be conducting campus interviews on {drive_date}. Eligible students can apply.',
          type: 'placement',
          priority: 'high',
          isActive: false,
          usageCount: 12
        }
      ];

      setNotifications(mockNotifications);
      setTemplates(mockTemplates);

      // Calculate stats
      const totalSent = mockNotifications.filter(n => n.status === 'sent').length;
      const scheduled = mockNotifications.filter(n => n.status === 'scheduled').length;
      const drafts = mockNotifications.filter(n => n.status === 'draft').length;
      const totalRecipients = mockNotifications.reduce((sum, n) => sum + n.recipientCount, 0);
      const totalRead = mockNotifications.reduce((sum, n) => sum + n.readCount, 0);
      const averageReadRate = totalRecipients > 0 ? (totalRead / totalRecipients) * 100 : 0;
      const urgentNotifications = mockNotifications.filter(n => n.priority === 'urgent').length;

      setStats({
        totalSent,
        scheduled,
        drafts,
        totalRecipients,
        averageReadRate,
        urgentNotifications
      });
    } catch (error) {
      console.error('Error fetching notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (e) => {
    e.preventDefault();
    try {
      // Mock API call
      const notification = {
        _id: Date.now().toString(),
        ...newNotification,
        createdBy: {
          name: 'Current Admin',
          email: 'admin@university.edu',
          role: 'admin'
        },
        status: newNotification.scheduledAt ? 'scheduled' : 'sent',
        sentAt: newNotification.scheduledAt ? undefined : new Date().toISOString(),
        recipientCount: 100,
        readCount: 0,
        targetBranches: newNotification.targetBranches,
        targetSemesters: newNotification.targetSemesters
      };

      setNotifications(prev => [notification, ...prev]);
      setNewNotification({
        title: '',
        message: '',
        type: 'general',
        priority: 'medium',
        audience: 'all',
        targetBranches: [],
        targetSemesters: [],
        scheduledAt: '',
        expiresAt: '',
        actionUrl: '',
        actionText: ''
      });

      alert('Notification created successfully!');
      setActiveTab('notifications');
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Failed to create notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateNotificationStatus = async (notificationId, status) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? {
                ...notification,
                status,
                sentAt: status === 'sent' ? new Date().toISOString() : notification.sentAt
              }
            : notification
        )
      );
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || colors.draft;
  };

  const getTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      academic: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      fee: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      hostel: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      placement: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      library: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[type] || colors.general;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-500" />
          Notification Management
        </h1>
        <div className="text-gray-500">Create, send, and manage notifications for students, faculty, and staff</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Total Sent</div>
          <div className="text-2xl font-bold">{stats.totalSent}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Scheduled</div>
          <div className="text-2xl font-bold">{stats.scheduled}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Drafts</div>
          <div className="text-2xl font-bold">{stats.drafts}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Recipients</div>
          <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Read Rate</div>
          <div className="text-2xl font-bold">{stats.averageReadRate.toFixed(1)}%</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Urgent</div>
          <div className="text-2xl font-bold">{stats.urgentNotifications}</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'notifications'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'create'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Create Notification
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'templates'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="fee">Fees</option>
              <option value="hostel">Hostel</option>
              <option value="placement">Placement</option>
              <option value="library">Library</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {/* Notifications List */}
          {filteredNotifications.map((notification) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-bold text-lg">{notification.title}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(notification.status)}`}>
                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(notification.type)}`}>
                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(notification.priority)}`}>
                  {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                </span>
              </div>
              <div className="mb-2">{notification.message}</div>
              <div className="text-xs text-gray-700 dark:text-gray-200 mb-2 flex flex-wrap gap-4">
                <span>Created by: {notification.createdBy.name}</span>
                <span>Audience: {notification.audience.charAt(0).toUpperCase() + notification.audience.slice(1)}</span>
                <span>Recipients: {notification.recipientCount.toLocaleString()}</span>
                {notification.sentAt && (
                  <span>Sent: {new Date(notification.sentAt).toLocaleString()}</span>
                )}
                {notification.scheduledAt && (
                  <span>Scheduled: {new Date(notification.scheduledAt).toLocaleString()}</span>
                )}
                {notification.status === 'sent' && (
                  <span>
                    Read rate: {((notification.readCount / notification.recipientCount) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setShowDetails(notification)}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                {notification.status === 'draft' && (
                  <button
                    onClick={() => updateNotificationStatus(notification._id, 'sent')}
                    className="text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                    title="Send Now"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {notification.targetBranches && notification.targetBranches.length > 0 && (
                <div className="text-xs mb-1">
                  Target Branches:{' '}
                  {notification.targetBranches.map((branch, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300 mr-1"
                    >
                      {branch}
                    </span>
                  ))}
                </div>
              )}
              {notification.attachments && notification.attachments.length > 0 && (
                <div className="text-xs mb-1">
                  Attachments:{' '}
                  {notification.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 mr-1"
                      download
                    >
                      {attachment.name}
                    </a>
                  ))}
                </div>
              )}
              {notification.actionUrl && notification.actionText && (
                <a
                  href={notification.actionUrl}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {notification.actionText}
                </a>
              )}
            </motion.div>
          ))}
          {filteredNotifications.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="font-semibold text-lg mb-2">No notifications found</div>
              <div className="text-sm">Try adjusting your search or filter criteria.</div>
            </div>
          )}
        </div>
      )}

      {/* Create Notification Tab */}
      {activeTab === 'create' && (
        <form onSubmit={createNotification} className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="mb-4">
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Type</label>
            <select
              value={newNotification.type}
              onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="fee">Fees</option>
              <option value="hostel">Hostel</option>
              <option value="placement">Placement</option>
              <option value="library">Library</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Message</label>
            <textarea
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Priority</label>
            <select
              value={newNotification.priority}
              onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Audience</label>
            <select
              value={newNotification.audience}
              onChange={(e) => setNewNotification({ ...newNotification, audience: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="students">Students Only</option>
              <option value="faculty">Faculty Only</option>
              <option value="staff">Staff Only</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Schedule (Optional)</label>
            <input
              type="datetime-local"
              value={newNotification.scheduledAt}
              onChange={(e) => setNewNotification({ ...newNotification, scheduledAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Action URL (Optional)</label>
            <input
              type="url"
              value={newNotification.actionUrl}
              onChange={(e) => setNewNotification({ ...newNotification, actionUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Action Text (Optional)</label>
            <input
              type="text"
              value={newNotification.actionText}
              onChange={(e) => setNewNotification({ ...newNotification, actionText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="View Details"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {newNotification.scheduledAt ? 'Schedule Notification' : 'Send Notification'}
            </button>
            <button
              type="button"
              onClick={() => setNewNotification({
                title: '',
                message: '',
                type: 'general',
                priority: 'medium',
                audience: 'all',
                targetBranches: [],
                targetSemesters: [],
                scheduledAt: '',
                expiresAt: '',
                actionUrl: '',
                actionText: ''
              })}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
            >
              Clear Form
            </button>
          </div>
        </form>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <motion.div
              key={template._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
            >
              <div className="font-bold text-lg">{template.name}</div>
              <div className="flex gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(template.type)}`}>
                  {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(template.priority)}`}>
                  {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs mb-1"><span className="font-semibold">Title:</span> {template.title}</div>
              <div className="text-xs mb-1"><span className="font-semibold">Message:</span> {template.message}</div>
              <div className="text-xs mb-1"><span className="font-semibold">Used:</span> {template.usageCount} times</div>
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Use Template</button>
                <button className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Edit</button>
              </div>
            </motion.div>
          ))}
          {templates.length === 0 && (
            <div className="text-center text-gray-500 py-8 col-span-2">
              <div className="font-semibold text-lg mb-2">No templates found</div>
              <div className="text-sm">Create notification templates to save time.</div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="text-center text-gray-500 py-8">
          <div className="font-semibold text-lg mb-2">Notification Analytics</div>
          <div className="text-sm">Detailed analytics and reporting features coming soon.</div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationManagement;