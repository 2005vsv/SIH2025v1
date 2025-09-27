import { motion } from 'framer-motion';
import { useState } from 'react';

const Hostel = () => {
  const [activeTab, setActiveTab] = useState('booking');
  
  const [currentBooking] = useState({
    id: '1',
    roomId: 'R101',
    roomNumber: 'A-101',
    checkIn: '2025-06-01',
    checkOut: '2026-05-31',
    status: 'active',
    amount: 45000
  });

  const [availableRooms] = useState([
    {
      id: 'R102',
      roomNumber: 'A-102',
      type: 'double',
      block: 'A',
      floor: 1,
      rent: 25000,
      facilities: ['Wi-Fi', 'AC', 'Study Table', 'Wardrobe'],
      status: 'available'
    },
    {
      id: 'R201',
      roomNumber: 'B-201',
      type: 'single',
      block: 'B',
      floor: 2,
      rent: 35000,
      facilities: ['Wi-Fi', 'AC', 'Study Table', 'Wardrobe', 'Attached Bathroom'],
      status: 'available'
    },
    {
      id: 'R301',
      roomNumber: 'C-301',
      type: 'triple',
      block: 'C',
      floor: 3,
      rent: 20000,
      facilities: ['Wi-Fi', 'Fan', 'Study Table', 'Wardrobe'],
      status: 'available'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'available': return 'text-blue-600 bg-blue-100';
      case 'occupied': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'single': return 'bg-purple-100 text-purple-800';
      case 'double': return 'bg-blue-100 text-blue-800';
      case 'triple': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hostel Management
          </h1>
          <p className="text-gray-600">
            Manage your hostel bookings and services
          </p>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'booking', label: 'My Booking' },
              { id: 'rooms', label: 'Available Rooms' },
              { id: 'services', label: 'Services' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* My Booking Tab */}
        {activeTab === 'booking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Booking
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Room Details
                  </h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Room Number: {currentBooking.roomNumber}</p>
                    <p>Check-in Date: {new Date(currentBooking.checkIn).toLocaleDateString()}</p>
                    <p>Check-out Date: {new Date(currentBooking.checkOut).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Payment Details
                  </h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Annual Rent: ₹{currentBooking.amount.toLocaleString()}</p>
                    <div className="flex items-center space-x-2">
                      <span>Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentBooking.status)}`}>
                        {currentBooking.status.charAt(0).toUpperCase() + currentBooking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Extend Booking
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  Download Receipt
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Available Rooms Tab */}
        {activeTab === 'rooms' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
                      <p className="text-gray-600">Block {room.block} • Floor {room.floor}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-blue-600">₹{room.rent.toLocaleString()}</div>
                    <div className="text-gray-500">per year</div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.facilities.map((facility, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    Book Now
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Maintenance Request',
                  description: 'Report room maintenance issues',
                  icon: '🔧',
                  action: 'Submit Request'
                },
                {
                  title: 'Laundry Service',
                  description: 'Schedule laundry pickup',
                  icon: '👕',
                  action: 'Schedule'
                },
                {
                  title: 'Mess Menu',
                  description: 'View daily mess menu',
                  icon: '🍽️',
                  action: 'View Menu'
                },
                {
                  title: 'Guest Registration',
                  description: 'Register guests for visit',
                  icon: '👥',
                  action: 'Register'
                },
                {
                  title: 'Internet Support',
                  description: 'Report internet connectivity issues',
                  icon: '🌐',
                  action: 'Report Issue'
                },
                {
                  title: 'Security Services',
                  description: 'Contact security for assistance',
                  icon: '🛡️',
                  action: 'Contact'
                }
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    {service.action}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Hostel;