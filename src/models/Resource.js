const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceType: { 
    type: String, 
    enum: ['oxygen', 'food', 'water', 'medical_kit', 'shelter', 'vehicle'], 
    required: true 
  },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., 'liters', 'packets', 'cylinders'
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  status: { type: String, enum: ['available', 'depleted'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

resourceSchema.index({ location: '2dsphere' });

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;