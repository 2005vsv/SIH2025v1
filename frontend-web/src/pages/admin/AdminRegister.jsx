import { useState } from 'react';
import { userAPI } from '../../services/api';

const AdminRegister = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await userAPI.registerAdmin(form);
      setMessage(res.data.message || 'Admin registered successfully');
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Register New Admin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full px-4 py-2 rounded border dark:bg-gray-800 dark:text-white" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-2 rounded border dark:bg-gray-800 dark:text-white" required />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full px-4 py-2 rounded border dark:bg-gray-800 dark:text-white" required minLength={6} />
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded" disabled={loading}>{loading ? 'Registering...' : 'Register Admin'}</button>
      </form>
      {message && <p className="mt-4 text-center text-red-500 dark:text-red-400">{message}</p>}
    </div>
  );
};

export default AdminRegister;
