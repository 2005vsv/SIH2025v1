const mongoose = require('mongoose');
const User = require('./src/models/User');
const { logger } = require('./src/config/logger');

// Replace with your actual MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'YOUR_MONGODB_URI_HERE';

const dummyIds = [
  '68d7f391c6113de5343824d7',
  '68d7f392c6113de5343824df',
  '68d7f392c6113de5343824e6',
  '68d7f393c6113de5343824ec',
  '68d7f393c6113de5343824ee',
  '68d7f394c6113de5343824f0',
  '68d7f394c6113de5343824f2',
];

async function deleteDummyUsers() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info({ event: 'dummy_user_cleanup_start', ids: dummyIds });
    const result = await User.deleteMany({ _id: { $in: dummyIds } });
    logger.info({ event: 'dummy_user_cleanup_complete', deletedCount: result.deletedCount });
    console.log(`Deleted ${result.deletedCount} dummy users.`);
  } catch (error) {
    logger.error({ event: 'dummy_user_cleanup_error', error: error.message, stack: error.stack });
    console.error('Error deleting dummy users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

deleteDummyUsers();
