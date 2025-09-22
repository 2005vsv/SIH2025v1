import { Bed, Edit, Home, MapPin, Plus, Search, Settings, Trash2, Users, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Room {
  _id: string;
  number: string;
  block: string;
  floor: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  amenities: string[];
  rent: number;
  occupants?: {
    studentId: string;
    name: string;
    email: string;
    checkInDate: string;
  }[];
}

interface MaintenanceRequest {
  _id: string;
  roomNumber: string;
  block: string;
  studentName: string;
  studentId: string;
  issueType: 'electrical' | 'plumbing' | 'furniture' | 'cleaning' | 'ac' | 'internet' | 'other';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  submittedAt: string;
  assignedTo?: string;
  completedAt?: string;
  images?: string[];
}

interface HostelStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  pendingRequests: number;
  totalStudents: number;
  occupancyRate: number;
  revenue: number;
}

const AdminHostelManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<HostelStats>({
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
  const [activeTab, setActiveTab] = useState<'rooms' | 'maintenance' | 'allocations'>('rooms');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState<'all' | 'A' | 'B' | 'C' | 'D'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'occupied' | 'maintenance' | 'reserved'>('all');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Mock data for development
      const mockRooms: Room[] = [
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
          rent: 15000,
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
          rent: 12000,
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

      const mockMaintenanceRequests: MaintenanceRequest[] = [
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
      const totalStudents = mockRooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
      const totalCapacity = mockRooms.reduce((sum, room) => sum + room.capacity, 0);
      const occupancyRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;
      const revenue = mockRooms.filter(r => r.status === 'occupied').reduce((sum, room) => sum + room.rent, 0);

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

  const updateMaintenanceStatus = async (requestId: string, status: string, assignedTo?: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Updating maintenance request:', { requestId, status, assignedTo });
      
      setMaintenanceRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { 
                ...request, 
                status: status as any, 
                assignedTo,
                completedAt: status === 'completed' ? new Date().toISOString() : undefined
              }
            : request
        )
      );
    } catch (error) {
      console.error('Error updating maintenance status:', error);
    }
  };

  const updateRoomStatus = async (roomId: string, status: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Updating room status:', { roomId, status });
      
      setRooms(prev => 
        prev.map(room => 
          room._id === roomId ? { ...room, status: status as any } : room
        )
      );
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.occupants?.some(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBlock = filterBlock === 'all' || room.block === filterBlock;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesBlock && matchesStatus;
  });

  const getStatusColor = (status: string) => {
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
    return colors[status as keyof typeof colors] || colors.available;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority as keyof typeof colors] || colors.low;
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
            Manage hostel rooms, allocations, and maintenance requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRooms}</p>
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
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.occupancyRate.toFixed(1)}%</p>
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
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Wrench className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingRequests}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Bed className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.revenue.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
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
            </nav>
          </div>

          {activeTab === 'rooms' && (
            <div className="p-6">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search rooms, blocks, or occupants..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filterBlock}
                    onChange={(e) => setFilterBlock(e.target.value as any)}
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
                    onChange={(e) => setFilterStatus(e.target.value as any)}
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
                    <Plus className="h-4 w-4" />
                    Add Room
                  </button>
                </div>
              </div>

              {/* Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          Room {room.number}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>Block {room.block}, Floor {room.floor}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRoom(room)}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => updateRoomStatus(room._id, room.status === 'available' ? 'maintenance' : 'available')}
                          className="text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Occupancy:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {room.currentOccupancy}/{room.capacity}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Rent:</span>
                        <span className="font-medium text-gray-900 dark:text-white">₹{room.rent.toLocaleString()}</span>
                      </div>
                      
                      {room.amenities && room.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amenities:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.amenities.map((amenity, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {room.occupants && room.occupants.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Occupants:</p>
                          <div className="space-y-1">
                            {room.occupants.map((occupant, index) => (
                              <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{occupant.name}</span>
                                <span className="text-gray-500 dark:text-gray-500"> ({occupant.studentId})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredRooms.length === 0 && (
                <div className="text-center py-12">
                  <Home className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No rooms found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="p-6">
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Room {request.roomNumber} - Block {request.block}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{request.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <div>
                            <span className="font-medium">Student:</span> {request.studentName} ({request.studentId})
                          </div>
                          <div>
                            <span className="font-medium">Issue Type:</span> {request.issueType.charAt(0).toUpperCase() + request.issueType.slice(1)}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {new Date(request.submittedAt).toLocaleString()}
                          </div>
                          {request.assignedTo && (
                            <div>
                              <span className="font-medium">Assigned to:</span> {request.assignedTo}
                            </div>
                          )}
                          {request.completedAt && (
                            <div>
                              <span className="font-medium">Completed:</span> {new Date(request.completedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {request.status !== 'completed' && request.status !== 'cancelled' && (
                      <div className="flex gap-2">
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
              </div>

              {maintenanceRequests.length === 0 && (
                <div className="text-center py-12">
                  <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No maintenance requests</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    All maintenance requests will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'allocations' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Room Allocation Management</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Room allocation and student assignment features coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHostelManagement;