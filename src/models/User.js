 const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'volunteer', 'resource_provider', 'admin'], 
    default: 'citizen' 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  addressText: { type: String },
  isAvailable: { type: Boolean, default: true },
  skillsOrResources: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ location: '2dsphere' });

// IMPORTANT: Direct ga model compile chesi export cheyali
const User = mongoose.model('User', userSchema);
module.exports = User;