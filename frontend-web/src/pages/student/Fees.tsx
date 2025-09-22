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
  Wallet,
  CreditCard as Card
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { feeAPI } from '../../services/api';

interface Fee {
  _id: string;
  feeType: 'tuition' | 'hostel' | 'library' | 'examination' | 'lab' | 'sports' | 'development' | 'other';
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAt?: string;
  paidAmount?: number;
  transactionId?: string;
  semester?: number;
  academicYear?: string;
}

interface PaymentHistory {
  _id: string;
  feeId: string;
  amount: number;
  transactionId: string;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  paidAt: string;
  status: 'success' | 'failed' | 'pending';
  receipt?: string;
}

interface PaymentModal {
  isOpen: boolean;
  fee: Fee | null;
}

const StudentFees: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dues' | 'history'>('dues');
  const [paymentModal, setPaymentModal] = useState<PaymentModal>({ isOpen: false, fee: null });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');

  useEffect(() => {
    fetchFees();
    fetchPaymentHistory();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getMy();
      if (response.data.success) {
        setFees(response.data.data.fees || []);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      // Mock payment history for now - this would come from the API
      const mockHistory: PaymentHistory[] = [
        {
          _id: '1',
          feeId: 'fee1',
          amount: 25000,
          transactionId: 'TXN123456789',
          paymentMethod: 'card',
          paidAt: '2024-01-15T10:30:00Z',
          status: 'success',
          receipt: 'receipt1.pdf'
        },
        {
          _id: '2',
          feeId: 'fee2',
          amount: 15000,
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

  const handlePayment = async (fee: Fee) => {
    try {
      setPaymentLoading(true);
      
      // Mock payment processing
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
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const downloadReceipt = async (feeId: string) => {
    try {
      toast.loading('Downloading receipt...');
      const response = await feeAPI.generateReceipt(feeId);
      
      // Create a download link for the receipt
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
      console.error('Error downloading receipt:', error);
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesFilter = filter === 'all' || fee.status === filter;
    const matchesSearch = fee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'partial': return <CreditCard className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const totalDues = fees.filter(fee => fee.status === 'pending' || fee.status === 'overdue').reduce((sum, fee) => sum + (fee.amount - (fee.paidAmount || 0)), 0);
  const totalPaid = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const overdueCount = fees.filter(fee => fee.status === 'overdue').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fee Management</h1>
          <p className="text-gray-600">Manage your fees, make payments, and view transaction history</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dues</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalDues.toLocaleString()}</p>
                {overdueCount > 0 && (
                  <p className="text-sm text-red-600">{overdueCount} overdue</p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</p>
                <p className="text-sm text-green-600">This academic year</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">{fees.length}</p>
                <p className="text-sm text-blue-600">Fee items</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dues')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dues'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fee Dues
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'dues' && (
          <>
            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search fees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as any)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fees List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Fee Details</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFees.map((fee, index) => (
                      <motion.tr
                        key={fee._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {fee.feeType.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{fee.description}</div>
                          {fee.academicYear && (
                            <div className="text-xs text-gray-500">Academic Year: {fee.academicYear}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{fee.amount.toLocaleString()}
                          </div>
                          {fee.paidAmount && fee.paidAmount > 0 && (
                            <div className="text-xs text-green-600">
                              Paid: ₹{fee.paidAmount.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(fee.status)}`}>
                            {getStatusIcon(fee.status)}
                            <span className="ml-1 capitalize">{fee.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {fee.status !== 'paid' && (
                              <button
                                onClick={() => setPaymentModal({ isOpen: true, fee })}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Pay Now
                              </button>
                            )}
                            {fee.status === 'paid' && (
                              <button
                                onClick={() => downloadReceipt(fee._id)}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Receipt
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filteredFees.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No fees found matching your criteria</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentHistory.map((payment, index) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{payment.paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {payment.receipt && (
                          <button
                            onClick={() => downloadReceipt(payment.feeId)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Receipt
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {paymentHistory.length === 0 && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payment history available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && paymentModal.fee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pay Fee</h3>
              <button
                onClick={() => setPaymentModal({ isOpen: false, fee: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900">{paymentModal.fee.description}</h4>
                <p className="text-sm text-gray-600 capitalize">{paymentModal.fee.feeType} Fee</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  ₹{(paymentModal.fee.amount - (paymentModal.fee.paidAmount || 0)).toLocaleString()}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'card', label: 'Credit/Debit Card', icon: Card },
                    { id: 'upi', label: 'UPI', icon: Wallet },
                    { id: 'netbanking', label: 'Net Banking', icon: CreditCard },
                    { id: 'wallet', label: 'Wallet', icon: Wallet }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedPaymentMethod(id as any)}
                      className={`p-3 border rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${
                        selectedPaymentMethod === id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setPaymentModal({ isOpen: false, fee: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePayment(paymentModal.fee!)}
                disabled={paymentLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {paymentLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
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