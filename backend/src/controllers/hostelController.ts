import { Request, Response } from 'express';
import HostelRoom from '../models/HostelRoom';
import HostelAllocation from '../models/HostelAllocation';
import HostelServiceRequest from '../models/HostelServiceRequest';
import { AuthenticatedRequest } from '../middleware/roleCheck';

// Get all hostel rooms
export const getHostelRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, building, floor, availability, type } = req.query;
    
    const query: any = {};
    
    if (building) query.building = building;
    if (floor) query.floor = parseInt(floor as string);
    if (type) query.type = type;
    if (availability === 'available') query.currentOccupancy = { $lt: '$capacity' };
    if (availability === 'full') query.currentOccupancy = { $gte: '$capacity' };

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: 'roomNumber',
    };

    const rooms = await HostelRoom.find(query)
      .sort(options.sort)
      .limit(options.limit * options.page)
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
export const getRoomById = async (req: Request, res: Response): Promise<void> => {
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
export const createRoom = async (req: Request, res: Response): Promise<void> => {
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
export const updateRoom = async (req: Request, res: Response): Promise<void> => {
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
export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
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
export const getAllocations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, academicYear } = req.query;
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.id;

    const query: any = {};
    
    // Students can only see their own allocations
    if (!isAdmin) {
      query.userId = userId;
    }
    
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: '-allocatedDate',
      populate: [
        { path: 'roomId', select: 'roomNumber building floor type' },
        ...(isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [])
      ],
    };

    const allocations = await HostelAllocation.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * options.page)
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
export const requestAllocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { roomId, academicYear, preferences } = req.body;
    const userId = req.user?.id;

    // Check if user already has an active allocation
    const existingAllocation = await HostelAllocation.findOne({
      userId: userId,
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
      userId: userId,
      roomId: roomId,
      allocatedDate: new Date(),
      status: 'allocated',
      depositPaid: 0,
      rentPaid: 0,
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
export const updateAllocationStatus = async (req: Request, res: Response): Promise<void> => {
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
export const getServiceRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, type, priority } = req.query;
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.id;

    const query: any = {};
    
    // Students can only see their own requests
    if (!isAdmin) {
      query.userId = userId;
    }
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: '-createdAt',
      populate: [
        { path: 'roomId', select: 'roomNumber building floor' },
        ...(isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [])
      ],
    };

    const requests = await HostelServiceRequest.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * options.page)
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
export const createServiceRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const serviceRequest = new HostelServiceRequest({
      ...req.body,
      userId: userId,
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
export const updateServiceRequest = async (req: Request, res: Response): Promise<void> => {
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
export const getHostelStats = async (req: Request, res: Response): Promise<void> => {
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