import { motion } from 'framer-motion';
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  CreditCard
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { feeAPI } from '../../services/api';

const FeesManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newFee, setNewFee] = useState({
    userId: '',
    feeType: 'tuition',
    amount: 0,
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getAll();
      setFees(response.data.data.fees || []);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async () => {
    try {
      await feeAPI.create(newFee);
      toast.success('Fee created successfully');
      setShowCreateModal(false);
      setNewFee({
        userId: '',
        feeType: 'tuition',
        amount: 0,
        description: '',
        dueDate: ''
      });
      fetchFees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create fee');
    }
  };

  const handleDeleteFee = async (feeId) => {
    if (!window.confirm('Are you sure you want to delete this fee?')) return;
    try {
      await feeAPI.delete(feeId);
      toast.success('Fee deleted successfully');
      fetchFees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete fee');
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = (fee.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (fee.user?.studentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (fee.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    const matchesType = typeFilter === 'all' || fee.feeType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="inline w-4 h-4 text-green-500 mr-1" />;
      case 'pending': return <Clock className="inline w-4 h-4 text-yellow-500 mr-1" />;
      case 'overdue': return <XCircle className="inline w-4 h-4 text-red-500 mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalStats = () => {
    const total = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const paid = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const pending = fees.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const overdue = fees.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + (fee.amount || 0), 0);
    return { total, paid, pending, overdue };
  };

  const stats = getTotalStats();

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
          <DollarSign className="w-6 h-6 text-blue-500" />
          Fees Management
        </h1>
        <div className="text-gray-500">Manage student fees and payments</div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Total Fees</div>
          <div className="text-2xl font-bold">₹{stats.total.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Paid</div>
          <div className="text-2xl font-bold">₹{stats.paid.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Pending</div>
          <div className="text-2xl font-bold">₹{stats.pending.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Overdue</div>
          <div className="text-2xl font-bold">₹{stats.overdue.toLocaleString()}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search fees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="tuition">Tuition</option>
          <option value="hostel">Hostel</option>
          <option value="library">Library</option>
          <option value="examination">Examination</option>
          <option value="other">Other</option>
        </select>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          Add Fee
        </button>
      </div>

      {/* Fees Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.map((fee) => (
              <tr key={fee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-semibold">{fee.user?.name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{fee.user?.studentId || fee.user?.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div>{fee.feeType}</div>
                  <div className="text-xs text-gray-500">{fee.description}</div>
                </td>
                <td className="px-6 py-4">₹{fee.amount?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(fee.status)}`}>
                    {getStatusIcon(fee.status)}
                    {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit Fee"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  {fee.receiptUrl && (
                    <a
                      href={fee.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Download Receipt"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteFee(fee._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Fee"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredFees.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-8">
                  No fees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Fee Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Fee</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Student ID</label>
              <input
                type="text"
                value={newFee.userId}
                onChange={e => setNewFee({ ...newFee, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Fee Type</label>
              <select
                value={newFee.feeType}
                onChange={e => setNewFee({ ...newFee, feeType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="tuition">Tuition</option>
                <option value="hostel">Hostel</option>
                <option value="library">Library</option>
                <option value="examination">Examination</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Amount</label>
              <input
                type="number"
                value={newFee.amount}
                onChange={e => setNewFee({ ...newFee, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Description</label>
              <input
                type="text"
                value={newFee.description}
                onChange={e => setNewFee({ ...newFee, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Due Date</label>
              <input
                type="date"
                value={newFee.dueDate}
                onChange={e => setNewFee({ ...newFee, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFee}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Fee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;