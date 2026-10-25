import Emergency from '../models/Emergency.js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const createEmergency = async (req, res) => {
  try {
    const { title, type, location, description, contact } = req.body;
    const emergency = await Emergency.create({ title, type, location, description, contact });

    if (client && process.env.TWILIO_PHONE_NUMBER && process.env.VOLUNTEER_PHONE_NUMBER) {
      try {
        await client.messages.create({
          body: `🚨 EMERGENCY ALERT: ${type} at ${location}. Details: ${title}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.VOLUNTEER_PHONE_NUMBER,
        });
      } catch (smsError) {
        console.error('Twilio SMS Error:', smsError.message);
      }
    }

    res.status(201).json(emergency);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmergencyStatus = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (emergency) {
      emergency.status = req.body.status || emergency.status;
      const updatedEmergency = await emergency.save();
      res.json(updatedEmergency);
    } else {
      res.status(404).json({ message: 'Emergency not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};