const express = require('express');
const {
    getAcademicAnalytics,
    getCustomReport,
    getDashboardAnalytics,
    getFeeAnalytics,
    getLibraryAnalytics,
    getUserAnalytics,
} = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Admin analytics routes
router.get('/dashboard', auth, requireRole('admin'), getDashboardAnalytics);
router.get('/users', auth, requireRole('admin'), getUserAnalytics);
router.get('/fees', auth, requireRole('admin'), getFeeAnalytics);
router.get('/library', auth, requireRole('admin'), getLibraryAnalytics);
router.get('/academics', auth, requireRole('admin'), getAcademicAnalytics);
router.post('/report', auth, requireRole('admin'), getCustomReport);

// Student route (risk score)
router.get('/score', auth, (req, res) => {
  // Mock analytics - calculate risk score
  const score = Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low';
  res.json({ 
    success, 
    message: 'Risk score calculated', 
    data: { 
      score,
      factors: {
        academic: Math.floor(Math.random() * 100),
        financial: Math.floor(Math.random() * 100),
        engagement: Math.floor(Math.random() * 100)
      },
      recommendations: ['Attend more classes', 'Pay fees on time', 'Participate in activities']
    } 
  });
});

module.exports = router;
