const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDB = async () => {
  try {
    // Spin up an in-memory MongoDB instance to bypass all network/DNS blocks
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;