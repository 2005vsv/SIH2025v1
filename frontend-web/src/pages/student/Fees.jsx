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
  CreditCard as Card
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { feeAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import BackButton from '../../components/BackButton';

const StudentFees = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [fees, setFees] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dues');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, fee: null });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view fees');
      navigate('/login');
      return;
    }
    fetchFees();
    fetchPaymentHistory();
    // eslint-disable-next-line
  }, [isAuthenticated, navigate]);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to view fees');
        return;
      }
      const response = await feeAPI.getMy();
      if (response.data.success) {
        setFees(response.data.data.fees || []);
        setIsUsingMockData(false);
        toast.success('Fees loaded successfully from server');
      } else {
        // Fallback to mock data for development
        const mockFees = [
          {
            _id: '1',
            feeType: 'tuition',
            amount: 25000,
            description: 'Semester 6 Tuition Fee',
            dueDate: '2024-12-31',
            status: 'pending',
            semester: 6,
            academicYear: '2024-25'
          },
          {
            _id: '2',
            feeType: 'hostel',
            amount: 5000,
            description: 'Hostel Fee for December',
            dueDate: '2024-12-15',
            status: 'paid',
            paidAt: '2024-11-10',
            paidAmount: 5000,
            transactionId: 'TXN123456789'
          },
          {
            _id: '3',
            feeType: 'library',
            amount: 200,
            description: 'Library Fine',
            dueDate: '2024-11-30',
            status: 'overdue'
          }
        ];
        setFees(mockFees);
        setIsUsingMockData(true);
        toast.error(response.data.message || 'Failed to load fees - using mock data');
      }
    } catch (error) {
      // Fallback to mock data for development
      const mockFees = [
        {
          _id: '1',
          feeType: 'tuition',
          amount: 25000,
          description: 'Semester 6 Tuition Fee',
          dueDate: '2024-12-31',
          status: 'pending',
          semester: 6,
          academicYear: '2024-25'
        },
        {
          _id: '2',
          feeType: 'hostel',
          amount: 5000,
          description: 'Hostel Fee for December',
          dueDate: '2024-12-15',
          status: 'paid',
          paidAt: '2024-11-10',
          paidAmount: 5000,
          transactionId: 'TXN123456789'
        },
        {
          _id: '3',
          feeType: 'library',
          amount: 200,
          description: 'Library Fine',
          dueDate: '2024-11-30',
          status: 'overdue'
        },
        {
          _id: '4',
          feeType: 'examination',
          amount: 1200,
          description: 'Semester End Examination Fee',
          dueDate: '2024-12-01',
          status: 'pending'
        }
      ];
      setFees(mockFees);
      setIsUsingMockData(true);
      toast.error('Failed to connect to server - using mock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      // Mock payment history for now - this would come from the API
      const mockHistory = [
        {
          _id: '1',
          feeId: 'fee1',
          amount: 5000,
          transactionId: 'TXN123456789',
          paymentMethod: 'card',
          paidAt: '2024-01-15T10:30:00Z',
          status: 'success',
          receipt: 'receipt1.pdf'
        },
        {
          _id: '2',
          feeId: 'fee2',
          amount: 200,
          transactionId: 'TXN987654321',
          paymentMethod: 'upi',
          paidAt: '2024-02-10T14:20:00Z',
          status: 'success',
          receipt: 'receipt2.pdf'
        }
      ];
      setPaymentHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const handlePayment = async (fee) => {
    try {
      setPaymentLoading(true);
      const paymentData = {
        paymentMethod: selectedPaymentMethod,
        amount: fee.amount - (fee.paidAmount || 0)
      };
      const response = await feeAPI.pay(fee._id, paymentData);
      if (response.data.success) {
        toast.success('Payment successful!');
        setPaymentModal({ isOpen: false, fee: null });
        fetchFees();
        fetchPaymentHistory();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const downloadReceipt = async (feeId) => {
    try {
      toast.loading('Downloading receipt...');
      const response = await feeAPI.generateReceipt(feeId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${feeId}.pdf`;
      link.click();
      toast.dismiss();
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download receipt');
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesFilter = filter === 'all' || fee.status === filter;
    const matchesSearch = fee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />;
      case 'pending': return <Clock className="w-4 h-4 text-blue-600 inline mr-1" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-600 inline mr-1" />;
      case 'partial': return <History className="w-4 h-4 text-yellow-600 inline mr-1" />;
      default: return <FileText className="w-4 h-4 text-gray-400 inline mr-1" />;
    }
  };

  const totalDues = fees.filter(fee => fee.status === 'pending' || fee.status === 'overdue').reduce((sum, fee) => sum + (fee.amount - (fee.paidAmount || 0)), 0);
  const totalPaid = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const overdueCount = fees.filter(fee => fee.status === 'overdue').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Fee Management</h1>
        <p className="text-lg text-gray-600">Manage your fees, make payments, and view transaction history</p>
        {/* Mock Data Indicator */}
        {isUsingMockData && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg p-3 mt-4 text-sm">
            <strong>Development Mode:</strong> Currently showing mock data.<br />
            Please ensure you're logged in and the backend server is running to see real data.
          </div>
        )}
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

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-6 mb-6">
        <button
          onClick={() => setActiveTab('dues')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dues' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Fee Dues
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
        >
          Payment History
        </button>
      </div>

      {activeTab === 'dues' && (
        <>
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
                placeholder="Search fees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <div>
              <Filter className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
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
                    key={fee._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{fee.feeType.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      {fee.description}
                      {fee.academicYear && (
                        <div className="text-xs text-gray-400">Academic Year: {fee.academicYear}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      ₹{fee.amount.toLocaleString()}
                      {fee.paidAmount && fee.paidAmount > 0 && (
                        <div className="text-xs text-green-600">Paid: ₹{fee.paidAmount.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 ${getStatusColor(fee.status)} rounded-lg`}>
                      {getStatusIcon(fee.status)}
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                    </td>
                    <td className="px-4 py-3">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => setPaymentModal({ isOpen: true, fee })}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          Pay Now
                        </button>
                      )}
                      {fee.status === 'paid' && (
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
              <div className="p-6 text-center text-gray-500">No fees found matching your criteria</div>
            )}
          </motion.div>
        </>
      )}

      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment, index) => (
                <motion.tr
                  key={payment._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{payment.transactionId}</td>
                  <td className="px-4 py-3">₹{payment.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{payment.paymentMethod.toUpperCase()}</td>
                  <td className="px-4 py-3">{new Date(payment.paidAt).toLocaleDateString()}</td>
                  <td className={`px-4 py-3 ${getStatusColor(payment.status)} rounded-lg`}>
                    {getStatusIcon(payment.status)}
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </td>
                  <td className="px-4 py-3">
                    {payment.receipt && (
                      <button
                        onClick={() => downloadReceipt(payment.feeId)}
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
          {paymentHistory.length === 0 && (
            <div className="p-6 text-center text-gray-500">No payment history available</div>
          )}
        </motion.div>
      )}

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
            <div className="mb-2 font-semibold">{paymentModal.fee.description}</div>
            <div className="mb-2 text-sm text-gray-500">{paymentModal.fee.feeType} Fee</div>
            <div className="mb-4 text-2xl font-bold text-blue-600">
              ₹{(paymentModal.fee.amount - (paymentModal.fee.paidAmount || 0)).toLocaleString()}
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-2">Payment Method</div>
              <div className="flex gap-2">
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
                    {label}
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