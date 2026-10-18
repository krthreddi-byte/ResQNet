const mongoose = require('mongoose');
require('../models/Resource');
const Resource = mongoose.model('Resource');

// Add New Resource
const addResource = async (req, res, next) => {
  try {
    const { resourceType, quantity, unit, location } = req.body;

    const resource = await Resource.create({
      owner: req.user.id,
      resourceType,
      quantity,
      unit,
      location
    });

    res.status(201).json({
      success: true,
      message: 'Resource added successfully!',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// Get All Available Resources
const getResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ status: 'available' }).populate('owner', 'name phone email');

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// Get Nearby Resources ($near Query with Fallback)
const getNearbyResources = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query;

    let resources = [];
    
    if (lng && lat) {
      try {
        resources = await Resource.find({
          status: 'available',
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              $maxDistance: parseInt(maxDistance)
            }
          }
        }).populate('owner', 'name phone email');
      } catch (err) {
        console.log("Geo query error, falling back to all available resources", err.message);
        resources = await Resource.find({ status: 'available' });
      }
    } else {
      resources = await Resource.find({ status: 'available' });
    }

    // Database empty gane unte testing kosam dummy fallback resource
    if (resources.length === 0) {
      resources = [
        {
          _id: "res123",
          resourceType: "Food & Water Supply",
          quantity: 100,
          unit: "packets",
          status: "available",
          location: {
            type: "Point",
            coordinates: [78.4867, 17.3850]
          },
          owner: {
            name: "Relief Center",
            phone: "9876543210",
            email: "help@resqnet.org"
          }
        }
      ];
    }

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addResource,
  getResources,
  getNearbyResources
};