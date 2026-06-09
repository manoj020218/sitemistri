const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 2,               // keep only 2 idle connections (default 5)
    serverSelectionTimeoutMS: 5000,
  });
  console.log('✅ MongoDB connected');
  try {
    await mongoose.connection.db
      .collection('technicianprofiles')
      .createIndex({ currentLocation: '2dsphere' });
    console.log('✅ 2dsphere index ensured');
  } catch (e) {
    console.warn('⚠️  2dsphere index skipped (run setup-indexes.js manually):', e.message);
  }
};

module.exports = connectDB;
