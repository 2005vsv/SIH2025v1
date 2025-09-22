import { Bed, Building, Calendar, MapPin, Phone, Users, Wifi } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HostelRoom {
  _id: string;
  roomNumber: string;
  block: string;
  floor: number;
  capacity: number;
  occupancy: number;
  amenities: string[];
  monthlyRent: number;
}

interface HostelBooking {
  _id: string;
  userId: string;
  roomId: HostelRoom;
  checkInDate: string;
  checkOutDate?: string;
  status: 'active' | 'pending' | 'cancelled' | 'completed';
  monthlyRent: number;
  securityDeposit: number;
}

interface MaintenanceRequest {
  _id: string;
  roomId: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'furniture' | 'cleaning' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
}

const StudentHostel: React.FC = () => {
  const [booking, setBooking] = useState<HostelBooking | null>(null);
  const [availableRooms, setAvailableRooms] = useState<HostelRoom[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'maintenance'>('overview');
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '',
    category: 'other' as MaintenanceRequest['category'],
    priority: 'medium' as MaintenanceRequest['priority']
  });

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch current booking
      const bookingResponse = await fetch('/api/hostel/my-booking', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingData = await bookingResponse.json();
      if (bookingData.success && bookingData.data) {
        setBooking(bookingData.data);
      }

      // Fetch available rooms
      const roomsResponse = await fetch('/api/hostel/available-rooms', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const roomsData = await roomsResponse.json();
      if (roomsData.success) {
        setAvailableRooms(roomsData.data);
      }

      // Fetch maintenance requests
      const maintenanceResponse = await fetch('/api/hostel/my-maintenance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const maintenanceData = await maintenanceResponse.json();
      if (maintenanceData.success) {
        setMaintenanceRequests(maintenanceData.data);
      }
    } catch (error) {
      console.error('Error fetching hostel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = async (roomId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/hostel/book/${roomId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchHostelData();
        alert('Room booking request submitted successfully!');
      } else {
        alert(data.message || 'Failed to book room');
      }
    } catch (error) {
      console.error('Error booking room:', error);
      alert('Failed to book room');
    }
  };

  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/hostel/maintenance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: booking.roomId._id,
          ...maintenanceForm
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchHostelData();
        setShowMaintenanceForm(false);
        setMaintenanceForm({ description: '', category: 'other', priority: 'medium' });
        alert('Maintenance request submitted successfully!');
      } else {
        alert(data.message || 'Failed to submit maintenance request');
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      alert('Failed to submit maintenance request');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hostel Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your hostel accommodation and services
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Room Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {booking ? 'Occupied' : 'Available'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Bed className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Rooms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableRooms.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{maintenanceRequests.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Available Rooms
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'maintenance'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Maintenance
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && (
            <div className="p-6">
              {booking ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Current Room Assignment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Building className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Room:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {booking.roomId.block}-{booking.roomId.roomNumber}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Floor:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {booking.roomId.floor}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Occupancy:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {booking.roomId.occupancy}/{booking.roomId.capacity}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Check-in:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {new Date(booking.checkInDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Rent:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            ₹{booking.monthlyRent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Security Deposit:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            ₹{booking.securityDeposit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {booking.roomId.amenities.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.roomId.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full"
                          >
                            <Wifi className="h-3 w-3 mr-1" />
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Room Assigned</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Browse available rooms to book your accommodation.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRooms.map((room) => (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Room {room.roomNumber}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Block {room.block}, Floor {room.floor}
                        </p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Available
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{room.capacity} beds</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Current Occupancy:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{room.occupancy}/{room.capacity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Rent:</span>
                        <span className="font-medium text-gray-900 dark:text-white">₹{room.monthlyRent.toLocaleString()}</span>
                      </div>
                    </div>

                    {room.amenities.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleBookRoom(room._id)}
                      disabled={!!booking || room.occupancy >= room.capacity}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        !!booking || room.occupancy >= room.capacity
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                          : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                      }`}
                    >
                      {booking ? 'Already Booked' : 
                       room.occupancy >= room.capacity ? 'Full' : 'Book Room'}
                    </button>
                  </motion.div>
                ))}
              </div>

              {availableRooms.length === 0 && (
                <div className="text-center py-12">
                  <Bed className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rooms available</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    All rooms are currently occupied. Please check back later.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="p-6">
              {booking && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Request Maintenance
                  </button>
                </div>
              )}

              {showMaintenanceForm && booking && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Submit Maintenance Request
                  </h3>
                  <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={maintenanceForm.category}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="electrical">Electrical</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="furniture">Furniture</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={maintenanceForm.priority}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={maintenanceForm.description}
                        onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Describe the maintenance issue..."
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Submit Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMaintenanceForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {request.category} Issue
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Submitted on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{request.description}</p>
                  </motion.div>
                ))}
              </div>

              {maintenanceRequests.length === 0 && (
                <div className="text-center py-12">
                  <Phone className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No maintenance requests</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {booking ? 'Submit your first maintenance request using the button above.' : 'Book a room to submit maintenance requests.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHostel;