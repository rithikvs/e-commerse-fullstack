
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true, credentials: true, allowedHeaders: ['Content-Type', 'x-admin-key'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection with fallback and better error handling
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handmade_crafts';

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📡 Connection string:', MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(async () => {
  console.log('✅ Connected to MongoDB successfully');
  console.log('🗄️  Database:', mongoose.connection.name);
  console.log('📱 Host:', mongoose.connection.host);
  console.log('🔌 Port:', mongoose.connection.port);

  // Seed default admin
  try {
    const Admin = require('./models/Admin');
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
      await Admin.create({ username: 'admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      console.log(`👑 Seeded default admin user: ${ADMIN_EMAIL}`);
    }
  } catch (seedErr) {
    console.error('Admin seed error:', seedErr);
  }

  // Seed demo products
  try {
    const Product = require('./models/Product');
    const demoProducts = [
      { name: 'Handwoven Basket', price: '₹499', material: 'Natural Jute', rating: 4.5, image: 'download.jpeg', stock: 10 },
      { name: 'Clay Pot', price: '₹299', material: 'clay', rating: 4.2, image: 'clay pot.jpeg', stock: 12 },
      { name: 'Jewelry Box', price: '₹799', material: 'Wooden', rating: 4.8, image: 'jwellery.jpeg', stock: 8 },
      { name: 'Bamboo Lamp', price: '₹1299', material: 'Bamboo', rating: 4.6, image: 'bamboo.jpeg', stock: 5 },
      { name: 'Coffee Cup', price: '₹199', material: 'ceramic', rating: 4.1, image: 'coffee.jpeg', stock: 20 }
    ];

    for (const dp of demoProducts) {
      const exists = await Product.findOne({ name: dp.name, owner: 'system' });
      if (!exists) {
        await Product.create({ ...dp, owner: 'system' });
        console.log(`🧩 Seeded demo product: ${dp.name}`);
      }
    }
  } catch (prodSeedErr) {
    console.error('Product seed error:', prodSeedErr);
  }
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️  Make sure MongoDB is running on your system');
  console.log('💡 You can install MongoDB locally or use MongoDB Atlas');
  console.log('📋 Local installation steps:');
  console.log('   1. Download MongoDB from https://www.mongodb.com/try/download/community');
  console.log('   2. Install and start MongoDB service');
  console.log('   3. Or use: mongod --dbpath /path/to/data/db');
  console.log('🌐 Or use MongoDB Atlas (cloud):');
  console.log('   1. Go to https://www.mongodb.com/atlas');
  console.log('   2. Create free cluster');
  console.log('   3. Get connection string and update .env file');
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Routes
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Users admin routes
const User = require('./models/User');
const ADMIN_KEY = process.env.ADMIN_KEY || 'local-admin-key';

// Fallback admin login route
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const admin = await Admin.findOne({ email, password });
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ adminKey: ADMIN_KEY, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/users/all', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.delete('/api/users/:email', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
    await User.deleteOne({ email: req.params.email });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Handmade Crafts API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Database not connected',
        readyState: mongoose.connection.readyState
      });
    }
    const testProduct = new (require('./models/Product'))({
      name: 'Test Product',
      price: '₹100',
      material: 'Test Material',
      rating: 4.0,
      image: 'test.jpg',
      owner: 'test@example.com'
    });
    await testProduct.save();
    await testProduct.deleteOne();
    res.json({ 
      status: 'success', 
      message: 'Database operations working correctly',
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database test failed',
      error: error.message,
      readyState: mongoose.connection.readyState
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler (Express 5 safe - no wildcard path)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Database test: http://localhost:${PORT}/api/test-db`);
});