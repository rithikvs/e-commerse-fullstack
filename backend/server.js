const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
<<<<<<< HEAD
=======
const path = require('path');
const fs = require('fs');
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
require('dotenv').config();

const app = express();
app.use(cors({ origin: true, credentials: true, allowedHeaders: ['Content-Type', 'x-admin-key'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Require Admin model early so routes can reference it even if connect attempt delayed
const Admin = require('./models/Admin');

// MongoDB connection with retry/backoff and better error handling
<<<<<<< HEAD
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handmade_crafts';
const MONGO_RETRY_ATTEMPTS = Number(process.env.MONGO_RETRY_ATTEMPTS) || 5;
const MONGO_RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS) || 2000;

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📡 Connection string:', MONGO_URI);

let connectedOnce = false;

async function connectWithRetry(attemptsLeft = MONGO_RETRY_ATTEMPTS, delayMs = MONGO_RETRY_DELAY_MS, insecure = false) {
=======
// Allow MONGO_URI to be provided as an Atlas SRV string without a DB name.
// If missing, append a safe default DB name so mongoose selects the right DB.
let MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/handmade_crafts';
// Allow overriding only the database name via env to force the correct DB
const MONGO_DBNAME = process.env.MONGO_DBNAME || 'handmade_crafts';
const MONGO_RETRY_ATTEMPTS = Number(process.env.MONGO_RETRY_ATTEMPTS) || 5;
const MONGO_RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS) || 2000;

// If user provided a URI without an explicit database, append a default DB name.
// Matches: any '/' followed by non-slash chars before optional query or end.
try {
  const uriHasDb = /\/[^\/\s]+(\?|$)/.test(MONGO_URI);
  if (!uriHasDb) {
    MONGO_URI = MONGO_URI.replace(/\/?$/, `/${'handmade_crafts'}`);
    console.log('ℹ️ MONGO_URI did not contain a database name. Appended default DB: handmade_crafts');
  }
} catch (e) {
  console.warn('Could not normalize MONGO_URI:', e && e.message ? e.message : e);
}

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📡 Connection string:', MONGO_URI);
console.log('ℹ️ Tip: On Render set the environment variable MONGO_URI to the full connection string.\n  - For MongoDB Atlas SRV URIs include the DB name (e.g. mongodb+srv://user:pass@cluster0.mongodb.net/handmade_crafts).\n  - URL-encode special characters in your password.\n  - Ensure Atlas Network Access (IP Access List) allows connections from Render.');

let connectedOnce = false;

async function connectWithRetry(attemptsLeft = MONGO_RETRY_ATTEMPTS, delayMs = MONGO_RETRY_DELAY_MS) {
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
  try {
    // Note: avoid deprecated options; modern drivers don't need useNewUrlParser/useUnifiedTopology
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
<<<<<<< HEAD
      // If this connection attempt is marked insecure, allow invalid certs
      ...(insecure ? { tlsAllowInvalidCertificates: true } : {}),
      // Also respect explicit env toggle
      ...(process.env.MONGO_INSECURE === 'true' && !insecure ? { tlsAllowInvalidCertificates: true } : {})
=======
      dbName: MONGO_DBNAME,
      // Allow insecure TLS for development if explicitly requested via env (NOT recommended for prod)
      ...(process.env.MONGO_INSECURE === 'true' ? { tlsAllowInvalidCertificates: true } : {})
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
    });

    connectedOnce = true;
    app.locals.dbConnected = true;
    console.log('✅ Connected to MongoDB successfully');
<<<<<<< HEAD
    console.log('🗄️  Database:', mongoose.connection.name);
=======
  console.log('🗄️  Database:', mongoose.connection.name);
  console.log(`ℹ️ Using dbName option (from MONGO_DBNAME or default): ${MONGO_DBNAME}`);
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
    console.log('📱 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);

    // Seed default admin (only after successful connection)
    try {
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

    // Seed demo products only after successful connection
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

  } catch (err) {
    app.locals.dbConnected = false;
    console.error(`❌ MongoDB connection attempt failed: ${err && err.message ? err.message : err}`);
<<<<<<< HEAD

    // If we see TLS/SSL related errors, try one immediate retry with insecure TLS (allow invalid certs).
    const isTlsError = err && err.message && /SSL|TLS|tls1_alert|tlsv1/i.test(err.message);
    if (isTlsError && !insecure) {
      console.warn('⚠️  TLS/SSL error detected while connecting to MongoDB. Retrying once with tlsAllowInvalidCertificates=true (insecure).');
      // try insecure retry immediately (do not reduce attemptsLeft for this forced insecure path)
      return connectWithRetry(attemptsLeft, delayMs, true);
    }

    if (attemptsLeft > 0) {
      console.log(`⏳ Retrying MongoDB connection in ${delayMs}ms (${attemptsLeft - 1} attempts left)...`);
      await new Promise(res => setTimeout(res, delayMs));
      return connectWithRetry(attemptsLeft - 1, Math.min(delayMs * 2, 60000), insecure);
=======
    if (attemptsLeft > 0) {
      console.log(`⏳ Retrying MongoDB connection in ${delayMs}ms (${attemptsLeft - 1} attempts left)...`);
      await new Promise(res => setTimeout(res, delayMs));
      return connectWithRetry(attemptsLeft - 1, Math.min(delayMs * 2, 60000));
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
    }

    // Final failure after retries
    console.error('❌ MongoDB connection error: all retry attempts exhausted.');
    console.warn('⚠️ The API will continue running but database-dependent features will be limited.');
    console.warn('ℹ️ Common fixes:');
    console.warn('- Ensure your Atlas IP whitelist includes this host.');
    console.warn('- Check your MONGO_URI and credentials.');
    console.warn('- For development, set MONGO_INSECURE=true (not recommended for production).');
    // do not throw — allow server to stay up (fallback endpoints may operate in limited mode)
  }
}

// Start connection attempts (don't block rest of startup)
connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error event:', err && err.message ? err.message : err);
  app.locals.dbConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
  app.locals.dbConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
  app.locals.dbConnected = true;
});

// Routes
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Users admin routes
const User = require('./models/User');
const ADMIN_KEY = process.env.ADMIN_KEY || 'local-admin-key';

// Fallback admin login route (Admin is required above)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    // If DB is not connected, respond with helpful message
    if (!app.locals.dbConnected) {
      return res.status(503).json({ message: 'Database unavailable. Admin login not possible at this time.' });
    }
    const admin = await Admin.findOne({ email, password });
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ adminKey: ADMIN_KEY, admin: { email: admin.email, username: admin.username, _id: admin._id } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/users/all', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
    if (!app.locals.dbConnected) return res.status(503).json({ message: 'Database unavailable' });
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
    if (!app.locals.dbConnected) return res.status(503).json({ message: 'Database unavailable' });
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

<<<<<<< HEAD
// 404 handler (Express 5 safe - no wildcard path)
app.use((req, res) => {
=======
// Serve frontend build (if present) and fallback to index.html for SPA routes.
// This must come AFTER API routes so /api/* is handled by the API.
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { index: false }));

  // For any GET that doesn't start with /api, serve index.html (SPA fallback)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next(); // let API routes handle /api/* (including 404 JSON)
    const indexHtml = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
    next();
  });
}

// 404 handler for API and other missing resources
app.use((req, res) => {
  // If request expects HTML and frontend is present, serve index.html as a last resort
  const accept = req.headers.accept || '';
  if (accept.includes('text/html') && fs.existsSync(path.join(DIST_DIR, 'index.html')) && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(DIST_DIR, 'index.html'));
  }

  // Default JSON 404 for API or when frontend not available
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Database test: http://localhost:${PORT}/api/test-db`);
});