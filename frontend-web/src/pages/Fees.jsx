import { motion } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    CreditCard,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { feeAPI } from '../services/api';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentModal, setPaymentModal] = useState({ open: false, fee: null });
  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await feeAPI.getMy();
      const userFees = response.data.data.fees || [];
      setFees(userFees);
    } catch (error) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = (feeId) => {
    const fee = fees.find(f => f._id === feeId);
    if (!fee) return;
    setPaymentModal({ open: true, fee });
    setPaymentDetails({
      paymentMethod: 'card',
      cardNumber: '',
      expiry: '',
      cvv: '',
      upiId: ''
    });
  };

  const handlePaymentSubmit = async () => {
    try {
      setProcessingPayment(true);
      const { fee } = paymentModal;

      // Minimal validation
      if (paymentDetails.paymentMethod === 'card') {
        if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv) {
          toast.error('Please fill all card details');
          return;
        }
        if (paymentDetails.cardNumber.length < 16) {
          toast.error('Invalid card number');
          return;
        }
      } else if (paymentDetails.paymentMethod === 'upi') {
        if (!paymentDetails.upiId || !paymentDetails.upiId.includes('@')) {
          toast.error('Invalid UPI ID');
          return;
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success/failure (90% success rate)
      if (Math.random() > 0.1) {
        await feeAPI.pay(fee._id, {
          amount: fee.amount,
          paymentMethod: paymentDetails.paymentMethod,
          transactionId: `TXN_${Date.now()}`
        });
        toast.success('Payment successful!');
        setPaymentModal({ open: false, fee: null });
        fetchFees(); // Refresh the list
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = (fee.feeType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (fee.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = fees
    .filter(fee => fee.status === 'pending')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const totalPaid = fees
    .filter(fee => fee.status === 'paid')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'overdue':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fee Management
            </h1>
            <p className="text-gray-600">
              View and manage your academic fees
            </p>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className="text-2xl">💳</div>
          </div>
        </div>
      </motion.div>
            
          
        

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Pending
                </h3>
                <div className="text-2xl font-bold text-red-600">
                  ₹{totalPending.toLocaleString()}
                </div>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Paid
                </h3>
                <div className="text-2xl font-bold text-green-600">
                  ₹{totalPaid.toLocaleString()}
                </div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Amount
                </h3>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{(totalPending + totalPaid).toLocaleString()}
                </div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </motion.div>
              
                Total Paid
                
                  ₹{totalPaid.toLocaleString()}
                
              
              
                
              
            
          

          
            
              
                Total Fees
                
                  {fees.length}
                
              
              
                
              
            
          
        

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search fees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              Export
            </button>
          </div>
        </motion.div>
        

        {/* Fees List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Fee Details</h2>
          </div>

          {filteredFees.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-600 text-lg mb-2">No fees found</p>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No fees have been assigned to you yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFees.map((fee, index) => (
                <motion.div
                  key={fee._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(fee.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {fee.feeType}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fee.status)}`}>
                            {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          </span>
                        </div>
                        {fee.description && (
                          <p className="text-gray-600 mb-2">{fee.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            📅 Due: {new Date(fee.dueDate).toLocaleDateString()}
                          </span>
                          {fee.paymentDate && (
                            <span className="flex items-center">
                              ✅ Paid: {new Date(fee.paymentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{fee.amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {fee.status === 'pending' && (
                          <button
                            onClick={() => handlePayFee(fee._id)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center"
                          >
                            <span>💳</span>
                            Pay Now
                          </button>
                        )}

                        {fee.receiptUrl && (
                          <button
                            onClick={() => window.open(fee.receiptUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Download Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment Modal */}
        {paymentModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
                    Payment Gateway
                  </h2>
                  <button
                    onClick={() => setPaymentModal({ open: false, fee: null })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {paymentModal.fee && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Paying for:</p>
                    <p className="font-semibold">{paymentModal.fee.feeType} - {paymentModal.fee.description}</p>
                    <p className="text-lg font-bold text-blue-600">₹{paymentModal.fee.amount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentDetails.paymentMethod}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {paymentDetails.paymentMethod === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, '') }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength="16"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentDetails.expiry}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiry: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength="5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentDetails.cvv}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentDetails.paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="user@upi"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setPaymentModal({ open: false, fee: null })}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={processingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={processingPayment}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {processingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ₹{paymentModal.fee?.amount.toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  };

export default Fees;
