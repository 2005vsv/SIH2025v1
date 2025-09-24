const HostelAllocation = require('../models/HostelAllocation');
const HostelRoom = require('../models/HostelRoom');
const HostelServiceRequest = require('../models/HostelServiceRequest');

// Get all hostel rooms
exports.getHostelRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, building, floor, availability, type } = req.query;

    const query = {};

    if (building) query.building = building;
    if (floor) query.floor = parseInt(floor);
    if (type) query.type = type;
    if (availability === 'available') query.$expr = { $lt: ['$currentOccupancy', '$capacity'] };
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
  try {
    const room = new HostelRoom(req.body);
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room },
    });
  } catch (error) {
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
  try {
    const { roomId, academicYear, preferences } = req.body;
    const userId = req.user && req.user.id;

    // Check if user already has an active allocation
    const existingAllocation = await HostelAllocation.findOne({
      userId,
      status: { $in: ['allocated', 'checked_in'] },
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
      status: 'allocated',
      notes: preferences ? JSON.stringify(preferences) : undefined,
    });

    await allocation.save();

    // Update room occupancy
    if (roomId) {
      const room = await HostelRoom.findById(roomId);
      if (room) {
        room.currentOccupancy += 1;
        await room.save();
      }
    }

    await allocation.populate([
      { path: 'roomId', select: 'roomNumber building floor type' },
      { path: 'userId', select: 'name email studentId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Allocation request submitted successfully',
      data: { allocation },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit allocation request',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update allocation status (Admin only)
exports.updateAllocationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkInDate, checkOutDate, notes } = req.body;

    if (!['allocated', 'checked_in', 'checked_out', 'cancelled'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be allocated, checked_in, checked_out, or cancelled',
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

    allocation.status = status;
    if (checkInDate) allocation.checkInDate = new Date(checkInDate);
    if (checkOutDate) allocation.checkOutDate = new Date(checkOutDate);
    if (notes) allocation.notes = notes;

    await allocation.save();

    await allocation.populate([
      { path: 'roomId', select: 'roomNumber building floor type' },
      { path: 'userId', select: 'name email studentId' }
    ]);

    res.json({
      success: true,
      message: `Allocation ${status} successfully`,
      data: { allocation },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update allocation status',
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
          ((currentOccupancy[0]?.total || 0) / totalCapacity[0].total * 100).toFixed(2) : '0',
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
  try {
    const userId = req.user && req.user.id;

    const allocation = await HostelAllocation.findOne({
      userId,
      status: 'approved'
    }).populate('roomId');

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
  try {
    const userId = req.user && req.user.id;
    const { reason, preferredRoomId } = req.body;

    // Check if user has an active allocation
    const currentAllocation = await HostelAllocation.findOne({
      userId,
      status: 'approved'
    });

    if (!currentAllocation) {
      res.status(400).json({
        success: false,
        message: 'No active room allocation found'
      });
      return;
    }

    // Check if there's already a pending change request
    const existingRequest = await HostelServiceRequest.findOne({
      userId,
      type: 'room_change',
      status: 'pending'
    });

    if (existingRequest) {
      res.status(400).json({
        success: false,
        message: 'You already have a pending room change request'
      });
      return;
    }

    const changeRequest = new HostelServiceRequest({
      userId,
      type: 'room_change',
      description: reason,
      priority: 'medium',
      status: 'pending',
      requestedRoom: preferredRoomId,
      currentRoom: currentAllocation.roomId
    });

    await changeRequest.save();
    await changeRequest.populate([
      { path: 'userId', select: 'name email studentId' },
      { path: 'requestedRoom' },
      { path: 'currentRoom' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Room change request submitted successfully',
      data: { changeRequest }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create room change request',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};