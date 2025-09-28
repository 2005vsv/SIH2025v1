import axios from 'axios';
import { motion } from 'framer-motion';
import { BarChart, BookOpen, Briefcase, DollarSign, FileText, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminChangePassword from './admin/AdminChangePassword';
import AdminRegister from './admin/AdminRegister';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

    const adminTabs = [
      { id: 'registerAdmin', label: 'Register Admin' },
      { id: 'changeAdminPassword', label: 'Change Admin Password' },
    ];

    const adminFeatures = [
      {
        id: 'users',
        icon: <Users className="w-8 h-8" />,
        title: 'User Management',
        description: 'Manage students and staff accounts',
        color: 'from-blue-500 to-blue-600',
        count: '1,234',
      },
      {
        id: 'library',
        icon: <BookOpen className="w-8 h-8" />,
        title: 'Library System',
        description: 'Manage books and library operations',
        color: 'from-green-500 to-green-600',
        count: '2,567',
      },
      {
        id: 'fees',
        icon: <DollarSign className="w-8 h-8" />,
        title: 'Fee Management',
        description: 'Monitor and manage student fees',
        color: 'from-purple-500 to-purple-600',
        count: '₹12.5M',
      },
      {
        id: 'analytics',
        icon: <BarChart className="w-8 h-8" />,
        title: 'Analytics',
        description: 'View system analytics and reports',
        color: 'from-orange-500 to-orange-600',
        count: '95%',
      },
      {
        id: 'placements',
        icon: <Briefcase className="w-8 h-8" />,
        title: 'Placements',
        description: 'View all student job applications',
        color: 'from-teal-500 to-teal-600',
        count: '',
      },
    ];

  const stats = [
    { label: 'Total Students', value: '1,234', change: '+12%', color: 'text-blue-600' },
    { label: 'Active Books', value: '2,567', change: '+8%', color: 'text-green-600' },
    { label: 'Fee Collection', value: '₹12.5M', change: '+15%', color: 'text-purple-600' },
    { label: 'System Uptime', value: '99.9%', change: '+0.1%', color: 'text-orange-600' },
  ];

  // Placements state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    if (activeTab === 'placements') {
      fetchApplications();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await axios.get('/api/placements/applications/all');
      setApplications(res.data.applications || []);
    } catch (err) {
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Admin Dashboard</h1>
              <p className="text-blue-100 text-lg dark:text-blue-300">Welcome back, {user?.name}! Manage your institution effectively.</p>
            </div>
            <div className="hidden md:block">
              <Shield className="w-16 h-16 opacity-20" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="text-center">
              <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{stat.label}</h3>
              <p className={`text-2xl font-bold ${stat.color} dark:text-white`}>{stat.value}</p>
              <p className="text-green-600 dark:text-green-400 text-sm">{stat.change}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Admin Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {adminFeatures.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="group cursor-pointer"
            onClick={() => setActiveTab(feature.id)}
          >
            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${activeTab === feature.id ? 'ring-2 ring-blue-500' : ''}`}>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-4 inline-block`}>{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{feature.description}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{feature.count}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-white/20 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{adminFeatures.find(f => f.id === activeTab)?.title || 'Overview'}</h2>
          <div className="flex gap-4 mt-4">
            {adminTabs.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-lg border ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-white'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">System Overview</h3>
              <p className="text-gray-600 dark:text-gray-300">Select a feature from above to manage different aspects of the system.</p>
            </div>
          )}
          {activeTab === 'registerAdmin' && <AdminRegister />}
          {activeTab === 'changeAdminPassword' && <AdminChangePassword />}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Add New User</button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">User management interface would be implemented here</p>
              </div>
            </div>
          )}
          {activeTab === 'library' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Library Management</h3>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Add New Book</button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">Library management interface would be implemented here</p>
              </div>
            </div>
          )}
          {activeTab === 'fees' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Management</h3>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Generate Report</button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">Fee management interface would be implemented here</p>
              </div>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">System Analytics</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">Analytics dashboard would be implemented here</p>
              </div>
            </div>
          )}

          {activeTab === 'placements' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Student Job Applications</h3>
              {loadingApps ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b">Student Name</th>
                        <th className="px-4 py-2 border-b">Email</th>
                        <th className="px-4 py-2 border-b">Roll No.</th>
                        <th className="px-4 py-2 border-b">Department</th>
                        <th className="px-4 py-2 border-b">Job Title</th>
                        <th className="px-4 py-2 border-b">Company</th>
                        <th className="px-4 py-2 border-b">Location</th>
                        <th className="px-4 py-2 border-b">Status</th>
                        <th className="px-4 py-2 border-b">Applied At</th>
                        <th className="px-4 py-2 border-b">Resume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2 border-b">{app.user?.name || '-'}</td>
                          <td className="px-4 py-2 border-b">{app.user?.email || '-'}</td>
                          <td className="px-4 py-2 border-b">{app.user?.rollNumber || '-'}</td>
                          <td className="px-4 py-2 border-b">{app.user?.department || '-'}</td>
                          <td className="px-4 py-2 border-b">{app.job?.title || '-'}</td>
                          <td className="px-4 py-2 border-b">{app.job?.company || '-'}</td>
                          <td className="px-4 py-2 border-b">{app.job?.location || '-'}</td>
                          <td className="px-4 py-2 border-b">{app.status.replace('_', ' ')}</td>
                          <td className="px-4 py-2 border-b">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-2 border-b">
                            {app.resumeUrl ? (
                              <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
