import { CheckCircleIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface FeeRecord {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  semester: string;
}

const Fees: React.FC = () => {
  const [feeRecords] = useState<FeeRecord[]>([
    { id: '1', description: 'Tuition Fee - Semester 6', amount: 50000, dueDate: '2025-09-30', status: 'pending', semester: 'Semester 6' },
    { id: '2', description: 'Library Fee', amount: 2000, dueDate: '2025-09-15', status: 'paid', semester: 'Semester 6' },
    { id: '3', description: 'Lab Fee', amount: 5000, dueDate: '2025-09-30', status: 'pending', semester: 'Semester 6' },
    { id: '4', description: 'Hostel Fee', amount: 15000, dueDate: '2025-08-30', status: 'paid', semester: 'Semester 6' },
    { id: '5', description: 'Examination Fee', amount: 3000, dueDate: '2025-10-15', status: 'pending', semester: 'Semester 6' }
  ]);

  const totalFees = feeRecords.reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = feeRecords.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const pendingFees = totalFees - paidFees;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'overdue': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const handlePayment = (feeId: string) => {
    alert(`Payment initiated for fee ID: ${feeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <CreditCardIcon className="h-8 w-8 mr-3 text-blue-600" />
              Fee Management
            </h1>
            <p className="text-gray-600 text-lg">Manage your semester fees and payments</p>
          </div>
        </motion.div>

        {/* Fee Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Fees</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  ₹{totalFees.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-lg">
                <CreditCardIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Paid</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ₹{paidFees.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
                <CheckCircleIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  ₹{pendingFees.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-3 rounded-lg">
                <ClockIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fee Records Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Fee Details</h2>
            <p className="text-gray-600 mt-1">Current semester fee breakdown</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {feeRecords.map((fee, index) => (
                  <motion.tr
                    key={fee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {fee.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {fee.semester}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{fee.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                        {getStatusIcon(fee.status)}
                        <span className="ml-1 capitalize">{fee.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fee.status === 'pending' ? (
                        <button
                          onClick={() => handlePayment(fee.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-green-600 text-sm font-medium">Completed</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
              <h3 className="font-semibold text-gray-900">Credit/Debit Card</h3>
              <p className="text-sm text-gray-600 mt-1">Pay securely with your card</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
              <h3 className="font-semibold text-gray-900">Net Banking</h3>
              <p className="text-sm text-gray-600 mt-1">Direct bank transfer</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
              <h3 className="font-semibold text-gray-900">UPI</h3>
              <p className="text-sm text-gray-600 mt-1">Quick payment via UPI</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Fees;