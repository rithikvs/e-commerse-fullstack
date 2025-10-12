// Script to create a demo user in MongoDB using MONGO_URI from backend/.env
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const User = require('../models/User');

async function run() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGO_URI not set in backend/.env');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });
    console.log('Connected to MongoDB');

    const demoEmail = 'demo@handmade.local';
    const demoPassword = 'demopassword';
    const exists = await User.findOne({ email: demoEmail });
    if (exists) {
      console.log('Demo user already exists:', demoEmail);
      process.exit(0);
    }

    const user = new User({ username: 'demouser', email: demoEmail, password: demoPassword });
    await user.save();
    console.log('Demo user created:', demoEmail, demoPassword);
    process.exit(0);
  } catch (err) {
    console.error('Error creating demo user:', err.message);
    process.exit(1);
  }
}

run();
