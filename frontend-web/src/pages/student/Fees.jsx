import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Search,
  Download,
  Receipt,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  History,
  Eye,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Card
} from 'lucide-react';
import { feeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';

const StudentFees = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State management
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, fee: null });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Fetch fees on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view fees');
      navigate('/login');
      return;
    }
    fetchFees();
  }, [isAuthenticated, navigate]);

  // Fetch fees from API
  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getMy();
      console.log('API Response:', response); // Debug log

      let feesArray = [];
      if (response?.data?.success) {
        // Try different possible response structures
        if (Array.isArray(response.data.data?.fees)) {
          feesArray = response.data.data.fees;
        } else if (Array.isArray(response.data?.fees)) {
          feesArray = response.data.fees;
        } else if (Array.isArray(response.data?.data)) {
          feesArray = response.data.data;
        } else if (Array.isArray(response.data)) {
          feesArray = response.data;
        }
        toast.success('Fees loaded successfully');
      } else {
        // Fallback to empty array
        feesArray = [];
        toast.error(response?.data?.message || 'Failed to load fees');
      }

      // Ensure all items are valid objects
      feesArray = feesArray.filter(fee => fee && typeof fee === 'object');
      setFees(feesArray);
    } catch (error) {
      console.error('Error fetching fees:', error);
      setFees([]);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment
  const handlePayment = async (fee) => {
    if (!fee || !fee._id) {
      toast.error('Invalid fee data');
      return;
    }

    try {
      setPaymentLoading(true);

      // Create payment order
      const orderResponse = await feeAPI.createPaymentOrder({
        feeId: fee._id,
        gateway: 'razorpay' // or 'manual'
      });

      if (!orderResponse?.data?.success) {
        throw new Error(orderResponse?.data?.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data.data;

      if (orderData.gateway === 'manual') {
        // Manual payment - directly verify
        const verifyResponse = await feeAPI.verifyPayment({
          feeId: fee._id,
          gateway: 'manual',
          amount: paymentAmount ? Number(paymentAmount) : undefined
        });

        if (verifyResponse?.data?.success) {
          toast.success('Payment successful!');
          setPaymentModal({ isOpen: false, fee: null });
          setPaymentAmount('');
          fetchFees(); // Refresh fees
        } else {
          throw new Error(verifyResponse?.data?.message || 'Payment verification failed');
        }
      } else {
        // Gateway payment - would integrate with Razorpay SDK here
        // For now, simulate success
        toast.success('Payment order created! In real implementation, this would redirect to payment gateway.');
        setPaymentModal({ isOpen: false, fee: null });
        setPaymentAmount('');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Download receipt
  const downloadReceipt = async (feeId) => {
    if (!feeId) {
      toast.error('Invalid fee ID');
      return;
    }

    try {
      toast.loading('Downloading receipt...');
      const response = await feeAPI.generateReceipt(feeId);
      if (response?.data) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${feeId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success('Receipt downloaded successfully!');
      } else {
        throw new Error('No receipt data received');
      }
    } catch (error) {
      console.error('Receipt download error:', error);
      toast.dismiss();
      toast.error('Failed to download receipt');
    }
  };

  // Filtered fees with robust null checks
  const filteredFees = useMemo(() => {
    if (!Array.isArray(fees)) return [];

    return fees.filter(fee => {
      try {
        // Skip invalid fee objects
        if (!fee || typeof fee !== 'object' || !fee._id) return false;

        // Status filter
        const feeStatus = (typeof fee.status === 'string' ? fee.status : '').toLowerCase();
        const matchesFilter = filter === 'all' || feeStatus === filter;

        // Search filter - safe string conversion
        const safeSearchTerm = (typeof searchTerm === 'string' ? searchTerm : '').toLowerCase().trim();
        const feeDescription = (typeof fee.description === 'string' ? fee.description : '').toLowerCase();
        const feeType = (typeof fee.feeType === 'string' ? fee.feeType : '').toLowerCase();

        const matchesSearch = !safeSearchTerm ||
          feeDescription.includes(safeSearchTerm) ||
          feeType.includes(safeSearchTerm);

        return matchesFilter && matchesSearch;
      } catch (error) {
        console.warn('Error filtering fee:', error, fee);
        return false;
      }
    });
  }, [fees, filter, searchTerm]);

  // Calculate totals with null checks
  const totalDues = useMemo(() => {
    if (!Array.isArray(fees)) return 0;

    return fees.reduce((sum, fee) => {
      if (!fee || typeof fee !== 'object') return sum;

      const status = fee.status || '';
      if (status === 'pending' || status === 'overdue') {
        const amount = Number(fee.amount) || 0;
        const paidAmount = Number(fee.paidAmount) || 0;
        return sum + Math.max(0, amount - paidAmount);
      }
      return sum;
    }, 0);
  }, [fees]);

  const totalPaid = useMemo(() => {
    if (!Array.isArray(fees)) return 0;

    return fees.reduce((sum, fee) => {
      if (!fee || typeof fee !== 'object') return sum;

      const status = fee.status || '';
      if (status === 'paid') {
        return sum + (Number(fee.amount) || 0);
      }
      return sum;
    }, 0);
  }, [fees]);

  const overdueCount = useMemo(() => {
    if (!Array.isArray(fees)) return 0;

    return fees.filter(fee =>
      fee &&
      typeof fee === 'object' &&
      (fee.status || '') === 'overdue'
    ).length;
  }, [fees]);

  // Status styling
  const getStatusColor = (status) => {
    const safeStatus = status || '';
    switch (safeStatus) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    const safeStatus = status || '';
    switch (safeStatus) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-600 inline mr-1" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600 inline mr-1" />;
      case 'partial': return <History className="w-4 h-4 text-yellow-600 inline mr-1" />;
      default: return <FileText className="w-4 h-4 text-gray-400 inline mr-1" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <BackButton />
        <h1 className="text-3xl font-bold mb-2">Fee Management</h1>
        <p className="text-lg text-gray-600">Manage your fees, make payments, and view transaction history</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="font-semibold text-blue-600">Total Dues</div>
          <div className="text-2xl font-bold">₹{totalDues.toLocaleString()}</div>
          {overdueCount > 0 && (
            <div className="text-xs text-red-600 mt-1">{overdueCount} overdue</div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="font-semibold text-green-600">Total Paid</div>
          <div className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">This academic year</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="font-semibold text-purple-600">Total Fees</div>
          <div className="text-2xl font-bold">{fees.length}</div>
          <div className="text-xs text-gray-500 mt-1">Fee items</div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search fees by description or type..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value || '')}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        <div>
          <select
            value={filter || 'all'}
            onChange={(e) => setFilter(e.target.value || 'all')}
            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </motion.div>

      {/* Fees List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.map((fee, index) => (
              <motion.tr
                key={fee?._id || `fee-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  {(fee?.feeType || '').toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{fee?.description || 'N/A'}</div>
                  {fee?.academicYear && (
                    <div className="text-xs text-gray-400">Academic Year: {fee.academicYear}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">₹{(fee?.amount || 0).toLocaleString()}</div>
                  {fee?.paidAmount && fee.paidAmount > 0 && (
                    <div className="text-xs text-green-600">Paid: ₹{fee.paidAmount.toLocaleString()}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {fee?.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                </td>
                <td className={`px-4 py-3 ${getStatusColor(fee?.status)} rounded-lg`}>
                  {getStatusIcon(fee?.status)}
                  {((fee?.status || '').charAt(0).toUpperCase() + (fee?.status || '').slice(1))}
                </td>
                <td className="px-4 py-3">
                  {(fee?.status !== 'paid') && (
                    <button
                      onClick={() => setPaymentModal({ isOpen: true, fee })}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Pay Now
                    </button>
                  )}
                  {fee?.status === 'paid' && (
                    <button
                      onClick={() => downloadReceipt(fee._id)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Receipt
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filteredFees.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No fees found matching your criteria
          </div>
        )}
      </motion.div>

      {/* Payment Modal */}
      {paymentModal.isOpen && paymentModal.fee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pay Fee</h2>
              <button
                onClick={() => setPaymentModal({ isOpen: false, fee: null })}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="mb-2 font-semibold">{paymentModal.fee?.description || 'N/A'}</div>
             <div className="mb-2 text-sm text-gray-500">
               {paymentModal.fee?.feeType || 'N/A'} Fee
             </div>
             <div className="mb-4">
               <div className="text-sm text-gray-600 mb-1">Outstanding Amount: ₹{((paymentModal.fee?.amount || 0) - (paymentModal.fee?.paidAmount || 0)).toLocaleString()}</div>
               <label className="block text-sm font-medium mb-1">Payment Amount</label>
               <input
                 type="number"
                 value={paymentAmount}
                 onChange={(e) => setPaymentAmount(e.target.value)}
                 placeholder={`Max: ${((paymentModal.fee?.amount || 0) - (paymentModal.fee?.paidAmount || 0)).toLocaleString()}`}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                 min="1"
                 max={(paymentModal.fee?.amount || 0) - (paymentModal.fee?.paidAmount || 0)}
               />
             </div>
            <div className="mb-4">
              <div className="font-semibold mb-2">Payment Method</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: Card },
                  { id: 'upi', label: 'UPI', icon: Wallet },
                  { id: 'netbanking', label: 'Net Banking', icon: CreditCard },
                  { id: 'wallet', label: 'Wallet', icon: Wallet }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(id)}
                    className={`p-3 border rounded-lg text-sm font-medium flex flex-col items-center justify-center space-y-1 ${
                      selectedPaymentMethod === id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPaymentModal({ isOpen: false, fee: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePayment(paymentModal.fee)}
                disabled={paymentLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {paymentLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-1" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;