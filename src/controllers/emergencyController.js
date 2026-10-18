const mongoose = require('mongoose');
require('../models/Emergency');
const Emergency = mongoose.model('Emergency');

// Create SOS Emergency Broadcast
const createEmergency = async (req, res, next) => {
  try {
    const { emergencyType, description, location } = req.body;

    const emergency = await Emergency.create({
      user: req.user.id,
      emergencyType,
      description,
      location
    });

    res.status(201).json({
      success: true,
      message: 'Emergency SOS broadcasted successfully!',
      data: emergency
    });
  } catch (error) {
    next(error);
  }
};

// Get All Active Emergency Alerts
const getEmergencies = async (req, res, next) => {
  try {
    const emergencies = await Emergency.find({ status: 'active' }).populate('user', 'name phone email');

    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    next(error);
  }
};

// Update Emergency Status (active -> in_progress / resolved)
const updateEmergencyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency alert not found' });
    }

    emergency.status = status || emergency.status;
    await emergency.save();

    res.status(200).json({
      success: true,
      message: 'Emergency status updated successfully!',
      data: emergency
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmergency,
  getEmergencies,
  updateEmergencyStatus
};