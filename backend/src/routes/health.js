const express = require('express');

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

module.exports = router;
