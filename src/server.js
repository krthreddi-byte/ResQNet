const express = require('express');
const cors = require('cors'); // Added CORS
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Database connect chey
connectDB();

// Middleware
app.use(cors()); // Allow requests from Frontend (localhost:5173 / 5174)
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('ResQNet Backend is running...');
});

// Routes mount cheyali
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const emergencyRoutes = require('./routes/emergencyRoutes');
app.use('/api/emergencies', emergencyRoutes);

const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});