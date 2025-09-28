const HostelRoom = require('../models/HostelRoom');

const seedHostelData = async () => {
  try {
    console.log('🌱 Seeding hostel data...');

    // Check if rooms already exist
    const existingRooms = await HostelRoom.countDocuments();
    if (existingRooms > 0) {
      console.log('⚠️ Hostel rooms already exist, skipping seeding');
      return;
    }

    // Create sample hostel rooms
    const rooms = await HostelRoom.insertMany([
      {
        roomNumber: '101',
        block: 'A',
        floor: 1,
        type: 'single',
        capacity: 1,
        rent: 5000,
        deposit: 10000,
        amenities: ['Wi-Fi', 'AC', 'Study Table', 'Wardrobe'],
        description: 'Single occupancy room with basic amenities'
      },
      {
        roomNumber: '102',
        block: 'A',
        floor: 1,
        type: 'double',
        capacity: 2,
        rent: 3000,
        deposit: 6000,
        amenities: ['Wi-Fi', 'Fan', 'Study Table', 'Wardrobe'],
        description: 'Double occupancy room with shared facilities'
      },
      {
        roomNumber: '103',
        block: 'A',
        floor: 1,
        type: 'triple',
        capacity: 3,
        rent: 2500,
        deposit: 5000,
        amenities: ['Wi-Fi', 'Fan', 'Study Table'],
        description: 'Triple occupancy room, budget friendly'
      },
      {
        roomNumber: '201',
        block: 'B',
        floor: 2,
        type: 'single',
        capacity: 1,
        rent: 5500,
        deposit: 11000,
        amenities: ['Wi-Fi', 'AC', 'Study Table', 'Wardrobe', 'Attached Bathroom'],
        description: 'Premium single room with attached bathroom'
      },
      {
        roomNumber: '202',
        block: 'B',
        floor: 2,
        type: 'double',
        capacity: 2,
        rent: 3500,
        deposit: 7000,
        amenities: ['Wi-Fi', 'AC', 'Study Table', 'Wardrobe', 'Balcony'],
        description: 'Double room with balcony and AC'
      },
      {
        roomNumber: '301',
        block: 'C',
        floor: 3,
        type: 'quad',
        capacity: 4,
        rent: 2000,
        deposit: 4000,
        amenities: ['Wi-Fi', 'Fan', 'Study Table'],
        description: 'Quad occupancy room for budget students'
      }
    ]);

    console.log(`✅ ${rooms.length} hostel rooms created`);
    console.log('🎉 Hostel data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding hostel data:', error);
    throw error;
  }
};

module.exports = { seedHostelData };