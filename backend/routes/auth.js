const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const dataStore = require('../dataStore');

// Admin login using database credentials
const ADMIN_KEY = process.env.ADMIN_KEY || 'local-admin-key';
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // If DB connected, use real Admin model
    if (req.app.locals.dbConnected) {
      const admin = await Admin.findOne({ email });
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      return res.json({
        email: admin.email,
        username: admin.username,
        role: 'admin',
        adminKey: ADMIN_KEY,
        _id: admin._id
      });
    }

    // Fallback to file-store
    const admin = await dataStore.findAdminByEmail(email);
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid admin credentials (fallback)' });
    }
    res.json({
      email: admin.email,
      username: admin.username,
      role: 'admin',
      adminKey: ADMIN_KEY,
      _id: admin._id || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User login (simplified - no roles)
router.post('/login', async (req, res) => {
  try {
    if (req.app.locals.dbConnected) {
      const user = await User.findOne({
        email: req.body.email,
        password: req.body.password
      });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      return res.json({
        email: user.email,
        username: user.username,
        _id: user._id
      });
    }

    // fallback
    const user = await dataStore.findUserByEmailAndPassword(req.body.email, req.body.password);
    if (!user) return res.status(400).json({ message: 'Invalid credentials (fallback)' });
    return res.json({
      email: user.email,
      username: user.username,
      _id: user._id || null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register user (no role needed)
router.post('/register', async (req, res) => {
  try {
    if (req.app.locals.dbConnected) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) return res.status(400).json({ message: 'User exists' });
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });
      await user.save();
      return res.json({ message: 'Registered', user });
    }

    // fallback store
    const exists = await dataStore.findUserByEmail(req.body.email);
    if (exists) return res.status(400).json({ message: 'User exists (fallback)' });
    const newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      createdAt: new Date().toISOString()
    };
    await dataStore.addUser(newUser);
    res.json({ message: 'Registered (fallback)', user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all users (excluding admins)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete user
router.delete('/users/:email', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
    
    await User.findOneAndDelete({ email: req.params.email });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Admin: Get all users
router.get('/users', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
    
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Admin: Sync all data
router.get('/sync/all', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.app.locals.dbConnected) {
      const [users, admins, products, carts] = await Promise.all([
        User.find({}).lean(),
        Admin.find({}).lean(),
        Product.find({}).lean(),
        Cart.find({}).lean()
      ]);
      return res.json({ users, admins, products, carts, timestamp: new Date() });
    }

    // fallback: read from JSON files
    const [users, admins, products, carts] = await Promise.all([
      dataStore.getUsers(),
      dataStore.getAdmins(),
      dataStore.getProducts(),
      dataStore.getCarts()
    ]);
    return res.json({ users, admins, products, carts, timestamp: new Date(), fallback: true });
  } catch (error) {
    console.error('Sync data error:', error);
    res.status(500).json({ message: 'Error syncing data' });
  }
});

// Admin: Verify admin key
router.post('/admin/verify', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: 'Invalid admin key' });
    }
    res.json({ 
      valid: true,
      message: 'Admin verified successfully'
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Add new endpoint for database stats
router.get('/db-stats', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.app.locals.dbConnected) {
      const dbStats = {
        users: await User.countDocuments(),
        admins: await Admin.countDocuments(),
        products: await Product.countDocuments(),
        carts: await Cart.countDocuments(),
        lastSync: new Date()
      };
      return res.json(dbStats);
    }
    // fallback
    const dbStats = {
      users: await dataStore.countDocuments('users'),
      admins: await dataStore.countDocuments('admins'),
      products: await dataStore.countDocuments('products'),
      carts: await dataStore.countDocuments('carts'),
      lastSync: new Date(),
      fallback: true
    };
    res.json(dbStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database stats', error: error.message });
  }
});

// Add new report generation endpoint
router.get('/generate-report', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    let users, admins, products, carts;
    if (req.app.locals.dbConnected) {
      [users, admins, products, carts] = await Promise.all([
        User.find({}).lean(),
        Admin.find({}).lean(),
        Product.find({}).lean(),
        Cart.find({}).lean()
      ]);
    } else {
      [users, admins, products, carts] = await Promise.all([
        dataStore.getUsers(),
        dataStore.getAdmins(),
        dataStore.getProducts(),
        dataStore.getCarts()
      ]);
    }

    const reportData = {
      totalUsers: (users || []).length,
      totalAdmins: (admins || []).length,
      totalProducts: (products || []).length,
      totalCarts: (carts || []).length,
      activeProducts: (products || []).filter(p => p.inStock).length,
      pendingProducts: (products || []).filter(p => p.status === 'pending').length,
      totalOrders: (carts || []).reduce((sum, cart) => sum + (cart.items?.length || 0), 0),
      averageRating: (products || []).reduce((sum, p) => sum + (p.rating || 0), 0) / ((products || []).length || 1)
    };

    res.json({
      report: reportData,
      timestamp: new Date(),
      success: true,
      fallback: req.app.locals.dbConnected ? false : true
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

module.exports = router;