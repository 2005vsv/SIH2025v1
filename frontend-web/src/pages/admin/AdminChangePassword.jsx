import { useState } from 'react';
import { userAPI } from '../../services/api';

import { useAuth } from '../../contexts/AuthContext';

const AdminChangePassword = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Only allow admin users to use this form
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Change Admin Password</h2>
        <p className="text-red-600 dark:text-red-400">Access denied. Only admin users can change admin password.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await userAPI.changeAdminPassword(form);
      setMessage(res.data.message || 'Password changed successfully');
      setForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Password change failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Change Admin Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="Current Password" className="w-full px-4 py-2 rounded border dark:bg-gray-800 dark:text-white" required />
        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New Password" className="w-full px-4 py-2 rounded border dark:bg-gray-800 dark:text-white" required minLength={6} />
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
      </form>
      {message && <p className="mt-4 text-center text-red-500 dark:text-red-400">{message}</p>}
    </div>
  );
};

export default AdminChangePassword;
