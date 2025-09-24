import { Bed, Edit, Home, MapPin, Plus, Search, Settings, Trash2, Users, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AdminHostelManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    pendingRequests: 0,
    totalStudents: 0,
    occupancyRate: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rooms');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);

      // Mock data for development
      const mockRooms = [
        {
          _id: '1',
          number: '101',
          block: 'A',
          floor: 1,
          type: 'double',
          capacity: 2,
          currentOccupancy: 2,
          status: 'occupied',
          amenities: ['AC', 'WiFi', 'Study Table', 'Wardrobe'],
          rent: 18000,
          occupants: [
            {
              studentId: 'ST001',
              name: 'John Doe',
              email: 'john@example.com',
              checkInDate: '2024-07-15'
            },
            {
              studentId: 'ST002',
              name: 'Jane Smith',
              email: 'jane@example.com',
              checkInDate: '2024-07-20'
            }
          ]
        },
        {
          _id: '2',
          number: '102',
          block: 'A',
          floor: 1,
          type: 'single',
          capacity: 1,
          currentOccupancy: 0,
          status: 'available',
          amenities: ['AC', 'WiFi', 'Study Table', 'Wardrobe'],
          rent: 20000
        },
        {
          _id: '3',
          number: '201',
          block: 'B',
          floor: 2,
          type: 'triple',
          capacity: 3,
          currentOccupancy: 1,
          status: 'occupied',
          amenities: ['Fan', 'WiFi', 'Study Table', 'Wardrobe'],
          rent: 15000,
          occupants: [
            {
              studentId: 'ST003',
              name: 'Mike Johnson',
              email: 'mike@example.com',
              checkInDate: '2024-08-01'
            }
          ]
        },
        {
          _id: '4',
          number: '202',
          block: 'B',
          floor: 2,
          type: 'double',
          capacity: 2,
          currentOccupancy: 0,
          status: 'maintenance',
          amenities: ['AC', 'WiFi', 'Study Table', 'Wardrobe'],
          rent: 15000
        }
      ];

      const mockMaintenanceRequests = [
        {
          _id: '1',
          roomNumber: '101',
          block: 'A',
          studentName: 'John Doe',
          studentId: 'ST001',
          issueType: 'electrical',
          description: 'AC not working properly, makes noise',
          priority: 'high',
          status: 'pending',
          submittedAt: '2024-09-15T10:30:00Z'
        },
        {
          _id: '2',
          roomNumber: '203',
          block: 'B',
          studentName: 'Sarah Wilson',
          studentId: 'ST004',
          issueType: 'plumbing',
          description: 'Water leakage from bathroom tap',
          priority: 'medium',
          status: 'in-progress',
          submittedAt: '2024-09-14T14:20:00Z',
          assignedTo: 'Maintenance Team A'
        },
        {
          _id: '3',
          roomNumber: '105',
          block: 'A',
          studentName: 'Tom Brown',
          studentId: 'ST005',
          issueType: 'internet',
          description: 'WiFi connection is very slow',
          priority: 'low',
          status: 'completed',
          submittedAt: '2024-09-12T09:15:00Z',
          assignedTo: 'IT Support',
          completedAt: '2024-09-13T16:30:00Z'
        }
      ];

      setRooms(mockRooms);
      setMaintenanceRequests(mockMaintenanceRequests);

      // Calculate stats
      const totalRooms = mockRooms.length;
      const occupiedRooms = mockRooms.filter(r => r.status === 'occupied').length;
      const availableRooms = mockRooms.filter(r => r.status === 'available').length;
      const maintenanceRooms = mockRooms.filter(r => r.status === 'maintenance').length;
      const pendingRequests = mockMaintenanceRequests.filter(r => r.status === 'pending').length;
      const totalStudents = mockRooms.reduce((sum, room) => sum + (room.currentOccupancy || 0), 0);
      const totalCapacity = mockRooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
      const occupancyRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;
      const revenue = mockRooms.filter(r => r.status === 'occupied').reduce((sum, room) => sum + (room.rent || 0), 0);

      setStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        maintenanceRooms,
        pendingRequests,
        totalStudents,
        occupancyRate,
        revenue
      });
    } catch (error) {
      console.error('Error fetching hostel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenanceStatus = async (requestId, status, assignedTo) => {
    try {
      setMaintenanceRequests(prev =>
        prev.map(request =>
          request._id === requestId
            ? {
                ...request,
                status,
                assignedTo,
                completedAt: status === 'completed' ? new Date().toISOString() : request.completedAt
              }
            : request
        )
      );
    } catch (error) {
      console.error('Error updating maintenance status:', error);
    }
  };

  const updateRoomStatus = async (roomId, status) => {
    try {
      setRooms(prev =>
        prev.map(room =>
          room._id === roomId ? { ...room, status } : room
        )
      );
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.occupants && room.occupants.some(o => o.name.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesBlock = filterBlock === 'all' || room.block === filterBlock;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesBlock && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      occupied: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      reserved: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'in-progress': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[status] || colors.available;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority] || colors.low;
  };

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
          <Bed className="w-6 h-6 text-blue-500" />
          Hostel Management
        </h1>
        <div className="text-gray-500">Manage hostel rooms, allocations, and maintenance requests</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Total Rooms</div>
          <div className="text-2xl font-bold">{stats.totalRooms}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Occupancy Rate</div>
          <div className="text-2xl font-bold">{stats.occupancyRate.toFixed(1)}%</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Pending Requests</div>
          <div className="text-2xl font-bold">{stats.pendingRequests}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Monthly Revenue</div>
          <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'rooms'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Room Management ({rooms.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'maintenance'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Maintenance Requests ({maintenanceRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('allocations')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'allocations'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Room Allocations
        </button>
      </div>

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms, blocks, or occupants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
            >
              <option value="all">All Blocks</option>
              <option value="A">Block A</option>
              <option value="B">Block B</option>
              <option value="C">Block C</option>
              <option value="D">Block D</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
            <button
              onClick={() => setShowAddRoom(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>

          {/* Rooms Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredRooms.map((room) => (
              <motion.div
                key={room._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-bold text-lg">Room {room.number}</span>
                  <span className="text-xs text-gray-500">Block {room.block}, Floor {room.floor}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(room.status)}`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setEditingRoom(room)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Edit Room"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateRoomStatus(room._id, room.status === 'available' ? 'maintenance' : 'available')}
                    className="text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                    title="Toggle Maintenance"
                  >
                    <Wrench className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Occupancy:</span> {room.currentOccupancy}/{room.capacity}
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Rent:</span> ₹{room.rent.toLocaleString()}
                </div>
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mb-1">
                    <span className="font-semibold">Amenities:</span>{' '}
                    {room.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300 mr-1"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
                {room.occupants && room.occupants.length > 0 && (
                  <div className="mb-1">
                    <span className="font-semibold">Occupants:</span>{' '}
                    {room.occupants.map((occupant, index) => (
                      <span key={index} className="mr-2">
                        {occupant.name} ({occupant.studentId})
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {filteredRooms.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="font-semibold text-lg mb-2">No rooms found</div>
              <div className="text-sm">Try adjusting your search or filter criteria.</div>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="grid md:grid-cols-2 gap-4">
          {maintenanceRequests.map((request) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-bold text-lg">
                  Room {request.roomNumber} - Block {request.block}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                </span>
              </div>
              <div className="mb-2">{request.description}</div>
              <div className="text-xs text-gray-700 dark:text-gray-200 mb-2 flex flex-wrap gap-4">
                <span>Student: {request.studentName} ({request.studentId})</span>
                <span>Issue Type: {request.issueType.charAt(0).toUpperCase() + request.issueType.slice(1)}</span>
                <span>Submitted: {new Date(request.submittedAt).toLocaleString()}</span>
                {request.assignedTo && (
                  <span>Assigned to: {request.assignedTo}</span>
                )}
                {request.completedAt && (
                  <span>Completed: {new Date(request.completedAt).toLocaleString()}</span>
                )}
              </div>
              {request.status !== 'completed' && request.status !== 'cancelled' && (
                <div className="flex gap-2 mt-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => updateMaintenanceStatus(request._id, 'assigned', 'Maintenance Team A')}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Assign
                    </button>
                  )}
                  {request.status === 'assigned' && (
                    <button
                      onClick={() => updateMaintenanceStatus(request._id, 'in-progress')}
                      className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Start Work
                    </button>
                  )}
                  {request.status === 'in-progress' && (
                    <button
                      onClick={() => updateMaintenanceStatus(request._id, 'completed')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => updateMaintenanceStatus(request._id, 'cancelled')}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          {maintenanceRequests.length === 0 && (
            <div className="text-center text-gray-500 py-8 col-span-2">
              <div className="font-semibold text-lg mb-2">No maintenance requests</div>
              <div className="text-sm">All maintenance requests will appear here.</div>
            </div>
          )}
        </div>
      )}

      {/* Allocations Tab */}
      {activeTab === 'allocations' && (
        <div className="text-center text-gray-500 py-8">
          <div className="font-semibold text-lg mb-2">Room Allocation Management</div>
          <div className="text-sm">Room allocation and student assignment features coming soon.</div>
        </div>
      )}
    </div>
  );
};

export default AdminHostelManagement;