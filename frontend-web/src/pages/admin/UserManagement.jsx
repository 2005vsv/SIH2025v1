import { motion } from 'framer-motion';
import {
  Edit,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Default values for new/edit user
  const defaultSemester = 1;
  const defaultCgpa = 0;
  const defaultSgpa = 0;
  const defaultIsActive = true;

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student',
    studentId: '',
    password: '',
    profile: {
      phone: '',
      address: '',
      dateOfBirth: '',
      department: '',
      semester: defaultSemester,
      admissionYear: new Date().getFullYear(),
      cgpa: defaultCgpa,
      sgpa: defaultSgpa
    }
  });

  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'student',
    studentId: '',
    isActive: defaultIsActive,
    profile: {
      phone: '',
      address: '',
      dateOfBirth: '',
      department: '',
      semester: defaultSemester,
      admissionYear: new Date().getFullYear(),
      cgpa: defaultCgpa,
      sgpa: defaultSgpa
    }
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Frontend validation
      if (!newUser.name?.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!newUser.email?.trim()) {
        toast.error('Email is required');
        return;
      }
      if (!newUser.password?.trim()) {
        toast.error('Password is required');
        return;
      }
      if (newUser.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
      // Check password complexity
      const hasUpper = /[A-Z]/.test(newUser.password);
      const hasLower = /[a-z]/.test(newUser.password);
      const hasNumber = /\d/.test(newUser.password);
      if (!hasUpper || !hasLower || !hasNumber) {
        toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
      }

      const userData = {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        password: newUser.password.trim(),
        ...(newUser.studentId?.trim() && { studentId: newUser.studentId.trim() })
      };

      // Only include profile for students
      if (newUser.role === 'student') {
        const profile = {};
        if (newUser.profile.phone?.trim()) profile.phone = newUser.profile.phone.trim();
        if (newUser.profile.address?.trim()) profile.address = newUser.profile.address.trim();
        if (newUser.profile.department?.trim()) profile.department = newUser.profile.department.trim();
        if (newUser.profile.semester) profile.semester = Number(newUser.profile.semester) || 1;
        if (newUser.profile.admissionYear) profile.admissionYear = Number(newUser.profile.admissionYear) || new Date().getFullYear();
        if (newUser.profile.cgpa !== undefined && newUser.profile.cgpa !== '' && !isNaN(Number(newUser.profile.cgpa))) profile.cgpa = Number(newUser.profile.cgpa);
        if (newUser.profile.sgpa !== undefined && newUser.profile.sgpa !== '' && !isNaN(Number(newUser.profile.sgpa))) profile.sgpa = Number(newUser.profile.sgpa);

        if (Object.keys(profile).length > 0) {
          userData.profile = profile;
        }
      }

      await userAPI.create(userData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        role: 'student',
        studentId: '',
        password: '',
        profile: {
          phone: '',
          address: '',
          dateOfBirth: '',
          department: '',
          semester: defaultSemester,
          admissionYear: new Date().getFullYear(),
          cgpa: defaultCgpa,
          sgpa: defaultSgpa
        }
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (!selectedUser) return;

      if (!editUser.name.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!editUser.email.trim()) {
        toast.error('Email is required');
        return;
      }

      // Build userData with only fields expected by backend
      const userData = {
        name: editUser.name.trim(),
        email: editUser.email.trim(),
        role: editUser.role,
        isActive: editUser.isActive,
      };

      if (editUser.studentId) userData.studentId = editUser.studentId.trim();

      // Only include profile if role is student
      if (editUser.role === 'student') {
        const profile = {};
        if (editUser.profile.phone?.trim()) profile.phone = editUser.profile.phone.trim();
        if (editUser.profile.address?.trim()) profile.address = editUser.profile.address.trim();
        if (editUser.profile.department?.trim()) profile.department = editUser.profile.department.trim();
        // Only send dateOfBirth if valid
        if (editUser.profile.dateOfBirth && !isNaN(Date.parse(editUser.profile.dateOfBirth))) profile.dateOfBirth = editUser.profile.dateOfBirth;
        // Only send semester if valid
        if (editUser.profile.semester && Number.isInteger(Number(editUser.profile.semester))) profile.semester = Number(editUser.profile.semester);
        // Only send admissionYear if valid
        if (editUser.profile.admissionYear && Number(editUser.profile.admissionYear) >= 1990 && Number(editUser.profile.admissionYear) <= new Date().getFullYear()) profile.admissionYear = Number(editUser.profile.admissionYear);
        // Only send cgpa if valid
        if (editUser.profile.cgpa !== undefined && editUser.profile.cgpa !== '' && !isNaN(Number(editUser.profile.cgpa))) profile.cgpa = Number(editUser.profile.cgpa);
        // Only send sgpa if valid
        if (editUser.profile.sgpa !== undefined && editUser.profile.sgpa !== '' && !isNaN(Number(editUser.profile.sgpa))) profile.sgpa = Number(editUser.profile.sgpa);
        userData.profile = profile;
      }

      if (!selectedUser._id) throw new Error('User ID is missing');

      await userAPI.update(selectedUser._id, userData);
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      // Show backend error details for debugging
      const msg = error.response?.data?.message || error.response?.data || error.message || 'Failed to update user';
      toast.error(`Update failed: ${msg}`);
      // Optionally log error to console for devs
      console.error('Update user error:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.delete(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      await userAPI.update(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'faculty': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <span className="text-gray-500">Loading...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          User Management
        </h1>
        <div className="text-gray-500">Manage students, faculty, and administrators</div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admins</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left">User</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Details</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-t">
                <td className="py-2 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 px-4 text-xs text-gray-700">
                  {user.studentId && <span className="mr-2">ID: {user.studentId}</span>}
                  {user.profile?.department && <span className="mr-2">Dept: {user.profile.department}</span>}
                  {user.profile?.semester && <span>Sem: {user.profile.semester}</span>}
                </td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    onClick={() => handleToggleUserStatus(user)}
                    className={`p-2 rounded-lg ${
                      user.isActive
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                  >
                    {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setEditUser({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        studentId: user.studentId || '',
                        isActive: user.isActive,
                        profile: {
                          phone: user.profile?.phone || '',
                          address: user.profile?.address || '',
                          dateOfBirth: user.profile?.dateOfBirth || '',
                          department: user.profile?.department || '',
                          semester: user.profile?.semester || defaultSemester,
                          admissionYear: user.profile?.admissionYear || new Date().getFullYear(),
                          cgpa: user.profile?.cgpa !== undefined ? user.profile.cgpa : defaultCgpa,
                          sgpa: user.profile?.sgpa !== undefined ? user.profile.sgpa : defaultSgpa
                        }
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Students</div>
          <div className="text-2xl font-bold">{users.filter(u => u.role === 'student').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Faculty</div>
          <div className="text-2xl font-bold">{users.filter(u => u.role === 'faculty').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-xs text-gray-500 mb-1">Active Users</div>
          <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-bold">Create New User</div>
              <button
                onClick={() => setShowCreateModal(false)}
                aria-label="Close create user modal"
                className="text-gray-500 hover:text-gray-700 ml-3"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              {newUser.role === 'student' && (
                <div className="border-t pt-4 mt-4">
                  <div className="font-semibold mb-3">Student Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Student ID</label>
                      <input
                        type="text"
                        value={newUser.studentId}
                        onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter student ID"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={newUser.profile.phone}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          profile: { ...newUser.profile, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Department</label>
                      <select
                        value={newUser.profile.department}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          profile: { ...newUser.profile, department: e.target.value }
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

                    <div>
                      <label className="block mb-1">Current Semester</label>
                      <select
                        value={newUser.profile.semester}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          profile: { ...newUser.profile, semester: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Admission Year</label>
                      <input
                        type="number"
                        value={newUser.profile.admissionYear}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          profile: { ...newUser.profile, admissionYear: Number(e.target.value) }
                        })}
                        min="1990"
                        max={new Date().getFullYear()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2024"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-1">Address</label>
                      <textarea
                        value={newUser.profile.address}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          profile: { ...newUser.profile, address: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter full address"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">CGPA</label>
                      <input
                        type="number"
                        value={newUser.profile.cgpa}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          profile: { ...newUser.profile, cgpa: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="10"
                        step="0.01"
                        placeholder="Enter CGPA (0-10)"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">SGPA</label>
                      <input
                        type="number"
                        value={newUser.profile.sgpa}
                        onChange={(e) => setNewUser({
                          ...newUser,
                          profile: { ...newUser.profile, sgpa: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="10"
                        step="0.01"
                        placeholder="Enter SGPA (0-10)"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-xl font-bold">Edit User</div>
              <button
                onClick={() => setShowEditModal(false)}
                aria-label="Close edit user modal"
                className="text-gray-500 hover:text-gray-700 ml-3"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Role *</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Status</label>
                  <select
                    value={editUser.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setEditUser({ ...editUser, isActive: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {editUser.role === 'student' && (
                <div className="border-t pt-4 mt-4">
                  <div className="font-semibold mb-3">Student Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Student ID</label>
                      <input
                        type="text"
                        value={editUser.studentId}
                        onChange={(e) => setEditUser({ ...editUser, studentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter student ID"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={editUser.profile.phone}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          profile: { ...editUser.profile, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Department</label>
                      <select
                        value={editUser.profile.department}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          profile: { ...editUser.profile, department: e.target.value }
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

                    <div>
                      <label className="block mb-1">Current Semester</label>
                      <select
                        value={editUser.profile.semester}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          profile: { ...editUser.profile, semester: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1">Admission Year</label>
                      <input
                        type="number"
                        value={editUser.profile.admissionYear}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          profile: { ...editUser.profile, admissionYear: Number(e.target.value) }
                        })}
                        min="1990"
                        max={new Date().getFullYear()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 2024"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-1">Address</label>
                      <textarea
                        value={editUser.profile.address}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          profile: { ...editUser.profile, address: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter full address"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">CGPA</label>
                      <input
                        type="number"
                        value={editUser.profile.cgpa}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          profile: { ...editUser.profile, cgpa: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="10"
                        step="0.01"
                        placeholder="Enter CGPA (0-10)"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">SGPA</label>
                      <input
                        type="number"
                        value={editUser.profile.sgpa}
                        onChange={(e) => setEditUser({
                          ...editUser,
                          profile: { ...editUser.profile, sgpa: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="10"
                        step="0.01"
                        placeholder="Enter SGPA (0-10)"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;