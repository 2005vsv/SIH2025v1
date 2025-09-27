import { useState } from 'react';
import { userAPI } from '../../services/api';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');
  setError('');
  
  try {
    // Use the shared API service, which handles token automatically
    const res = await userAPI.changeAdminPassword({ oldPassword, newPassword });
    setMessage(res.data.message);
    setOldPassword('');
    setNewPassword('');
  } catch (err) {
    setError(err.response?.data?.message || 'Error changing password');
  }
};


  return (
  <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-gray-700 dark:text-gray-300">Old Password</label>
          <input
            type="password"
            className="w-full border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="text-gray-700 dark:text-gray-300">New Password</label>
          <input
            type="password"
            className="w-full border p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
  <button type="submit" className="bg-blue-600 text-white dark:bg-blue-700 dark:text-white px-4 py-2 rounded">Change Password</button>
      </form>
  {message && <div className="text-green-600 dark:text-green-400 mt-2">{message}</div>}
  {error && <div className="text-red-600 dark:text-red-400 mt-2">{error}</div>}
    </div>
  );
};

export default ChangePassword;