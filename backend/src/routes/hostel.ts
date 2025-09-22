import express from 'express';
import {
  getHostelRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAllocations,
  requestAllocation,
  updateAllocationStatus,
  getServiceRequests,
  createServiceRequest,
  updateServiceRequest,
  getHostelStats,
} from '../controllers/hostelController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Get all rooms
router.get('/rooms', auth, getHostelRooms);

// Get hostel statistics
router.get('/stats', auth, getHostelStats);

// Get room by ID
router.get('/rooms/:id', auth, getRoomById);

// Create room (Admin only)
router.post('/rooms', auth, requireRole('admin'), createRoom);

// Update room (Admin only)
router.put('/rooms/:id', auth, requireRole('admin'), updateRoom);

// Delete room (Admin only)
router.delete('/rooms/:id', auth, requireRole('admin'), deleteRoom);

// Get allocations
router.get('/allocations', auth, getAllocations);

// Request allocation
router.post('/allocations', auth, requestAllocation);

// Update allocation status (Admin only)
router.put('/allocations/:id', auth, requireRole('admin'), updateAllocationStatus);

// Get service requests
router.get('/service-requests', auth, getServiceRequests);

// Create service request
router.post('/service-requests', auth, createServiceRequest);

// Update service request (Admin only)
router.put('/service-requests/:id', auth, requireRole('admin'), updateServiceRequest);

export default router;