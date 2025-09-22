import { Bell, Calendar, Edit, Eye, Filter, Megaphone, MessageSquare, Plus, Search, Send, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'general' | 'academic' | 'fee' | 'hostel' | 'placement' | 'library' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  audience: 'all' | 'students' | 'faculty' | 'staff' | 'custom';
  targetUsers?: string[];
  targetBranches?: string[];
  targetSemesters?: number[];
  createdBy: {
    name: string;
    email: string;
    role: string;
  };
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  expiresAt?: string;
  recipientCount: number;
  readCount: number;
  actionUrl?: string;
  actionText?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface NotificationTemplate {
  _id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isActive: boolean;
  usageCount: number;
}

interface NotificationStats {
  totalSent: number;
  scheduled: number;
  drafts: number;
  totalRecipients: number;
  averageReadRate: number;
  urgentNotifications: number;
}

const AdminNotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    scheduled: 0,
    drafts: 0,
    totalRecipients: 0,
    averageReadRate: 0,
    urgentNotifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'create' | 'templates' | 'analytics'>('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'general' | 'academic' | 'fee' | 'hostel' | 'placement' | 'library' | 'urgent'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'sent' | 'cancelled'>('all');
  const [showDetails, setShowDetails] = useState<Notification | null>(null);
  
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
      const token = localStorage.getItem('accessToken');
      
      // Mock data for development
      const mockNotifications: Notification[] = [
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
          recipientCount: 1250,
          readCount: 980,
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
          recipientCount: 650,
          readCount: 520,
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
          recipientCount: 200,
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
          recipientCount: 0,
          readCount: 0,
          actionUrl: '/student/library',
          actionText: 'Browse Books'
        }
      ];

      const mockTemplates: NotificationTemplate[] = [
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
          isActive: true,
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

  const createNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Creating notification:', newNotification);
      
      const notification: Notification = {
        _id: Date.now().toString(),
        ...newNotification,
        type: newNotification.type as any,
        priority: newNotification.priority as any,
        audience: newNotification.audience as any,
        createdBy: {
          name: 'Current Admin',
          email: 'admin@university.edu',
          role: 'admin'
        },
        status: newNotification.scheduledAt ? 'scheduled' : 'sent',
        sentAt: newNotification.scheduledAt ? undefined : new Date().toISOString(),
        recipientCount: 100, // Mock count
        readCount: 0,
        targetBranches: newNotification.targetBranches as string[],
        targetSemesters: newNotification.targetSemesters as number[]
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

  const deleteNotification = async (notificationId: string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Deleting notification:', notificationId);
      
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateNotificationStatus = async (notificationId: string, status: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Updating notification status:', { notificationId, status });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { 
                ...notification, 
                status: status as any,
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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      academic: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      fee: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      hostel: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      placement: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      library: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create, send, and manage notifications for students, faculty, and staff
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSent}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
                <Edit className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.drafts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recipients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecipients.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageReadRate.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Bell className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgentNotifications}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
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
            </nav>
          </div>

          {activeTab === 'notifications' && (
            <div className="p-6">
              {/* Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 h-4 w-4" />
                    <select
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
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
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                            {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div>
                            <span className="font-medium">Created by:</span> {notification.createdBy.name}
                          </div>
                          <div>
                            <span className="font-medium">Audience:</span> {notification.audience.charAt(0).toUpperCase() + notification.audience.slice(1)}
                          </div>
                          <div>
                            <span className="font-medium">Recipients:</span> {notification.recipientCount.toLocaleString()}
                          </div>
                          {notification.sentAt && (
                            <div>
                              <span className="font-medium">Sent:</span> {new Date(notification.sentAt).toLocaleString()}
                            </div>
                          )}
                          {notification.scheduledAt && (
                            <div>
                              <span className="font-medium">Scheduled:</span> {new Date(notification.scheduledAt).toLocaleString()}
                            </div>
                          )}
                          {notification.status === 'sent' && (
                            <div>
                              <span className="font-medium">Read rate:</span> {((notification.readCount / notification.recipientCount) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDetails(notification)}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {notification.status === 'draft' && (
                          <button
                            onClick={() => updateNotificationStatus(notification._id, 'sent')}
                            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {notification.targetBranches && notification.targetBranches.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Target Branches:</span>
                        <div className="inline-flex flex-wrap gap-1">
                          {notification.targetBranches.map((branch, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {branch}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {notification.attachments && notification.attachments.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Attachments:</span>
                        <div className="inline-flex flex-wrap gap-2">
                          {notification.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                              download
                            >
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs">{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {notification.actionUrl && notification.actionText && (
                      <div className="flex gap-2">
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {notification.actionText}
                        </a>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="p-6">
              <form onSubmit={createNotification} className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Audience
                    </label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Schedule (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newNotification.scheduledAt}
                      onChange={(e) => setNewNotification({ ...newNotification, scheduledAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Action URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={newNotification.actionUrl}
                      onChange={(e) => setNewNotification({ ...newNotification, actionUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Action Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={newNotification.actionText}
                      onChange={(e) => setNewNotification({ ...newNotification, actionText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="View Details"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Send className="h-4 w-4" />
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
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <motion.div
                    key={template._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {template.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(template.type)}`}>
                            {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(template.priority)}`}>
                            {template.priority.charAt(0).toUpperCase() + template.priority.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${template.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{template.title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{template.message}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Used:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{template.usageCount} times</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Use Template
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Edit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {templates.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No templates found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Create notification templates to save time.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Notification Analytics</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Detailed analytics and reporting features coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationManagement;