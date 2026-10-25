import Resource from '../models/Resource.js';

export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const { name, category, location, quantity, contact } = req.body;
    const resource = await Resource.create({ name, category, location, quantity, contact });
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};