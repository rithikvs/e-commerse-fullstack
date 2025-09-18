const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

// Admin login using database credentials
const ADMIN_KEY = process.env.ADMIN_KEY || 'local-admin-key';
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find admin in database
    const admin = await Admin.findOne({ email });
    
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    res.json({ 
      email: admin.email,
      username: admin.username,
      role: 'admin',
      adminKey: ADMIN_KEY,
      _id: admin._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User login (simplified - no roles)
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({
      email: user.email,
      username: user.username,
      _id: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register user (no role needed)
router.post('/register', async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: 'User exists' });

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    });
    await user.save();
    res.json({ message: 'Registered', user });
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

module.exports = router;