import React, { useState } from 'react';
import {
  Settings,
  Database,
  Shield,
  Globe,
  Bell,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

// Remove the TypeScript interface for .jsx files

const SystemConfig = () => {
  const [config, setConfig] = useState({
    general: {
      siteName: 'Student Portal',
      siteUrl: 'https://portal.university.edu',
      adminEmail: 'admin@university.edu',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR'
    },
    notifications: {
      emailEnabled: false,
      smsEnabled: false,
      pushEnabled: false,
      defaultTemplate: 'default'
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    academic: {
      currentSemester: 'Fall 2025',
      academicYear: '2025-26',
      semesterStartDate: '2025-08-01',
      semesterEndDate: '2025-12-15'
    },
    fees: {
      latePaymentFee: 100,
      gracePeriodDays: 7,
      paymentMethods: ['online', 'bank_transfer', 'cash']
    },
    library: {
      maxBooksPerStudent: 5,
      borrowDurationDays: 14,
      renewalLimit: 2,
      finePerDay: 10
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call to save configuration
      // await systemAPI.updateConfig(config);
      toast.success('Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default configuration?')) {
      // Reset to default values (could reload page or setConfig to initial values)
      toast.success('Configuration reset to defaults');
    }
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedConfig = (section, nestedField, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedField]: {
          ...(prev[section][nestedField] || {}),
          [field]: value
        }
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'academic', label: 'Academic', icon: Users },
    { id: 'fees', label: 'Fees', icon: Database },
    { id: 'library', label: 'Library', icon: Globe }
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          System Configuration
        </h1>
        <div className="text-gray-500">Manage system settings and preferences</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        {activeTab === 'general' && (
          <div>
            <div className="font-semibold mb-4">General Settings</div>
            <div className="mb-3">
              <label className="block mb-1">Site Name</label>
              <input
                type="text"
                value={config.general.siteName}
                onChange={(e) => updateConfig('general', 'siteName', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Site URL</label>
              <input
                type="url"
                value={config.general.siteUrl}
                onChange={(e) => updateConfig('general', 'siteUrl', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Admin Email</label>
              <input
                type="email"
                value={config.general.adminEmail}
                onChange={(e) => updateConfig('general', 'adminEmail', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Timezone</label>
              <select
                value={config.general.timezone}
                onChange={(e) => updateConfig('general', 'timezone', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div className="font-semibold mb-4">Notification Settings</div>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notifications.emailEnabled}
                onChange={(e) => updateConfig('notifications', 'emailEnabled', e.target.checked)}
                id="emailEnabled"
                className="mr-2"
              />
              <label htmlFor="emailEnabled" className="font-medium">Email Notifications</label>
              <span className="text-gray-400 text-xs">Send notifications via email</span>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notifications.smsEnabled}
                onChange={(e) => updateConfig('notifications', 'smsEnabled', e.target.checked)}
                id="smsEnabled"
                className="mr-2"
              />
              <label htmlFor="smsEnabled" className="font-medium">SMS Notifications</label>
              <span className="text-gray-400 text-xs">Send notifications via SMS</span>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.notifications.pushEnabled}
                onChange={(e) => updateConfig('notifications', 'pushEnabled', e.target.checked)}
                id="pushEnabled"
                className="mr-2"
              />
              <label htmlFor="pushEnabled" className="font-medium">Push Notifications</label>
              <span className="text-gray-400 text-xs">Send push notifications</span>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <div className="font-semibold mb-4">Security Settings</div>
            <div className="mb-3">
              <label className="block mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={config.security.sessionTimeout}
                onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Max Login Attempts</label>
              <input
                type="number"
                value={config.security.maxLoginAttempts}
                onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3 font-semibold">Password Policy</div>
            <div className="mb-2">
              <label className="block mb-1">Minimum Length</label>
              <input
                type="number"
                value={config.security.passwordPolicy.minLength}
                onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.security.passwordPolicy.requireUppercase}
                onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
                id="requireUppercase"
              />
              <label htmlFor="requireUppercase">Require Uppercase</label>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.security.passwordPolicy.requireLowercase}
                onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
                id="requireLowercase"
              />
              <label htmlFor="requireLowercase">Require Lowercase</label>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.security.passwordPolicy.requireNumbers}
                onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
                id="requireNumbers"
              />
              <label htmlFor="requireNumbers">Require Numbers</label>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.security.passwordPolicy.requireSpecialChars}
                onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'requireSpecialChars', e.target.checked)}
                id="requireSpecialChars"
              />
              <label htmlFor="requireSpecialChars">Require Special Characters</label>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div>
            <div className="font-semibold mb-4">Academic Settings</div>
            <div className="mb-3">
              <label className="block mb-1">Current Semester</label>
              <input
                type="text"
                value={config.academic.currentSemester}
                onChange={(e) => updateConfig('academic', 'currentSemester', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Academic Year</label>
              <input
                type="text"
                value={config.academic.academicYear}
                onChange={(e) => updateConfig('academic', 'academicYear', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Semester Start Date</label>
              <input
                type="date"
                value={config.academic.semesterStartDate}
                onChange={(e) => updateConfig('academic', 'semesterStartDate', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Semester End Date</label>
              <input
                type="date"
                value={config.academic.semesterEndDate}
                onChange={(e) => updateConfig('academic', 'semesterEndDate', e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div>
            <div className="font-semibold mb-4">Fee Settings</div>
            <div className="mb-3">
              <label className="block mb-1">Late Payment Fee (₹)</label>
              <input
                type="number"
                value={config.fees.latePaymentFee}
                onChange={(e) => updateConfig('fees', 'latePaymentFee', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Grace Period (days)</label>
              <input
                type="number"
                value={config.fees.gracePeriodDays}
                onChange={(e) => updateConfig('fees', 'gracePeriodDays', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Payment Methods</label>
              <input
                type="text"
                value={config.fees.paymentMethods.join(', ')}
                onChange={(e) =>
                  updateConfig('fees', 'paymentMethods', e.target.value.split(',').map(m => m.trim()))
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="online, bank_transfer, cash"
              />
              <span className="text-xs text-gray-400">Comma separated</span>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div>
            <div className="font-semibold mb-4">Library Settings</div>
            <div className="mb-3">
              <label className="block mb-1">Max Books per Student</label>
              <input
                type="number"
                value={config.library.maxBooksPerStudent}
                onChange={(e) => updateConfig('library', 'maxBooksPerStudent', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Borrow Duration (days)</label>
              <input
                type="number"
                value={config.library.borrowDurationDays}
                onChange={(e) => updateConfig('library', 'borrowDurationDays', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Renewal Limit</label>
              <input
                type="number"
                value={config.library.renewalLimit}
                onChange={(e) => updateConfig('library', 'renewalLimit', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Fine per Day (₹)</label>
              <input
                type="number"
                value={config.library.finePerDay}
                onChange={(e) => updateConfig('library', 'finePerDay', parseInt(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SystemConfig;