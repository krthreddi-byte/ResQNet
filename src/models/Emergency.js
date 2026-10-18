const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emergencyType: {
    type: String,
    required: true
  },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  status: {
    type: String,
    enum: ['active', 'in_progress', 'resolved'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now }
});

// Geospatial index for finding nearby emergencies
emergencySchema.index({ location: '2dsphere' });

const Emergency = mongoose.model('Emergency', emergencySchema);
module.exports = Emergency;
