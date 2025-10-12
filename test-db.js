// Simple MongoDB connection test script that reads connection string from env
const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');

    const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI or MONGODB_URI is not set in the environment');
    }

    // Try to connect
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    console.log('✅ MongoDB connected successfully!');
    console.log('🗄️  Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);

    // Test basic operations
    console.log('\n🧪 Testing database operations...');

    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    console.log('✅ Insert operation successful');

    const result = await testCollection.findOne({ test: 'data' });
    console.log('✅ Read operation successful');

    await testCollection.deleteOne({ test: 'data' });
    console.log('✅ Delete operation successful');

    console.log('\n🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Ensure MONGO_URI (or MONGODB_URI) is set in backend/.env');
    console.log('2. Make sure Atlas IP whitelist and credentials are correct');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testConnection();
