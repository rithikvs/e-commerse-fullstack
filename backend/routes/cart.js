const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

// Save or update user's cart
router.post('/save', async (req, res) => {
  const { userEmail, items } = req.body;

  try {
    // First, remove existing cart for this user
    await Cart.deleteMany({ userEmail });
    
    if (Array.isArray(items) && items.length > 0) {
      // Create a single cart document with all items
      const cartDoc = new Cart({ userEmail, items });
      await cartDoc.save();
      res.json({ message: 'Cart updated successfully', cart: cartDoc });
    } else {
      res.json({ message: 'Cart cleared', items: [] });
    }
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ message: 'Error saving cart', error: error.message });
  }
});

// Admin: Get all carts
router.get('/all', async (req, res) => {
  try {
    const carts = await Cart.find({});
    console.log('Fetched carts:', carts.length);
    res.json(carts);
  } catch (err) {
    console.error('Error fetching all carts:', err);
    res.status(500).json({ message: 'Error fetching carts', error: err.message });
  }
});

// Get cart by email
router.get('/:userEmail', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userEmail: req.params.userEmail });
    if (cart) {
      res.json({ userEmail: req.params.userEmail, items: cart.items || [] });
    } else {
      res.json({ userEmail: req.params.userEmail, items: [] });
    }
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
});

// Clear cart for a user
router.delete('/:userEmail', async (req, res) => {
  try {
    await Cart.deleteMany({ userEmail: req.params.userEmail });
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Error clearing cart', error: err.message });
  }
});

module.exports = router;
