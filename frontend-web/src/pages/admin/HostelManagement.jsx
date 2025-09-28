import { Bed, Edit, Home, MapPin, Plus, RefreshCw, Search, Settings, Trash2, Users, Wrench } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { hostelAPI } from '../../services/api';

const AdminHostelManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
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
  const [allocationFilter, setAllocationFilter] = useState('all');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassigningAllocation, setReassigningAllocation] = useState(null);
  const [reassignForm, setReassignForm] = useState({
    newRoomId: '',
    reason: ''
  });
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    block: '',
    floor: 1,
    type: 'single',
    capacity: 1,
    rent: 0,
    deposit: 0,
    amenities: [],
    description: ''
  });

  useEffect(() => {
    fetchHostelData();

    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchHostelData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch data when switching to allocations tab
  useEffect(() => {
    if (activeTab === 'allocations') {
      fetchHostelData();
    }
  }, [activeTab]);

  const fetchHostelData = async () => {
    try {
      setLoading(true);

      // Fetch rooms
      try {
        const roomsRes = await hostelAPI.getRooms();
        const roomsData = roomsRes.data?.data?.rooms?.map(room => ({
          _id: room._id || '',
          number: room.roomNumber || '',
          block: room.block || '',
          floor: room.floor || 0,
          type: room.type || 'single',
          capacity: room.capacity || 1,
          currentOccupancy: room.currentOccupancy || 0,
          status: room.isAvailable ? 'available' : (room.maintenanceStatus === 'good' ? 'occupied' : 'maintenance'),
          amenities: room.amenities || [],
          rent: room.rent || 0
        })) || [];
        setRooms(roomsData);
      } catch (roomError) {
        console.error('Error fetching rooms:', roomError);
        setRooms([]);
      }

      // Fetch allocations
      try {
        const allocationsRes = await hostelAPI.getAllocations();
        const allocationsData = allocationsRes.data?.data?.allocations?.map(allocation => ({
          _id: allocation._id || '',
          studentName: allocation.userId?.name || 'Unknown',
          studentId: allocation.userId?.studentId || '',
          roomNumber: allocation.roomId?.roomNumber || 'N/A',
          block: allocation.roomId?.block || 'N/A',
          floor: allocation.roomId?.floor || 0,
          type: allocation.roomId?.type || 'N/A',
          status: allocation.status || 'pending',
          allocatedDate: allocation.allocatedDate || new Date().toISOString(),
          checkInDate: allocation.checkInDate || null,
          checkOutDate: allocation.checkOutDate || null,
          notes: allocation.notes || ''
        })) || [];
        setAllocations(allocationsData);
      } catch (allocationsError) {
        console.error('Error fetching allocations:', allocationsError);
        setAllocations([]);
      }

      // Fetch service requests
      try {
        const serviceRes = await hostelAPI.getServiceRequests();
        const serviceData = serviceRes.data?.data?.requests?.map(req => ({
          _id: req._id || '',
          roomNumber: req.roomId?.roomNumber || '',
          block: req.roomId?.block || '',
          studentName: req.userId?.name || 'Unknown',
          studentId: req.userId?.studentId || '',
          userId: req.userId?._id || '',
          issueType: req.type || 'other',
          description: req.description || '',
          priority: req.priority || 'medium',
          status: req.status || 'pending',
          submittedAt: req.createdAt || new Date().toISOString(),
          assignedTo: req.assignedTo?.name || null,
          completedAt: req.completedDate || null,
          requestedRoom: req.requestedRoom || null,
          currentRoom: req.currentRoom || null
        })) || [];
        setMaintenanceRequests(serviceData);
      } catch (serviceError) {
        console.error('Error fetching service requests:', serviceError);
        setMaintenanceRequests([]);
      }

      // Fetch stats
      try {
        const statsRes = await hostelAPI.getStats();
        const statsData = statsRes.data?.data || {};
        setStats({
          totalRooms: statsData.totalRooms || 0,
          occupiedRooms: statsData.occupiedRooms || 0,
          availableRooms: statsData.availableRooms || 0,
          maintenanceRooms: statsData.maintenanceRooms || 0,
          pendingRequests: statsData.pendingRequests || 0,
          totalStudents: statsData.totalStudents || 0,
          occupancyRate: statsData.occupancyRate || 0,
          revenue: statsData.revenue || 0
        });
      } catch (statsError) {
        console.error('Error fetching stats:', statsError);
        setStats({
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          maintenanceRooms: 0,
          pendingRequests: 0,
          totalStudents: 0,
          occupancyRate: 0,
          revenue: 0
        });
      }

    } catch (error) {
      console.error('Error fetching hostel data:', error);
      toast.error('Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  const updateMaintenanceStatus = async (requestId, status, assignedTo) => {
    try {
      const updateData = { status };
      if (assignedTo) updateData.assignedTo = assignedTo;
      const response = await hostelAPI.updateServiceRequest(requestId, updateData);

      // Send notification to student about status update
      try {
        const requestData = response.data?.data?.serviceRequest;
        if (requestData) {
          await hostelAPI.notifyServiceRequestUpdated(requestData, status);
        }
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't fail the whole operation if notification fails
      }

      toast.success('Service request updated successfully');
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      toast.error('Failed to update service request');
    }
  };

  const approveRoomChange = async (requestId, userId, newRoomId, currentRoomId) => {
    try {
      // Find the user's current allocation
      const allocations = await hostelAPI.getAllocations({ status: 'allocated,checked_in' });
      const userAllocation = allocations.data?.data?.allocations?.find(
        alloc => alloc.userId === userId && (alloc.status === 'allocated' || alloc.status === 'checked_in')
      );

      if (!userAllocation) {
        toast.error('User does not have an active room allocation');
        return;
      }

      // Update the user's allocation to the new room
      await hostelAPI.updateAllocationStatus(userAllocation._id, {
        roomId: newRoomId,
        status: userAllocation.status // Keep current status
      });

      // Mark the room change request as resolved
      await hostelAPI.updateServiceRequest(requestId, { status: 'resolved' });

      // Send notification to student about room change approval
      try {
        // Get the new room details for notification
        const rooms = await hostelAPI.getRooms();
        const newRoom = rooms.data?.data?.rooms?.find(room => room._id === newRoomId);

        await hostelAPI.notifyRoomChangeApproved({
          userId: userId,
          requestedRoom: newRoom ? { roomNumber: newRoom.roomNumber } : { roomNumber: 'New Room' }
        });
      } catch (notifyError) {
        console.error('Error sending room change notification:', notifyError);
        // Don't fail the whole operation if notification fails
      }

      toast.success('Room change approved successfully');
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error approving room change:', error);
      toast.error(error.response?.data?.message || 'Failed to approve room change');
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

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const response = await hostelAPI.createRoom(roomForm);
      toast.success('Room added successfully');

      // Send notification about new room
      try {
        await hostelAPI.notifyRoomAdded(roomForm);
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't fail the whole operation if notification fails
      }

      setShowAddRoom(false);
      setRoomForm({
        roomNumber: '',
        block: '',
        floor: 1,
        type: 'single',
        capacity: 1,
        rent: 0,
        deposit: 0,
        amenities: [],
        description: ''
      });
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error(error.response?.data?.message || 'Failed to add room');
    }
  };

  const handleEditRoom = async (e) => {
    e.preventDefault();
    try {
      await hostelAPI.updateRoom(editingRoom._id, roomForm);
      toast.success('Room updated successfully');

      // Send notification about room update
      try {
        // You could add a specific notification for room updates if needed
        console.log('Room updated notification could be sent here');
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't fail the whole operation if notification fails
      }

      setEditingRoom(null);
      setRoomForm({
        roomNumber: '',
        block: '',
        floor: 1,
        type: 'single',
        capacity: 1,
        rent: 0,
        deposit: 0,
        amenities: [],
        description: ''
      });
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error(error.response?.data?.message || 'Failed to update room');
    }
  };

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.number || '',
      block: room.block || '',
      floor: room.floor || 1,
      type: room.type || 'single',
      capacity: room.capacity || 1,
      rent: room.rent || 0,
      deposit: room.deposit || 0,
      amenities: room.amenities || [],
      description: room.description || ''
    });
  };

  const handleAmenityChange = (amenity) => {
    setRoomForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await hostelAPI.deleteRoom(roomId);
      toast.success(`Room ${roomNumber} deleted successfully`);
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const updateAllocationStatus = async (allocationId, status) => {
    try {
      const response = await hostelAPI.updateAllocationStatus(allocationId, { status });
      toast.success(`Allocation ${status.replace('_', ' ')} successfully`);

      // Send notification based on status change (don't fail if notification fails)
      if (status === 'allocated') {
        // Notify student of approval
        hostelAPI.notifyAllocationApproved(response.data?.data?.allocation || {}).catch(notifyError => {
          console.error('Error sending approval notification:', notifyError);
        });
      } else if (status === 'cancelled') {
        // Notify student of rejection/cancellation
        const allocation = response.data?.data?.allocation;
        if (allocation) {
          hostelAPI.notifyAllocationRejected(allocation).catch(notifyError => {
            console.error('Error sending rejection notification:', notifyError);
          });
        }
      }

      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error updating allocation status:', error);
      toast.error(error.response?.data?.message || 'Failed to update allocation status');
    }
  };

  const deleteAllocation = async (allocationId, studentName, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete the allocation for ${studentName} in Room ${roomNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await hostelAPI.deleteAllocation(allocationId);
      toast.success(`Allocation for ${studentName} deleted successfully`);
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast.error(error.response?.data?.message || 'Failed to delete allocation');
    }
  };

  const deleteServiceRequest = async (requestId, studentName, requestType) => {
    if (!window.confirm(`Are you sure you want to delete the ${requestType} request for ${studentName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await hostelAPI.deleteServiceRequest(requestId);
      toast.success(`${requestType} request deleted successfully`);
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error deleting service request:', error);
      toast.error(error.response?.data?.message || 'Failed to delete service request');
    }
  };

  const handleReassignRoom = async (e) => {
    e.preventDefault();
    try {
      await hostelAPI.reassignRoom({
        allocationId: reassigningAllocation._id,
        newRoomId: reassignForm.newRoomId,
        reason: reassignForm.reason
      });
      toast.success('Room reassigned successfully');
      setShowReassignModal(false);
      setReassigningAllocation(null);
      setReassignForm({ newRoomId: '', reason: '' });
      fetchHostelData(); // Refresh data
    } catch (error) {
      console.error('Error reassigning room:', error);
      toast.error(error.response?.data?.message || 'Failed to reassign room');
    }
  };

  const openReassignModal = (allocation) => {
    setReassigningAllocation(allocation);
    setReassignForm({
      newRoomId: '',
      reason: ''
    });
    setShowReassignModal(true);
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
          <div className="text-2xl font-bold">{stats.totalRooms || 0}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Occupancy Rate</div>
          <div className="text-2xl font-bold">{typeof stats.occupancyRate === 'number' ? stats.occupancyRate.toFixed(1) : '0.0'}%</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Pending Requests</div>
          <div className="text-2xl font-bold">{stats.pendingRequests || 0}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Monthly Revenue</div>
          <div className="text-2xl font-bold">₹{typeof stats.revenue === 'number' ? stats.revenue.toLocaleString() : '0'}</div>
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
                  <button
                    onClick={() => handleDeleteRoom(room._id, room.number)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete Room"
                  >
                    <Trash2 className="w-5 h-5" />
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
              className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-6 ${request.status === 'cancelled' ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`font-bold text-lg ${request.status === 'cancelled' ? 'line-through' : ''}`}>
                  {request.issueType === 'room_change' ? (
                    <>Room Change Request - {request.studentName}</>
                  ) : (
                    <>Room {request.roomNumber} - Block {request.block}</>
                  )}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                </span>
              </div>

              {request.issueType === 'room_change' ? (
                <div className="mb-2">
                  <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    <strong>Current Room:</strong> Room {request.currentRoom?.roomNumber || 'N/A'} - Block {request.currentRoom?.block || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                    <strong>Requested Room:</strong> Room {request.requestedRoom?.roomNumber || 'Any available'} - Block {request.requestedRoom?.block || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">{request.description}</div>
                </div>
              ) : (
                <div className="mb-2">{request.description}</div>
              )}

              <div className="text-xs text-gray-700 dark:text-gray-200 mb-2 flex flex-wrap gap-4">
                <span>Student: {request.studentName} ({request.studentId})</span>
                <span>Issue Type: {request.issueType.charAt(0).toUpperCase() + request.issueType.slice(1).replace('_', ' ')}</span>
                <span>Submitted: {new Date(request.submittedAt).toLocaleString()}</span>
                {request.assignedTo && (
                  <span>Assigned to: {request.assignedTo}</span>
                )}
                {request.completedAt && (
                  <span>Completed: {new Date(request.completedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {request.status !== 'resolved' && request.status !== 'cancelled' && (
                  <>
                    {request.issueType === 'room_change' && request.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => approveRoomChange(request._id, request.userId, request.requestedRoom?._id, request.currentRoom?._id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve Change
                        </button>
                        <button
                          onClick={() => updateMaintenanceStatus(request._id, 'cancelled')}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <>
                        {request.status === 'submitted' && (
                          <button
                            onClick={() => updateMaintenanceStatus(request._id, 'acknowledged')}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {request.status === 'acknowledged' && (
                          <button
                            onClick={() => updateMaintenanceStatus(request._id, 'in_progress', 'Maintenance Team A')}
                            className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Start Work
                          </button>
                        )}
                        {request.status === 'in_progress' && (
                          <button
                            onClick={() => updateMaintenanceStatus(request._id, 'resolved')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                        <button
                          onClick={() => updateMaintenanceStatus(request._id, 'cancelled')}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </>
                )}

                {(request.status === 'resolved' || request.status === 'cancelled') && (
                  <button
                    onClick={() => deleteServiceRequest(request._id, request.studentName, request.issueType.replace('_', ' '))}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    title="Delete Request"
                  >
                    Delete
                  </button>
                )}
              </div>
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
        <div>
          {/* Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Room Allocations</h2>
              <button
                onClick={fetchHostelData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={allocationFilter}
              onChange={(e) => setAllocationFilter(e.target.value)}
            >
              <option value="all">All Active Allocations</option>
              <option value="pending">Pending Requests</option>
              <option value="allocated">Allocated</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
            </select>
          </div>

          <div className="space-y-4">
            {allocations.filter(allocation => allocation.status !== 'cancelled' && (allocationFilter === 'all' || allocation.status === allocationFilter)).length > 0 ? (
              allocations.filter(allocation => allocation.status !== 'cancelled' && (allocationFilter === 'all' || allocation.status === allocationFilter)).map((allocation) => (
                <motion.div
                  key={allocation._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Bed className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Room {allocation.roomNumber} - {allocation.studentName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          Block {allocation.block} • Floor {allocation.floor} • {allocation.type} • Student ID: {allocation.studentId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(allocation.status)}`}>
                        {allocation.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {allocation.allocatedDate ? new Date(allocation.allocatedDate).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{allocation.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
                      <p className="font-medium text-gray-900 dark:text-white">{allocation.studentName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{allocation.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Check-in Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {allocation.checkInDate ? new Date(allocation.checkInDate).toLocaleDateString() : 'Not checked in'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Check-out Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {allocation.checkOutDate ? new Date(allocation.checkOutDate).toLocaleDateString() : 'Not checked out'}
                      </p>
                    </div>
                  </div>

                  {allocation.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => updateAllocationStatus(allocation._id, 'allocated')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Approve Allocation
                      </button>
                      <button
                        onClick={() => updateAllocationStatus(allocation._id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject Request
                      </button>
                      <button
                        onClick={() => deleteAllocation(allocation._id, allocation.studentName, allocation.roomNumber)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        title="Delete Allocation"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {allocation.status === 'allocated' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => updateAllocationStatus(allocation._id, 'checked_in')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Check In
                      </button>
                      <button
                        onClick={() => updateAllocationStatus(allocation._id, 'cancelled')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel Allocation
                      </button>
                      <button
                        onClick={() => deleteAllocation(allocation._id, allocation.studentName, allocation.roomNumber)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        title="Delete Allocation"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                  {allocation.status === 'checked_in' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => updateAllocationStatus(allocation._id, 'checked_out')}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      >
                        Check Out
                      </button>
                      <button
                        onClick={() => openReassignModal(allocation)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Reassign Room
                      </button>
                      <button
                        onClick={() => deleteAllocation(allocation._id, allocation.studentName, allocation.roomNumber)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        title="Delete Allocation"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Bed className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No {allocationFilter === 'all' ? '' : allocationFilter.replace('_', ' ')} allocations
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {allocationFilter === 'all'
                    ? 'Active allocations will appear here once students request rooms.'
                    : `No ${allocationFilter.replace('_', ' ')} allocations found.`
                  }
                </p>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Rooms
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {(showAddRoom || editingRoom) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h2>
            <form onSubmit={editingRoom ? handleEditRoom : handleAddRoom}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({...roomForm, roomNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block *</label>
                  <input
                    type="text"
                    value={roomForm.block}
                    onChange={(e) => setRoomForm({...roomForm, block: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                  <input
                    type="number"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({...roomForm, floor: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    max="50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({...roomForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="quad">Quad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({...roomForm, capacity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="4"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    value={roomForm.rent}
                    onChange={(e) => setRoomForm({...roomForm, rent: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹) *</label>
                  <input
                    type="number"
                    value={roomForm.deposit}
                    onChange={(e) => setRoomForm({...roomForm, deposit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Wi-Fi', 'AC', 'Fan', 'Study Table', 'Wardrobe', 'Attached Bathroom', 'Balcony', 'Water Heater'].map((amenity) => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={roomForm.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="mr-2"
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description of the room..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRoom(false);
                    setEditingRoom(null);
                    setRoomForm({
                      roomNumber: '',
                      block: '',
                      floor: 1,
                      type: 'single',
                      capacity: 1,
                      rent: 0,
                      deposit: 0,
                      amenities: [],
                      description: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Reassignment Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Reassign Room</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Reassigning <strong>{reassigningAllocation?.studentName}</strong> from Room <strong>{reassigningAllocation?.roomNumber}</strong> to a new room.
              </p>
            </div>
            <form onSubmit={handleReassignRoom}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Room *</label>
                <select
                  value={reassignForm.newRoomId}
                  onChange={(e) => setReassignForm({...reassignForm, newRoomId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a room...</option>
                  {rooms
                    .filter(room => room.status === 'available' && room._id !== reassigningAllocation?.roomId && room.currentOccupancy < room.capacity)
                    .map(room => (
                      <option key={room._id} value={room._id}>
                        Room {room.number} - Block {room.block} - Floor {room.floor} ({room.type}) - {room.capacity - room.currentOccupancy} spots available
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Reassignment</label>
                <textarea
                  value={reassignForm.reason}
                  onChange={(e) => setReassignForm({...reassignForm, reason: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Optional reason for room reassignment..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReassignModal(false);
                    setReassigningAllocation(null);
                    setReassignForm({ newRoomId: '', reason: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Reassign Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHostelManagement;