
import Resource from '../models/Resource.js';

export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    return res.json({ data: resources });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getNearbyResources = async (req, res) => {
  try {
    const lng = Number(req.query.lng);
    const lat = Number(req.query.lat);
    const maxDistance = Number(req.query.maxDistance) || 10000;

    if (
      !Number.isFinite(lng) ||
      !Number.isFinite(lat) ||
      lng < -180 || lng > 180 ||
      lat < -90 || lat > 90
    ) {
      return res.status(400).json({
        message: 'Valid longitude and latitude are required.'
      });
    }

    const resources = await Resource.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: maxDistance
        }
      }
    });

    return res.json({ data: resources });
  } catch (error) {
    console.error('Nearby resources error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const {
      name, type, category, location,
      quantity, contact, addressText
    } = req.body;

    const resource = await Resource.create({
      name,
      type: type || category,
      location,
      quantity,
      contact,
      addressText
    });

    return res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
