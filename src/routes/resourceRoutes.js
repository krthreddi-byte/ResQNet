const express = require('express');
const router = express.Router();
const { 
  addResource, 
  getResources, 
  getNearbyResources 
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addResource)
  .get(protect, getResources);

router.route('/nearby').get(protect, getNearbyResources);

module.exports = router;