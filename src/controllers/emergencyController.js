import Emergency from '../models/emergency.js';
import twilio from 'twilio';

// Twilio setup safely from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const targetVolunteerPhone = process.env.VOLUNTEER_PHONE_NUMBER || '+919876543210';

let twilioClient = null;
if (accountSid && authToken && accountSid !== 'your_twilio_account_sid') {
  twilioClient = twilio(accountSid, authToken);
}

// Create SOS Emergency Broadcast
export const createEmergency = async (req, res, next) => {
  try {
    const { emergencyType, type, description, location, addressText } = req.body;

    const resolvedEmergencyType = emergencyType || type || 'Medical';

    const emergency = await Emergency.create({
      user: req.user ? req.user.id : null,
      emergencyType: resolvedEmergencyType,
      type: resolvedEmergencyType,
      description,
      location: location || { type: 'Point', coordinates: [78.4867, 17.3850] },
      addressText: addressText || 'Hyderabad',
      status: 'active'
    });

    // 1. Emit live Socket.io event to all connected clients
    if (req.io) {
      req.io.emit('newEmergency', emergency);
    }

    // 2. Trigger Twilio SMS alert
    if (twilioClient && twilioPhone) {
      try {
        await twilioClient.messages.create({
          body: `🚨 ResQNet Emergency Alert! Type: ${resolvedEmergencyType}. Desc: ${description}. Please respond immediately!`,
          from: twilioPhone,
          to: targetVolunteerPhone
        });
        console.log('📱 Twilio SMS alert sent successfully!');
      } catch (smsErr) {
        console.error('Twilio SMS error:', smsErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Emergency SOS broadcasted successfully with SMS & Live sync!',
      data: emergency
    });
  } catch (error) {
    next(error);
  }
};

// Get all emergencies
export const getEmergencies = async (req, res, next) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 }).populate('user', 'name phone email');
    res.status(200).json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    next(error);
  }
};

// Update Emergency Status (Active -> Resolved)
export const updateEmergencyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const emergency = await Emergency.findByIdAndUpdate(
      id,
      { status: status || 'resolved' },
      { new: true }
    );

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    // Emit status update via Socket.io
    if (req.io) {
      req.io.emit('updateEmergency', emergency);
    }

    res.status(200).json({
      success: true,
      message: `Emergency status updated to ${emergency.status}`,
      data: emergency
    });
  } catch (error) {
    next(error);
  }
};