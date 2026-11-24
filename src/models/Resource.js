
import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    category: {
      type: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    quantity: {
      type: Number,
      default: 1
    },
    contact: {
      type: String
    },
    addressText: {
      type: String
    }
  },
  { timestamps: true }
);

resourceSchema.index({ location: '2dsphere' });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;
