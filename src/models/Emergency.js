import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    contact: { type: String },
  },
  { timestamps: true }
);

const Emergency = mongoose.model('Emergency', emergencySchema);
export default Emergency;