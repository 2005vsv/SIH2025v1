import { motion } from 'framer-motion';
import { Calendar, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    department: user?.profile?.department || '',
    semester: user?.profile?.semester?.toString() || '',
    admissionYear: user?.profile?.admissionYear?.toString() || '',
    cgpa: user?.profile?.cgpa?.toString() || '0',
    sgpa: user?.profile?.sgpa?.toString() || '0',
  });

  // Debug: Log user data
  console.log('Profile Component - Current user data:', {
    user,
    userId: user?.id,
    email: user?.email,
    role: user?.role,
    cgpa: user?.profile?.cgpa,
    sgpa: user?.profile?.sgpa,
    profile: user?.profile,
    fullProfile: JSON.stringify(user?.profile, null, 2)
  });

  // Fetch latest user profile data on component mount - always fetch for debugging
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          console.log('Profile - Fetching fresh user data...');
          const response = await api.get('/auth/profile');
          if (response.data.success) {
            const userData = response.data.data.user;
            console.log('Profile - Received fresh user data:', userData);
            updateUser(userData);
            
            // Update form data with fresh user data
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.profile?.phone || '',
              address: userData.profile?.address || '',
              department: userData.profile?.department || '',
              semester: userData.profile?.semester?.toString() || '',
              admissionYear: userData.profile?.admissionYear?.toString() || '',
              cgpa: userData.profile?.cgpa?.toString() || '0',
              sgpa: userData.profile?.sgpa?.toString() || '0',
            });
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id, updateUser]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const profileData = {
        name: formData.name,
        profile: {
          phone: formData.phone,
          address: formData.address,
          department: formData.department,
          semester: parseInt(formData.semester) || 1,
          admissionYear: parseInt(formData.admissionYear) || new Date().getFullYear(),
          cgpa: parseFloat(formData.cgpa) || 0,
          sgpa: parseFloat(formData.sgpa) || 0,
        }
      };
      
      const response = await api.put('/users/profile', profileData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                    <p className="text-blue-100">{user?.role === 'student' ? 'Student' : 'Administrator'}</p>
                    {user?.studentId && (
                      <p className="text-blue-100">ID: {user.studentId}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Enter your email"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Enter your address"
                          rows={3}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., Computer Science"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Semester
                      </label>
                      <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admission Year
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          value={formData.admissionYear}
                          onChange={(e) => setFormData({ ...formData, admissionYear: e.target.value })}
                          disabled={!isEditing}
                          placeholder="e.g., 2023"
                          min="2000"
                          max="2030"
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CGPA
                        </label>
                        <input
                          type="number"
                          value={formData.cgpa}
                          onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                          disabled={!isEditing}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          max="10"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SGPA
                        </label>
                        <input
                          type="number"
                          value={formData.sgpa}
                          onChange={(e) => setFormData({ ...formData, sgpa: e.target.value })}
                          disabled={!isEditing}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          max="10"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Achievements Section */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-blue-900">1,250 Points</p>
                            <p className="text-sm text-blue-700">Current Level: Bronze</p>
                          </div>
                          <div className="text-2xl">🏆</div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-700 mb-2">Badges Earned:</p>
                          <div className="flex space-x-2">
                            {['📚', '💰', '🏠', '📝', '🎯'].map((badge, index) => (
                              <span key={index} className="text-2xl p-2 bg-white rounded-lg shadow-sm">
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex justify-center"
                >
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Save className="w-5 h-5" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
