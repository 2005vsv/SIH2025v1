import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  MapPin, 
  Bed, 
  Wifi,
  Car,
  Utensils,
  Shield,
  Bell,
  User,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  FileText,
  Wrench,
  Droplets,
  Zap,
  Wind,
  ThermometerSun,
  Star,
  RefreshCw,
  Send,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BackButton from '../../components/BackButton';

interface HostelRoom {
  _id: string;
  roomNumber: string;
  building: string;
  floor: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  currentOccupancy: number;
  rent: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  images?: string[];
  description?: string;
}

interface RoomAllocation {
  _id: string;
  roomId: HostelRoom;
  studentId: string;
  studentName: string;
  studentEmail: string;
  allocationDate: string;
  status: 'active' | 'pending' | 'cancelled' | 'completed';
  duration: number; // in months
  expiryDate: string;
}

interface Roommate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  year: number;
  profileImage?: string;
  joinDate: string;
}

interface ServiceRequest {
  _id: string;
  type: 'maintenance' | 'cleaning' | 'electrical' | 'plumbing' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  submissionDate: string;
  completionDate?: string;
  assignedTo?: string;
  estimatedCost?: number;
  images?: string[];
}

interface RoomChangeRequest {
  _id: string;
  currentRoom: string;
  requestedRoom?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  submissionDate: string;
  responseDate?: string;
  adminNotes?: string;
}

const StudentHostel: React.FC = () => {
  const navigate = useNavigate();
  const [currentAllocation, setCurrentAllocation] = useState<RoomAllocation | null>(null);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [availableRooms, setAvailableRooms] = useState<HostelRoom[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [roomChangeRequests, setRoomChangeRequests] = useState<RoomChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'available' | 'services' | 'change-room'>('current');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showRoomChangeModal, setShowRoomChangeModal] = useState(false);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState<HostelRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedRoomType, setSelectedRoomType] = useState('all');

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setCurrentAllocation({
        _id: '1',
        roomId: {
          _id: 'room1',
          roomNumber: 'A-101',
          building: 'Block A',
          floor: 1,
          type: 'double',
          capacity: 2,
          currentOccupancy: 2,
          rent: 12000,
          amenities: ['WiFi', 'AC', 'Study Table', 'Wardrobe', 'Bathroom'],
          status: 'occupied',
          description: 'Spacious double occupancy room with modern amenities'
        },
        studentId: 'student1',
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        allocationDate: '2024-01-01',
        status: 'active',
        duration: 12,
        expiryDate: '2024-12-31'
      });

      setRoommates([
        {
          _id: '1',
          name: 'Alex Smith',
          email: 'alex@example.com',
          phone: '+91 9876543210',
          course: 'Computer Science',
          year: 3,
          joinDate: '2024-01-01'
        }
      ]);

      setAvailableRooms([
        {
          _id: 'room2',
          roomNumber: 'B-201',
          building: 'Block B',
          floor: 2,
          type: 'single',
          capacity: 1,
          currentOccupancy: 0,
          rent: 15000,
          amenities: ['WiFi', 'AC', 'Study Table', 'Wardrobe', 'Bathroom', 'Balcony'],
          status: 'available'
        },
        {
          _id: 'room3',
          roomNumber: 'C-301',
          building: 'Block C',
          floor: 3,
          type: 'triple',
          capacity: 3,
          currentOccupancy: 1,
          rent: 10000,
          amenities: ['WiFi', 'Fan', 'Study Table', 'Wardrobe', 'Bathroom'],
          status: 'available'
        }
      ]);

      setServiceRequests([
        {
          _id: '1',
          type: 'maintenance',
          title: 'AC Not Working',
          description: 'Air conditioner stopped cooling properly',
          priority: 'high',
          status: 'in-progress',
          submissionDate: '2024-01-10',
          assignedTo: 'Maintenance Team A'
        },
        {
          _id: '2',
          type: 'cleaning',
          title: 'Deep Cleaning Request',
          description: 'Request for deep cleaning of the room',
          priority: 'medium',
          status: 'completed',
          submissionDate: '2024-01-08',
          completionDate: '2024-01-09'
        }
      ]);

      setRoomChangeRequests([
        {
          _id: '1',
          currentRoom: 'A-101',
          requestedRoom: 'B-201',
          reason: 'Need single occupancy room for better study environment',
          status: 'pending',
          submissionDate: '2024-01-12'
        }
      ]);

    } catch (error) {
      console.error('Error fetching hostel data:', error);
      toast.error('Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  const submitServiceRequest = async (data: Partial<ServiceRequest>) => {
    try {
      // Mock API call
      const newRequest: ServiceRequest = {
        _id: Date.now().toString(),
        type: data.type!,
        title: data.title!,
        description: data.description!,
        priority: data.priority!,
        status: 'pending',
        submissionDate: new Date().toISOString().split('T')[0]
      };
      
      setServiceRequests(prev => [newRequest, ...prev]);
      setShowServiceModal(false);
      toast.success('Service request submitted successfully!');
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast.error('Failed to submit service request');
    }
  };

  const submitRoomChangeRequest = async (data: Partial<RoomChangeRequest>) => {
    try {
      // Mock API call
      const newRequest: RoomChangeRequest = {
        _id: Date.now().toString(),
        currentRoom: currentAllocation?.roomId.roomNumber || '',
        requestedRoom: data.requestedRoom,
        reason: data.reason!,
        status: 'pending',
        submissionDate: new Date().toISOString().split('T')[0]
      };
      
      setRoomChangeRequests(prev => [newRequest, ...prev]);
      setShowRoomChangeModal(false);
      toast.success('Room change request submitted successfully!');
    } catch (error) {
      console.error('Error submitting room change request:', error);
      toast.error('Failed to submit room change request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'available': case 'completed': case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': case 'rejected': case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'occupied': case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'cleaning': return <Droplets className="w-4 h-4" />;
      case 'electrical': return <Zap className="w-4 h-4" />;
      case 'plumbing': return <Droplets className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const filteredRooms = availableRooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || room.building === selectedBuilding;
    const matchesType = selectedRoomType === 'all' || room.type === selectedRoomType;
    return matchesSearch && matchesBuilding && matchesType;
  });

  const buildings = ['all', ...Array.from(new Set(availableRooms.map(room => room.building)))];
  const roomTypes = ['all', 'single', 'double', 'triple', 'quad'];

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
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hostel Management</h1>
          <p className="text-gray-600">Manage your accommodation, services, and room requests</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Room</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentAllocation?.roomId.roomNumber || 'Not Allocated'}
                </p>
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
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Roommates</p>
                <p className="text-2xl font-bold text-gray-900">{roommates.length}</p>
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
              <div className="p-3 rounded-full bg-yellow-100">
                <Settings className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceRequests.filter(req => req.status !== 'completed').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rent Due</p>
                <p className="text-2xl font-bold text-gray-900">₹{currentAllocation?.roomId.rent || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('current')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'current'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Current Room
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Rooms
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Service Requests
              </button>
              <button
                onClick={() => setActiveTab('change-room')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'change-room'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Room Change
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'current' && currentAllocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Room Details Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Room Details</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {currentAllocation.roomId.roomNumber}
                        </h3>
                        <p className="text-gray-600">{currentAllocation.roomId.building}</p>
                      </div>
                      <Home className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Floor:</span>
                      <span className="font-medium">{currentAllocation.roomId.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{currentAllocation.roomId.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{currentAllocation.roomId.capacity} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-medium">₹{currentAllocation.roomId.rent}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Allocation Date:</span>
                      <span className="font-medium">
                        {new Date(currentAllocation.allocationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium">
                        {new Date(currentAllocation.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {currentAllocation.roomId.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Service Request
                    </button>
                    <button
                      onClick={() => setShowRoomChangeModal(true)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <RefreshCw className="w-4 h-4 mr-2 inline" />
                      Change Room
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Roommates Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Roommates</h2>
              {roommates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roommates.map((roommate) => (
                    <div key={roommate._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{roommate.name}</h3>
                          <p className="text-sm text-gray-600">{roommate.course} - Year {roommate.year}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{roommate.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{roommate.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No roommates in this room</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'available' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by room number or building..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {buildings.map(building => (
                      <option key={building} value={building}>
                        {building === 'all' ? 'All Buildings' : building}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roomTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Available Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Bed className="w-12 h-12 text-blue-600" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{room.building} - Floor {room.floor}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{room.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{room.capacity} students</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Occupancy:</span>
                        <span className="font-medium">{room.currentOccupancy}/{room.capacity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Rent:</span>
                        <span className="font-medium text-blue-600">₹{room.rent}/month</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowRoomDetailsModal(room)}
                        className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="w-4 h-4 mr-1 inline" />
                        Details
                      </button>
                      <button
                        onClick={() => toast.success('Room booking feature coming soon!')}
                        disabled={room.status !== 'available'}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4 mr-1 inline" />
                        Book
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No rooms found matching your criteria</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Service Requests</h2>
              <button
                onClick={() => setShowServiceModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                New Request
              </button>
            </div>

            <div className="space-y-4">
              {serviceRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        {getServiceIcon(request.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-gray-600 mb-2">{request.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(request.submissionDate).toLocaleDateString()}
                          </span>
                          {request.assignedTo && (
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {request.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 flex flex-col items-end space-y-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.replace('-', ' ')}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {serviceRequests.length === 0 && (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No service requests submitted</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'change-room' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Room Change Requests</h2>
              <button
                onClick={() => setShowRoomChangeModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                New Request
              </button>
            </div>

            <div className="space-y-4">
              {roomChangeRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <span className="text-lg font-semibold text-gray-900">{request.currentRoom}</span>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <span className="text-lg font-semibold text-gray-900">
                          {request.requestedRoom || 'Any Available'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{request.reason}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Submitted: {new Date(request.submissionDate).toLocaleDateString()}
                        </span>
                        {request.responseDate && (
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Responded: {new Date(request.responseDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {request.adminNotes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 lg:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {roomChangeRequests.length === 0 && (
              <div className="text-center py-12">
                <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No room change requests submitted</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Service Request Modal */}
      <AnimatePresence>
        {showServiceModal && (
          <ServiceRequestModal
            isOpen={showServiceModal}
            onClose={() => setShowServiceModal(false)}
            onSubmit={submitServiceRequest}
          />
        )}
      </AnimatePresence>

      {/* Room Change Modal */}
      <AnimatePresence>
        {showRoomChangeModal && (
          <RoomChangeModal
            isOpen={showRoomChangeModal}
            onClose={() => setShowRoomChangeModal(false)}
            onSubmit={submitRoomChangeRequest}
            availableRooms={availableRooms}
          />
        )}
      </AnimatePresence>

      {/* Room Details Modal */}
      <AnimatePresence>
        {showRoomDetailsModal && (
          <RoomDetailsModal
            room={showRoomDetailsModal}
            onClose={() => setShowRoomDetailsModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Service Request Modal Component
const ServiceRequestModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ServiceRequest>) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<{
    type: 'maintenance' | 'cleaning' | 'electrical' | 'plumbing' | 'other';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
    type: 'maintenance',
    title: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    setFormData({ type: 'maintenance', title: '', description: '', priority: 'medium' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">New Service Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'maintenance' | 'cleaning' | 'electrical' | 'plumbing' | 'other' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="maintenance">Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Request
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Room Change Modal Component
const RoomChangeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RoomChangeRequest>) => void;
  availableRooms: HostelRoom[];
}> = ({ isOpen, onClose, onSubmit, availableRooms }) => {
  const [formData, setFormData] = useState({
    requestedRoom: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) {
      toast.error('Please provide a reason for room change');
      return;
    }
    onSubmit(formData);
    setFormData({ requestedRoom: '', reason: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Room Change Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Room (Optional)
            </label>
            <select
              value={formData.requestedRoom}
              onChange={(e) => setFormData({ ...formData, requestedRoom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Any available room</option>
              {availableRooms.map(room => (
                <option key={room._id} value={room.roomNumber}>
                  {room.roomNumber} - {room.building} ({room.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Change *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please explain why you want to change your room"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Request
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Room Details Modal Component
const RoomDetailsModal: React.FC<{
  room: HostelRoom;
  onClose: () => void;
}> = ({ room, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Room Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
              <Bed className="w-20 h-20 text-blue-600" />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{room.roomNumber}</h3>
            <p className="text-gray-600 mb-4">{room.building}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Floor:</span>
                <span className="ml-2 text-gray-600">{room.floor}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-600 capitalize">{room.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Capacity:</span>
                <span className="ml-2 text-gray-600">{room.capacity} students</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Occupancy:</span>
                <span className="ml-2 text-gray-600">{room.currentOccupancy}/{room.capacity}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Rent:</span>
                <span className="ml-2 text-gray-600">₹{room.rent}/month</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>
            </div>

            {room.description && (
              <div className="mb-4">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="mt-1 text-gray-600 text-sm">{room.description}</p>
              </div>
            )}

            <div className="mb-6">
              <span className="font-medium text-gray-700">Amenities:</span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => toast.success('Room booking feature coming soon!')}
              disabled={room.status !== 'available'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Book This Room
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to get status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': case 'available': case 'completed': case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending': case 'in-progress':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled': case 'rejected': case 'maintenance':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'occupied': case 'reserved':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default StudentHostel;