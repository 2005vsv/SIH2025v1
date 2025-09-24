import { Home, Users, Calendar, Settings, Wrench, RefreshCw, Zap, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";
import BackButton from "../../components/Navbar";

const StudentHostel = () => {
  // ...state and logic here (assume already present in the file below this patch)
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
              <Bed className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Roommates</p>
              <p className="text-2xl font-semibold text-gray-900">{roommates.length}</p>
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

        {/* Tab Content */}
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
                  <div>{currentAllocation.roomId.roomNumber}</div>
                </div>
                <div>
                  <div className="font-medium">Building:</div>
                  <div>{currentAllocation.roomId.building}</div>
                </div>
                <div>
                  <div className="font-medium">Floor:</div>
                  <div>{currentAllocation.roomId.floor}</div>
                </div>
                <div>
                  <div className="font-medium">Type:</div>
                  <div>{currentAllocation.roomId.type}</div>
                </div>
                <div>
                  <div className="font-medium">Capacity:</div>
                  <div>{currentAllocation.roomId.capacity} students</div>
                </div>
                <div>
                  <div className="font-medium">Rent:</div>
                  <div>₹{currentAllocation.roomId.rent}/month</div>
                </div>
                <div>
                  <div className="font-medium">Allocation Date:</div>
                  <div>{new Date(currentAllocation.allocationDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="font-medium">Expiry Date:</div>
                  <div>{new Date(currentAllocation.expiryDate).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-medium mb-1">Amenities:</div>
                <ul className="list-disc list-inside">
                  {currentAllocation.roomId.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
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
                  onClick={() => setShowRoomChangeModal(true)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Change Room
                </button>
              </div>
            </div>
            {/* Roommates Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Roommates</h2>
              {roommates.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {roommates.map((roommate, idx) => (
                    <li key={idx} className="py-2">
                      <div className="font-medium">{roommate.name}</div>
                      <div className="text-sm text-gray-600">{roommate.course} - Year {roommate.year}</div>
                      <div className="text-sm text-gray-600">{roommate.email} | {roommate.phone}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No roommates in this room</div>
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
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity, scale: 0.9 }}
                  animate={{ opacity, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow p-6"
                >
                  <div className="font-bold text-lg mb-2">{room.roomNumber}</div>
                  <div className="text-sm text-gray-500 mb-1">{room.status}</div>
                  <div className="mb-1">{room.building} - Floor {room.floor}</div>
                  <div className="mb-1">Type: {room.type}</div>
                  <div className="mb-1">Capacity: {room.capacity} students</div>
                  <div className="mb-1">Occupancy: {room.currentOccupancy}/{room.capacity}</div>
                  <div className="mb-1">Rent: ₹{room.rent}/month</div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowRoomDetailsModal(room)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => toast.success('Room booking feature coming soon!')}
                      disabled={room.status !== 'available'}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Book
                    </button>
                  </div>
                </motion.div>
              ))}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Service Requests</h2>
              <button
                onClick={() => setShowServiceModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
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
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <span>{getServiceIcon(request.type)}</span>
                      <span className="font-semibold text-lg">{request.title}</span>
                      <span className="ml-auto text-xs text-gray-500">{new Date(request.submissionDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mb-2 text-gray-700">{request.description}</div>
                    {request.assignedTo && (
                      <div className="text-xs text-gray-500 mb-1">Assigned to: {request.assignedTo}</div>
                    )}
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm font-medium">{request.status.replace('-', ' ')}</span>
                      <span className="text-sm">{request.priority} priority</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">No service requests submitted</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
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
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
    case 'rejected':
    case 'maintenance':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'occupied':
    case 'reserved':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default StudentHostel;
