const express = require('express');
const router = express.Router();
const {
  createEmergency,
  getEmergencies,
  updateEmergencyStatus
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

// Base emergency routes
router.route('/')
  .post(protect, createEmergency)
  .get(protect, getEmergencies);

// Volunteer status update route (Pending -> In Progress / Resolved)
router.route('/:id/status').patch(protect, updateEmergencyStatus);

module.exports = router;