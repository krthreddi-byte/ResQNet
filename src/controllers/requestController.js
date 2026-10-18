// Sample SOS creation handler
const createSOS = async (req, res, next) => {
  try {
    const { emergencyType, description, location } = req.body;

    // Hardcoded / Default location payload fallback for testing
    const finalLocation = location && location.coordinates ? location : {
      type: 'Point',
      coordinates: [78.4867, 17.3850] // Default [Longitude, Latitude]
    };

    const newRequest = await EmergencyRequest.create({
      user: req.user ? req.user.id : null, // Auth check
      emergencyType: emergencyType || req.body.type,
      description,
      location: finalLocation,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'SOS Broadcasted Successfully!',
      data: newRequest
    });
  } catch (error) {
    console.log("SOS Error Details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};