const express = require('express');
const {
    createChangeRequest,
    createRoom,
    createServiceRequest,
    deleteAllocation,
    deleteRoom,
    deleteServiceRequest,
    getAllocations,
    getHostelRooms,
    getHostelStats,
    getMyRoom,
    getRoomById,
    getServiceRequests,
    reassignRoom,
    requestAllocation,
    updateAllocationStatus,
    updateRoom,
    updateServiceRequest,
} = require('../controllers/hostelController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Get all rooms
router.get('/rooms', auth, getHostelRooms);

// Get hostel statistics
router.get('/stats', auth, getHostelStats);

// Get my allocated room (Student)
router.get('/my-room', auth, getMyRoom);

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

// Request room change
router.post('/change-request', auth, createChangeRequest);

// Update allocation status (Admin can update any, Students can update their own for check-in/check-out/cancel)
router.put('/allocations/:id', auth, updateAllocationStatus);

// Delete allocation (Admin only)
router.delete('/allocations/:id', auth, requireRole('admin'), deleteAllocation);

// Reassign room (Admin only)
router.put('/reassign-room', auth, requireRole('admin'), reassignRoom);

// Get service requests
router.get('/service-requests', auth, getServiceRequests);

// Create service request
router.post('/service-requests', auth, createServiceRequest);

// Update service request (Admin only)
router.put('/service-requests/:id', auth, requireRole('admin'), updateServiceRequest);

// Delete service request (Admin only)
router.delete('/service-requests/:id', auth, requireRole('admin'), deleteServiceRequest);

module.exports = router;
