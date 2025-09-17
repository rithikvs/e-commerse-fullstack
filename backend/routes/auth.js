const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');

// Register user (save to DB)
router.post('/register', async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ message: 'User exists' });

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    });
    await user.save();
    res.json({ message: 'Registered', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login user (check DB)
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password
    });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin login returns adminKey (simple static for demo)
const ADMIN_KEY = process.env.ADMIN_KEY || 'local-admin-key';
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, password });
    if (!admin) return res.status(401).json({ message: 'Unauthorized' });
    res.json({ adminKey: ADMIN_KEY, admin });
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