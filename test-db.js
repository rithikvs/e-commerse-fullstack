// Simple MongoDB connection test script
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    
    // Try to connect
    await mongoose.connect('mongodb://127.0.0.1:27017/handmade_crafts', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('🗄️  Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // Test basic operations
    console.log('\n🧪 Testing database operations...');
    
    // Test creating a collection
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    console.log('✅ Insert operation successful');
    
    // Test reading data
    const result = await testCollection.findOne({ test: 'data' });
    console.log('✅ Read operation successful');
    
    // Test deleting data
    await testCollection.deleteOne({ test: 'data' });
    console.log('✅ Delete operation successful');
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Check if MongoDB service is started');
    console.log('3. Verify the connection string');
    console.log('4. Check firewall settings');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🚨 MongoDB service is not running!');
      console.log('   Start MongoDB service:');
      console.log('   - Windows: Check Services app');
      console.log('   - Mac: brew services start mongodb-community');
      console.log('   - Linux: sudo systemctl start mongod');
    }
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 Connection closed');
    }
    process.exit(0);
  }
}

// Run the test
testConnection();
