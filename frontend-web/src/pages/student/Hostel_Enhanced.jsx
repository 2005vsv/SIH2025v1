import { motion } from "framer-motion";
import { Bed, Calendar, Settings, Wrench, MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import BackButton from "../../components/BackButton";
import { hostelAPI } from "../../services/api";

const StudentHostel = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [currentAllocation, setCurrentAllocation] = useState(null);
  const [allAllocations, setAllAllocations] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedRoomType, setSelectedRoomType] = useState('all');
  const [buildings, setBuildings] = useState(['all']);
  const [roomTypes] = useState(['all', 'single', 'double', 'triple', 'quad']);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    type: 'maintenance',
    title: '',
    description: '',
    priority: 'medium',
    requestedRoomId: ''
  });

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      setLoading(true);

      // Fetch current allocation
      try {
        const allocationRes = await hostelAPI.getMyRoom();
        setCurrentAllocation(allocationRes.data?.data?.allocation || null);
      } catch (error) {
        // No allocation found
        setCurrentAllocation(null);
      }

      // Fetch all user allocations (current and past)
      try {
        const allocationsRes = await hostelAPI.getAllocations();
        setAllAllocations(allocationsRes.data?.data?.allocations || []);
      } catch (allocError) {
        console.error('Error fetching allocations:', allocError);
        setAllAllocations([]);
      }

      // Fetch available rooms
      try {
        const roomsRes = await hostelAPI.getRooms({ availability: 'available' });
        setAvailableRooms(roomsRes.data?.data?.rooms || []);

        // Extract unique buildings
        const rooms = roomsRes.data?.data?.rooms || [];
        const uniqueBuildings = ['all', ...new Set(rooms.map(room => room.block).filter(Boolean))];
        setBuildings(uniqueBuildings);
      } catch (roomError) {
        console.error('Error fetching rooms:', roomError);
        setAvailableRooms([]);
        setBuildings(['all']);
      }

      // Fetch service requests
      try {
        const serviceRes = await hostelAPI.getServiceRequests();
        setServiceRequests(serviceRes.data?.data?.requests || []);
      } catch (serviceError) {
        console.error('Error fetching service requests:', serviceError);
        setServiceRequests([]);
      }

    } catch (error) {
      console.error('Error fetching hostel data:', error);
      toast.error('Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceRequest = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (serviceForm.type === 'room_change') {
        // Use the room change API for room change requests
        response = await hostelAPI.createChangeRequest({
          reason: serviceForm.description,
          preferredRoomId: serviceForm.requestedRoomId || null
        });
        toast.success('Room change request submitted successfully');
      } else {
        // Use regular service request API for other types
        response = await hostelAPI.createServiceRequest({
          ...serviceForm,
          roomId: currentAllocation?.roomId._id
        });
        toast.success('Service request submitted successfully');
      }

      // Send notification about the request
      try {
        if (serviceForm.type === 'room_change') {
          await hostelAPI.notifyServiceRequestSubmitted({
            type: 'room_change',
            userId: response.data?.data?.changeRequest?.userId
          });
        } else {
          await hostelAPI.notifyServiceRequestSubmitted({
            ...serviceForm,
            userId: response.data?.data?.serviceRequest?.userId
          });
        }
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't fail the whole operation if notification fails
      }
      setShowServiceModal(false);
      setServiceForm({ type: 'maintenance', title: '', description: '', priority: 'medium', requestedRoomId: '' });
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit service request');
    }
  };


  const requestAllocation = async (roomId) => {
    try {
      const response = await hostelAPI.requestAllocation({ roomId });
      toast.success('Room allocation request submitted successfully. Please wait for admin approval.');

      // Send notification about allocation request
      try {
        await hostelAPI.notifyAllocationRequest(response.data?.data?.allocation || { roomId: { roomNumber: 'N/A' } });
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't fail the whole operation if notification fails
      }

      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error requesting allocation:', error);
      toast.error(error.response?.data?.message || 'Failed to request allocation');
    }
  };

  const updateAllocationStatus = async (allocationId, status) => {
    try {
      await hostelAPI.updateAllocationStatus(allocationId, { status });
      toast.success(`Allocation ${status.replace('_', ' ')} successfully`);
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error updating allocation status:', error);
      toast.error('Failed to update allocation status');
    }
  };

  const filteredRooms = availableRooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.block.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || room.block === selectedBuilding;
    const matchesType = selectedRoomType === 'all' || room.type === selectedRoomType;
    return matchesSearch && matchesBuilding && matchesType;
  });

  const getServiceIcon = (type) => {
    const icons = {
      maintenance: '🔧',
      cleaning: '🧹',
      electrical: '⚡',
      plumbing: '🚰',
      pest_control: '🐛',
      furniture: '🪑',
      other: '📋'
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading hostel data...</div>
      </div>
    );
  }

  return (
    <>
      <BackButton />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
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
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
                {serviceRequests.filter(req => req.status !== 'completed').length}
              </p>
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
            <div className="flex-shrink-0">
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Requests</p>
              <p className="text-2xl font-semibold text-gray-900">
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
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rent Due</p>
              <p className="text-2xl font-semibold text-gray-900">₹{currentAllocation?.roomId.rent || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Bookings
            </button>
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
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Bookings</h2>
              <button
                onClick={fetchHostelData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {allAllocations.length > 0 ? (
              <div className="space-y-4">
                {allAllocations.map((allocation, index) => (
                  <motion.div
                    key={allocation._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Bed className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Room {allocation.roomId?.roomNumber || 'N/A'}</h3>
                          <p className="text-gray-600">Block {allocation.roomId?.block || 'N/A'} • Floor {allocation.roomId?.floor || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(allocation.status)}`}>
                          {allocation.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {allocation.allocatedDate ? new Date(allocation.allocatedDate).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Room Type</p>
                      <p className="font-medium">{allocation.roomId?.type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">{allocation.roomId?.capacity || 0} students</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rent</p>
                      <p className="font-medium">₹{allocation.roomId?.rent || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-in Date</p>
                      <p className="font-medium">
                        {allocation.checkInDate ? new Date(allocation.checkInDate).toLocaleDateString() : 'Not checked in'}
                      </p>
                    </div>
                  </div>

                    {allocation.status === 'allocated' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => updateAllocationStatus(allocation._id, 'checked_in')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Check In
                        </button>
                        <button
                          onClick={() => updateAllocationStatus(allocation._id, 'cancelled')}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}

                    {allocation.status === 'checked_in' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => updateAllocationStatus(allocation._id, 'checked_out')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          Check Out
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500 mb-4">You haven't made any hostel bookings yet.</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Available Rooms
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'current' && currentAllocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Room Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Room Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Room Number:</div>
                  <div>{currentAllocation?.roomId?.roomNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium">Building:</div>
                  <div>{currentAllocation?.roomId?.block || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium">Floor:</div>
                  <div>{currentAllocation?.roomId?.floor || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium">Type:</div>
                  <div>{currentAllocation?.roomId?.type || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium">Capacity:</div>
                  <div>{currentAllocation?.roomId?.capacity || 0} students</div>
                </div>
                <div>
                  <div className="font-medium">Rent:</div>
                  <div>₹{currentAllocation?.roomId?.rent || 0}/month</div>
                </div>
                <div>
                  <div className="font-medium">Allocation Date:</div>
                  <div>{currentAllocation?.allocatedDate ? new Date(currentAllocation.allocatedDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium">Check-in Date:</div>
                  <div>{currentAllocation?.checkInDate ? new Date(currentAllocation.checkInDate).toLocaleDateString() : 'Not checked in'}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-medium mb-1">Amenities:</div>
                <ul className="list-disc list-inside">
                  {currentAllocation?.roomId?.amenities?.length > 0 ? (
                    currentAllocation.roomId.amenities.map((amenity, index) => (
                      <li key={index}>{amenity}</li>
                    ))
                  ) : (
                    <li>No amenities listed</li>
                  )}
                </ul>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Service Request
                </button>
                <button
                  onClick={() => {
                    setServiceForm({
                      type: 'room_change',
                      title: 'Room Change Request',
                      description: 'I would like to request a room change.',
                      priority: 'medium',
                      requestedRoomId: ''
                    });
                    setShowServiceModal(true);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Room
                </button>
              </div>
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
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by room number or building..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {buildings.map((building, idx) => (
                  <option key={idx} value={building}>
                    {building === 'all' ? 'All Buildings' : building}
                  </option>
                ))}
              </select>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roomTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* Available Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => {
                const occupancyRate = room.capacity > 0 ? parseFloat(((room.currentOccupancy / room.capacity) * 100).toFixed(1)) : 0;
                const isAvailable = room.isAvailable;

                return (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold text-lg">{room.roomNumber}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isAvailable ? 'Available' : 'Occupied'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        Block {room.block} • Floor {room.floor}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{room.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Capacity:</span>
                        <span className="font-medium">{room.capacity} students</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Occupancy:</span>
                        <span className="font-medium">{room.currentOccupancy}/{room.capacity} ({occupancyRate}%)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly Rent:</span>
                        <span className="font-bold text-blue-600">₹{room.rent.toLocaleString()}</span>
                      </div>
                    </div>

                    {room.amenities && room.amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">Amenities:</div>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                          {room.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              +{room.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRoomDetailsModal(room)}
                        className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => requestAllocation(room._id)}
                        disabled={!isAvailable || currentAllocation || allAllocations.some(a => a.status === 'pending')}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!isAvailable ? 'Not Available' :
                         currentAllocation ? 'Already Allocated' :
                         allAllocations.some(a => a.status === 'pending') ? 'Request Pending' :
                         'Request Booking'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {filteredRooms.length === 0 && (
              <div className="text-gray-500 text-center py-8">No rooms found matching your criteria</div>
            )}
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Quick Services Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Laundry', icon: '👕', description: 'Schedule laundry pickup' },
                  { name: 'Mess Menu', icon: '🍽️', description: 'View daily menu' },
                  { name: 'Internet', icon: '🌐', description: 'Report connectivity issues' },
                  { name: 'Security', icon: '🛡️', description: 'Contact security' }
                ].map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (service.name === 'Laundry') {
                        setServiceForm({...serviceForm, type: 'other', title: 'Laundry Service Request'});
                        setShowServiceModal(true);
                      } else if (service.name === 'Internet') {
                        setServiceForm({...serviceForm, type: 'other', title: 'Internet Connectivity Issue'});
                        setShowServiceModal(true);
                      } else {
                        toast.info(`${service.name} feature coming soon!`);
                      }
                    }}
                  >
                    <div className="text-2xl mb-2">{service.icon}</div>
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Service Requests Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">My Service Requests</h2>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4" />
                  New Request
                </button>
              </div>

              <div className="space-y-4">
                {serviceRequests.length > 0 ? (
                  serviceRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getServiceIcon(request.type)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{request.title || 'Untitled Request'}</h3>
                            <p className="text-sm text-gray-600">
                              Room {request.roomId?.roomNumber || 'N/A'} • Block {request.roomId?.block || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3">{request.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            {request.priority.toUpperCase()}
                          </span>
                          {request.assignedTo && (
                            <span>Assigned to: {request.assignedTo}</span>
                          )}
                          {request.completedDate && (
                            <span>Completed: {new Date(request.completedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests</h3>
                    <p className="text-gray-500 mb-4">You haven't submitted any service requests yet.</p>
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Your First Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Service Request Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Submit Service Request</h2>
            <form onSubmit={handleServiceRequest}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select
                  value={serviceForm.type}
                  onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="electrical">Electrical Issue</option>
                  <option value="plumbing">Plumbing Issue</option>
                  <option value="pest_control">Pest Control</option>
                  <option value="furniture">Furniture Issue</option>
                  <option value="room_change">Room Change Request</option>
                  <option value="other">Other Services</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {serviceForm.type === 'room_change' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Room (Optional)</label>
                  <select
                    value={serviceForm.requestedRoomId}
                    onChange={(e) => setServiceForm({...serviceForm, requestedRoomId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any available room</option>
                    {availableRooms.filter(room => room._id !== currentAllocation?.roomId._id).map((room) => (
                      <option key={room._id} value={room._id}>
                        Room {room.roomNumber} - Block {room.block} - {room.type} - ₹{room.rent}/month
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={serviceForm.priority}
                  onChange={(e) => setServiceForm({...serviceForm, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Room Details Modal */}
      {showRoomDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Room Details</h2>
            <div className="space-y-2">
              <p><strong>Room Number:</strong> {showRoomDetailsModal.roomNumber}</p>
              <p><strong>Building:</strong> {showRoomDetailsModal.block}</p>
              <p><strong>Floor:</strong> {showRoomDetailsModal.floor}</p>
              <p><strong>Type:</strong> {showRoomDetailsModal.type}</p>
              <p><strong>Capacity:</strong> {showRoomDetailsModal.capacity}</p>
              <p><strong>Rent:</strong> ₹{showRoomDetailsModal.rent}/month</p>
              <p><strong>Amenities:</strong> {showRoomDetailsModal.amenities?.join(', ') || 'None'}</p>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => requestAllocation(showRoomDetailsModal._id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request Allocation
              </button>
              <button
                onClick={() => setShowRoomDetailsModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to get status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
    case 'available':
    case 'completed':
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
    case 'in-progress':
    case 'submitted':
    case 'acknowledged':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
    case 'rejected':
    case 'maintenance':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'occupied':
    case 'reserved':
    case 'allocated':
    case 'checked_in':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Helper function to get priority colors
const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colors[priority] || colors.low;
};

export default StudentHostel;
