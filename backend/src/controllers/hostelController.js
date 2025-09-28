const HostelAllocation = require('../models/HostelAllocation');
const HostelRoom = require('../models/HostelRoom');
const HostelServiceRequest = require('../models/HostelServiceRequest');

// Get all hostel rooms
exports.getHostelRooms = async (req, res) => {
  console.log('getHostelRooms called with query:', req.query, 'user:', req.user);
  try {
    const { page = 1, limit = 10, building, floor, availability, type } = req.query;

    const query = {};

    if (building) query.block = building;
    if (floor) query.floor = parseInt(floor);
    if (type) query.type = type;
    if (availability === 'available') {
      query.isActive = true;
      query.maintenanceStatus = 'good';
      query.$expr = { $lt: ['$currentOccupancy', '$capacity'] };
    }
    if (availability === 'full') query.$expr = { $gte: ['$currentOccupancy', '$capacity'] };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: 'roomNumber',
    };

    const rooms = await HostelRoom.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await HostelRoom.countDocuments(query);
    console.log('Found rooms:', rooms.length, 'total:', total, 'query:', query);

    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hostel rooms',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await HostelRoom.findById(id);

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { room },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Create room (Admin only)
exports.createRoom = async (req, res) => {
  console.log('createRoom called with body:', req.body, 'user:', req.user);
  try {
    const room = new HostelRoom(req.body);
    await room.save();
    console.log('Room created successfully:', room);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room },
    });
  } catch (error) {
    console.log('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update room (Admin only)
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await HostelRoom.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Delete room (Admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await HostelRoom.findByIdAndDelete(id);

    if (!room) {
      res.status(404).json({
        success: false,
        message: 'Room not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get allocations (Student sees own, Admin sees all)
exports.getAllocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, academicYear } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';
    const userId = req.user && req.user.id;

    const query = {};

    // Students can only see their own allocations
    if (!isAdmin) {
      query.userId = userId;
    }

    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-allocatedDate',
      populate: [
        { path: 'roomId', select: 'roomNumber building floor type' },
        ...(isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [])
      ],
    };

    const allocations = await HostelAllocation.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await HostelAllocation.countDocuments(query);

    res.json({
      success: true,
      data: {
        allocations,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allocations',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Request room allocation
exports.requestAllocation = async (req, res) => {
  console.log('requestAllocation called with body:', req.body, 'user:', req.user);
  try {
    const { roomId, academicYear, preferences } = req.body;
    const userId = req.user && req.user.id;

    // Check if user already has an active allocation or pending request
    const existingAllocation = await HostelAllocation.findOne({
      userId,
      status: { $in: ['pending', 'allocated', 'checked_in'] },
    });

    if (existingAllocation) {
      res.status(400).json({
        success: false,
        message: 'You already have an active allocation',
      });
      return;
    }

    // Check room availability if specific room requested
    if (roomId) {
      const room = await HostelRoom.findById(roomId);
      if (!room) {
        res.status(404).json({
          success: false,
          message: 'Room not found',
        });
        return;
      }

      if (room.currentOccupancy >= room.capacity) {
        res.status(400).json({
          success: false,
          message: 'Room is already at full capacity',
        });
        return;
      }
    }

    const allocation = new HostelAllocation({
      userId,
      roomId,
      allocatedDate: new Date(),
      status: 'pending',
      notes: preferences ? JSON.stringify(preferences) : undefined,
    });

    await allocation.save();

    // Note: Room occupancy is not updated here - it will be updated when admin approves the request

    try {
      await allocation.populate([
        { path: 'roomId', select: 'roomNumber building floor type' },
        { path: 'userId', select: 'name email studentId' }
      ]);
    } catch (populateError) {
      console.error('Error populating allocation:', populateError);
      // Continue without population if it fails
    }

    res.status(201).json({
      success: true,
      message: 'Allocation request submitted successfully',
      data: { allocation },
    });
  } catch (error) {
    console.error('Error in requestAllocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit allocation request',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update allocation status (Admin can update any, Students can update their own)
exports.updateAllocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkInDate, checkOutDate, notes, roomId } = req.body;
    const isAdmin = req.user && req.user.role === 'admin';
    const userId = req.user && req.user.id;

    if (!['pending', 'allocated', 'checked_in', 'checked_out', 'cancelled'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, allocated, checked_in, checked_out, or cancelled',
      });
      return;
    }

    const allocation = await HostelAllocation.findById(id);

    if (!allocation) {
      res.status(404).json({
        success: false,
        message: 'Allocation not found',
      });
      return;
    }

    // Check permissions: Admin can update any allocation, students can only update their own
    if (!isAdmin && allocation.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own allocations',
      });
      return;
    }

    // Students can only perform check-in, check-out, or cancel operations on their allocated rooms
    if (!isAdmin) {
      const allowedStudentStatuses = ['checked_in', 'checked_out', 'cancelled'];
      if (!allowedStudentStatuses.includes(status)) {
        res.status(403).json({
          success: false,
          message: 'Students can only check-in, check-out, or cancel their allocations',
        });
        return;
      }

      // Students can only cancel if status is 'allocated'
      if (status === 'cancelled' && allocation.status !== 'allocated') {
        res.status(400).json({
          success: false,
          message: 'You can only cancel allocated bookings',
        });
        return;
      }

      // Students can only check-in if status is 'allocated'
      if (status === 'checked_in' && allocation.status !== 'allocated') {
        res.status(400).json({
          success: false,
          message: 'You can only check-in to allocated rooms',
        });
        return;
      }

      // Students can only check-out if status is 'checked_in'
      if (status === 'checked_out' && allocation.status !== 'checked_in') {
        res.status(400).json({
          success: false,
          message: 'You can only check-out from checked-in rooms',
        });
        return;
      }
    }

    // Store old room ID for occupancy management
    const oldRoomId = allocation.roomId;

    // Update allocation fields
    allocation.status = status;
    if (checkInDate) allocation.checkInDate = new Date(checkInDate);
    if (checkOutDate) allocation.checkOutDate = new Date(checkOutDate);
    if (notes) allocation.notes = notes;
    if (roomId && isAdmin) allocation.roomId = roomId; // Only admin can change room

    await allocation.save();

    // Handle room occupancy changes
    try {
      // If room changed, update occupancy for both old and new rooms
      if (roomId && oldRoomId && oldRoomId.toString() !== roomId.toString()) {
        // Decrease occupancy of old room
        if (oldRoomId) {
          const oldRoom = await HostelRoom.findById(oldRoomId);
          if (oldRoom && oldRoom.currentOccupancy > 0) {
            oldRoom.currentOccupancy -= 1;
            await oldRoom.save();
          }
        }

        // Increase occupancy of new room
        const newRoom = await HostelRoom.findById(roomId);
        if (newRoom && newRoom.currentOccupancy < newRoom.capacity) {
          newRoom.currentOccupancy += 1;
          await newRoom.save();
        }
      }
      // If approving a pending request (changing to allocated), update room occupancy
      else if (allocation.status === 'allocated' && allocation.roomId && !oldRoomId) {
        const room = await HostelRoom.findById(allocation.roomId);
        if (room && room.currentOccupancy < room.capacity) {
          room.currentOccupancy += 1;
          await room.save();
        }
      }
    } catch (roomError) {
      console.error('Error updating room occupancy:', roomError);
      // Don't fail the allocation update if room update fails
    }

    try {
      await allocation.populate([
        { path: 'roomId', select: 'roomNumber building floor type' },
        { path: 'userId', select: 'name email studentId' }
      ]);
    } catch (populateError) {
      console.error('Error populating allocation:', populateError);
      // Continue without population if it fails
    }

    res.json({
      success: true,
      message: `Allocation ${status} successfully`,
      data: { allocation },
    });
  } catch (error) {
    console.error('Error in updateAllocationStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update allocation status',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Delete allocation (Admin only)
exports.deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = await HostelAllocation.findById(id);

    if (!allocation) {
      res.status(404).json({
        success: false,
        message: 'Allocation not found',
      });
      return;
    }

    // If the allocation was active (allocated or checked_in), reduce room occupancy
    if (allocation.status === 'allocated' || allocation.status === 'checked_in') {
      if (allocation.roomId) {
        const room = await HostelRoom.findById(allocation.roomId);
        if (room && room.currentOccupancy > 0) {
          room.currentOccupancy -= 1;
          await room.save();
        }
      }
    }

    // Delete the allocation
    await HostelAllocation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Allocation deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteAllocation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete allocation',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get service requests
exports.getServiceRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, priority } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';
    const userId = req.user && req.user.id;

    const query = {};

    // Students can only see their own requests
    if (!isAdmin) {
      query.userId = userId;
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { path: 'roomId', select: 'roomNumber building floor' },
        ...(isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [])
      ],
    };

    const requests = await HostelServiceRequest.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await HostelServiceRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service requests',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Create service request
exports.createServiceRequest = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    const serviceRequest = new HostelServiceRequest({
      ...req.body,
      userId,
    });

    await serviceRequest.save();

    await serviceRequest.populate([
      { path: 'roomId', select: 'roomNumber building floor' },
      { path: 'userId', select: 'name email studentId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: { serviceRequest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create service request',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update service request status (Admin only)
exports.updateServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceRequest = await HostelServiceRequest.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate([
      { path: 'roomId', select: 'roomNumber building floor' },
      { path: 'userId', select: 'name email studentId' }
    ]);

    if (!serviceRequest) {
      res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Service request updated successfully',
      data: { serviceRequest },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update service request',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Delete service request (Admin only)
exports.deleteServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceRequest = await HostelServiceRequest.findById(id);

    if (!serviceRequest) {
      res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
      return;
    }

    // Delete the service request
    await HostelServiceRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Service request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete service request',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get hostel statistics
exports.getHostelStats = async (req, res) => {
  try {
    const totalRooms = await HostelRoom.countDocuments();
    const occupiedRooms = await HostelRoom.countDocuments({ currentOccupancy: { $gt: 0 } });
    const totalCapacity = await HostelRoom.aggregate([
      { $group: { _id: null, total: { $sum: '$capacity' } } }
    ]);
    const currentOccupancy = await HostelRoom.aggregate([
      { $group: { _id: null, total: { $sum: '$currentOccupancy' } } }
    ]);

    const pendingAllocations = await HostelAllocation.countDocuments({ status: 'allocated' });
    const approvedAllocations = await HostelAllocation.countDocuments({ status: 'checked_in' });

    const pendingServiceRequests = await HostelServiceRequest.countDocuments({ status: 'pending' });
    const inProgressServiceRequests = await HostelServiceRequest.countDocuments({ status: 'in_progress' });

    res.json({
      success: true,
      data: {
        totalRooms,
        occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        totalCapacity: totalCapacity[0]?.total || 0,
        currentOccupancy: currentOccupancy[0]?.total || 0,
        occupancyRate: totalCapacity[0]?.total ?
          parseFloat(((currentOccupancy[0]?.total || 0) / totalCapacity[0].total * 100).toFixed(2)) : 0,
        pendingAllocations,
        approvedAllocations,
        pendingServiceRequests,
        inProgressServiceRequests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hostel statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get my allocated room (Student)
exports.getMyRoom = async (req, res) => {
  console.log('getMyRoom called for user:', req.user);
  try {
    const userId = req.user && req.user.id;

    const allocation = await HostelAllocation.findOne({
      userId,
      status: { $in: ['allocated', 'checked_in'] }
    }).populate('roomId');
    console.log('Found allocation:', allocation);

    if (!allocation) {
      res.status(404).json({
        success: false,
        message: 'No room allocation found'
      });
      return;
    }

    res.json({
      success: true,
      data: { allocation }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room allocation',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Create room change request
exports.createChangeRequest = async (req, res) => {
  console.log('createChangeRequest called with body:', req.body, 'user:', req.user);
  try {
    const userId = req.user && req.user.id;
    const { reason, preferredRoomId } = req.body;

    console.log('Processing room change request for user:', userId);

    // Check if user has an active allocation
    const currentAllocation = await HostelAllocation.findOne({
      userId,
      status: { $in: ['allocated', 'checked_in'] }
    });

    console.log('Found current allocation:', currentAllocation);

    if (!currentAllocation) {
      console.log('No active allocation found for user:', userId);
      res.status(400).json({
        success: false,
        message: 'No active room allocation found'
      });
      return;
    }

    // Check if there's already a submitted change request
    const existingRequest = await HostelServiceRequest.findOne({
      userId,
      type: 'room_change',
      status: { $in: ['submitted', 'acknowledged', 'in_progress'] }
    });

    console.log('Existing pending request:', existingRequest);

    if (existingRequest) {
      console.log('User already has pending room change request');
      res.status(400).json({
        success: false,
        message: 'You already have a pending room change request'
      });
      return;
    }

    console.log('Creating room change request with data:', {
      userId,
      type: 'room_change',
      description: reason,
      priority: 'medium',
      status: 'submitted',
      requestedRoom: preferredRoomId,
      currentRoom: currentAllocation.roomId
    });

    const changeRequest = new HostelServiceRequest({
      userId,
      roomId: currentAllocation.roomId, // Required field - use current room
      type: 'room_change',
      title: 'Room Change Request', // Required field
      description: reason,
      priority: 'medium',
      status: 'submitted',
      requestedRoom: preferredRoomId,
      currentRoom: currentAllocation.roomId
    });

    await changeRequest.save();
    console.log('Room change request saved successfully');

    await changeRequest.populate([
      { path: 'userId', select: 'name email studentId' },
      { path: 'requestedRoom' },
      { path: 'currentRoom' }
    ]);

    console.log('Room change request populated and ready to return');

    res.status(201).json({
      success: true,
      message: 'Room change request submitted successfully',
      data: { changeRequest }
    });
  } catch (error) {
    console.error('Error in createChangeRequest:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room change request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin direct room reassignment (Admin only)
exports.reassignRoom = async (req, res) => {
  console.log('reassignRoom called with body:', req.body, 'user:', req.user);
  try {
    const { allocationId, newRoomId, reason } = req.body;
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only admins can reassign rooms'
      });
      return;
    }

    // Find the allocation
    const allocation = await HostelAllocation.findById(allocationId);

    if (!allocation) {
      res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
      return;
    }

    // Check if new room exists and has capacity
    const newRoom = await HostelRoom.findById(newRoomId);
    if (!newRoom) {
      res.status(404).json({
        success: false,
        message: 'New room not found'
      });
      return;
    }

    if (newRoom.currentOccupancy >= newRoom.capacity) {
      res.status(400).json({
        success: false,
        message: 'New room is at full capacity'
      });
      return;
    }

    const oldRoomId = allocation.roomId;
    const oldRoom = oldRoomId ? await HostelRoom.findById(oldRoomId) : null;

    // Check if user already has an allocation for the new room
    const existingAllocationForNewRoom = await HostelAllocation.findOne({
      userId: allocation.userId,
      roomId: newRoomId,
      _id: { $ne: allocationId } // Exclude the current allocation
    });

    if (existingAllocationForNewRoom) {
      // If there's an existing allocation for the new room, we need to handle it
      if (existingAllocationForNewRoom.status === 'pending') {
        // Cancel the pending allocation
        existingAllocationForNewRoom.status = 'cancelled';
        existingAllocationForNewRoom.notes = 'Cancelled due to room reassignment';
        await existingAllocationForNewRoom.save();
      } else if (existingAllocationForNewRoom.status === 'allocated' || existingAllocationForNewRoom.status === 'checked_in') {
        // This shouldn't happen, but if it does, cancel the old one
        existingAllocationForNewRoom.status = 'cancelled';
        existingAllocationForNewRoom.notes = 'Cancelled due to room reassignment';
        await existingAllocationForNewRoom.save();

        // Decrease occupancy of the room that had the duplicate allocation
        if (newRoom.currentOccupancy > 0) {
          newRoom.currentOccupancy -= 1;
          await newRoom.save();
        }
      }
    }

    // Update allocation with new room
    allocation.roomId = newRoomId;
    allocation.notes = reason ? `Room reassigned: ${reason}` : 'Room reassigned by admin';

    await allocation.save();

    // Update room occupancy
    try {
      // Decrease occupancy of old room
      if (oldRoom && oldRoom.currentOccupancy > 0) {
        oldRoom.currentOccupancy -= 1;
        await oldRoom.save();
      }

      // Increase occupancy of new room
      newRoom.currentOccupancy += 1;
      await newRoom.save();
    } catch (roomError) {
      console.error('Error updating room occupancy:', roomError);
      // Don't fail the allocation update if room update fails
    }

    // Populate allocation for response
    try {
      await allocation.populate([
        { path: 'roomId', select: 'roomNumber building floor type' },
        { path: 'userId', select: 'name email studentId' }
      ]);
    } catch (populateError) {
      console.error('Error populating allocation:', populateError);
    }

    // Send notification to student
    try {
      const Notification = require('../models/Notification');
      const notification = new Notification({
        userId: allocation.userId,
        title: 'Room Reassigned by Admin',
        message: `Your room has been changed from Room ${oldRoom?.roomNumber || 'N/A'} to Room ${newRoom?.roomNumber || 'N/A'}.`,
        type: 'info',
        category: 'hostel',
        priority: 'high',
        actionUrl: '/student/hostel',
        actionText: 'View Room',
        data: {
          oldRoomId: oldRoom?._id,
          oldRoomNumber: oldRoom?.roomNumber,
          newRoomId: newRoom?._id,
          newRoomNumber: newRoom?.roomNumber,
          reassignedAt: new Date()
        }
      });

      const savedNotification = await notification.save();

      // Send real-time notification via WebSocket
      if (global.io) {
        global.io.to(`user_${allocation.userId}`).emit('notification', {
          id: savedNotification._id,
          title: savedNotification.title,
          message: savedNotification.message,
          type: savedNotification.type,
          category: savedNotification.category,
          priority: savedNotification.priority,
          actionUrl: savedNotification.actionUrl,
          actionText: savedNotification.actionText,
          data: savedNotification.data,
          createdAt: savedNotification.createdAt,
        });
      }
    } catch (notifyError) {
      console.error('Error sending notification:', notifyError);
      // Don't fail the operation if notification fails
    }

    res.json({
      success: true,
      message: 'Room reassigned successfully',
      data: { allocation }
    });
  } catch (error) {
    console.error('Error in reassignRoom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reassign room',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};