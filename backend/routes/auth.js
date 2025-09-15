const express = require('express');
const router = express.Router();
const passport = require('passport');
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

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    const user = req.user;
    // Create a user object to send to the client
    const userForClient = {
      _id: user._id,
      username: user.username || user.displayName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture
    };
    
    // Redirect to frontend with user data
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?user=${encodeURIComponent(JSON.stringify(userForClient))}`);
  }
);

// Check if user is authenticated
router.get('/current-user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;