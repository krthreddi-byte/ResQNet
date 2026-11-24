
import Emergency from '../models/Emergency.js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client =
  accountSid &&
  authToken &&
  !accountSid.startsWith('your_') &&
  !authToken.startsWith('your_')
    ? twilio(accountSid, authToken)
    : null;

export const createEmergency = async (req, res) => {
  try {
    const {
      title,
      type,
      location,
      description,
      contact
    } = req.body;

    // Required fields validation
    if (!title || !type || !location) {
      return res.status(400).json({
        message: 'Title, type and location are required.'
      });
    }

    // Validate GeoJSON location
    if (
      location.type !== 'Point' ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      !location.coordinates.every(Number.isFinite)
    ) {
      return res.status(400).json({
        message: 'Location must contain GeoJSON coordinates: [longitude, latitude].'
      });
    }

    const emergency = await Emergency.create({
      title,
      type,
      location,
      description,
      contact
    });

    // Send SMS only when real Twilio credentials are configured
    if (
      client &&
      process.env.TWILIO_PHONE_NUMBER &&
      process.env.VOLUNTEER_PHONE_NUMBER &&
      !process.env.TWILIO_PHONE_NUMBER.includes('1234567890') &&
      !process.env.VOLUNTEER_PHONE_NUMBER.includes('9876543210')
    ) {
      const [longitude, latitude] = location.coordinates;

      try {
        await client.messages.create({
          body: `EMERGENCY ALERT: ${type} at longitude ${longitude}, latitude ${latitude}. Details: ${title}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.VOLUNTEER_PHONE_NUMBER
        });
      } catch (smsError) {
        console.error('Twilio SMS Error:', smsError.message);
      }
    }

    return res.status(201).json({
      message: 'Emergency created successfully',
      emergency
    });
  } catch (error) {
    console.error('Create emergency error:', error);

    return res.status(400).json({
      message: error.message
    });
  }
};

export const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({
      createdAt: -1
    });

    return res.json({
      data: emergencies
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

export const updateEmergencyStatus = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        message: 'Emergency not found'
      });
    }

    const allowedStatuses = [
      'Pending',
      'In Progress',
      'Resolved'
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: 'Invalid status'
      });
    }

    emergency.status = req.body.status;

    const updatedEmergency = await emergency.save();

    return res.json(updatedEmergency);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
