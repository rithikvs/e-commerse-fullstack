const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true, credentials: true, allowedHeaders: ['Content-Type', 'x-admin-key'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Require Admin model early so routes can reference it even if connect attempt delayed
const Admin = require('./models/Admin');

// MongoDB connection with retry/backoff and better error handling
// Support both MONGO_URI and MONGODB_URI env names (some users/hosts use one or the other)
let MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/handmade_crafts';
const MONGO_DBNAME = process.env.MONGO_DBNAME || 'handmade_crafts';
const MONGO_RETRY_ATTEMPTS = Number(process.env.MONGO_RETRY_ATTEMPTS) || 5;
const MONGO_RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS) || 2000;

// If user provided a URI without an explicit database, append a default DB name.
try {
  const uriHasDb = /\/[^\/\s]+(\?|$)/.test(MONGO_URI);
  if (!uriHasDb) {
    MONGO_URI = MONGO_URI.replace(/\/?$/, `/${MONGO_DBNAME}`);
    console.log('ℹ️ MONGO_URI did not contain a database name. Appended default DB:', MONGO_DBNAME);
  }
} catch (e) {
  console.warn('Could not normalize MONGO_URI:', e && e.message ? e.message : e);
}

console.log('🔗 Attempting to connect to MongoDB...');
console.log('📡 Connection string:', MONGO_URI);
console.log('ℹ️ Tip: On Render set the environment variable MONGO_URI to the full connection string.');

let connectedOnce = false;

async function connectWithRetry(attemptsLeft = MONGO_RETRY_ATTEMPTS, delayMs = MONGO_RETRY_DELAY_MS, insecure = false) {
  try {
    // Note: avoid deprecated options; modern drivers don't need useNewUrlParser/useUnifiedTopology
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: MONGO_DBNAME,
      // Allow insecure TLS for development if explicitly requested via env (NOT recommended for prod)
      ...(process.env.MONGO_INSECURE === 'true' || insecure ? { tlsAllowInvalidCertificates: true } : {})
    });

    connectedOnce = true;
    app.locals.dbConnected = true;
    console.log('✅ Connected to MongoDB successfully');
    console.log('🗄️  Database:', mongoose.connection.name);
    console.log(`ℹ️ Using dbName option (from MONGO_DBNAME or default): ${MONGO_DBNAME}`);
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
      // Seed demo products. Mark them as 'approved' so they appear on the Home page.
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
          await Product.create({ ...dp, owner: 'system', status: 'approved' });
          console.log(`🧩 Seeded demo product: ${dp.name}`);
        } else if (exists.status !== 'approved') {
          // If a demo product exists but is still pending/rejected, mark it approved so it shows on the frontend.
          exists.status = 'approved';
          await exists.save();
          console.log(`🔄 Updated demo product status to approved: ${dp.name}`);
        }
      }
    } catch (prodSeedErr) {
      console.error('Product seed error:', prodSeedErr);
    }

  } catch (err) {
    app.locals.dbConnected = false;
    console.error(`❌ MongoDB connection attempt failed: ${err && err.message ? err.message : err}`);

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

// Expose a small debug endpoint to confirm which DB we're connected to
app.get('/api/db-info', (req, res) => {
  try {
    const readyState = mongoose.connection.readyState;
    const host = mongoose.connection.host || null;
    const dbName = mongoose.connection.name || MONGO_DBNAME;
    const isAtlas = /^mongodb\+srv:/i.test(MONGO_URI) || /atlas/i.test(MONGO_URI);
    res.json({ uriType: isAtlas ? 'atlas' : 'local', host, dbName, readyState });
  } catch (err) {
    res.status(500).json({ message: 'Could not determine DB info', error: err.message });
  }
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
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Database test: http://localhost:${PORT}/api/test-db`);
});