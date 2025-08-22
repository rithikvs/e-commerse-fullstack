const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const ADMIN_KEY = process.env.ADMIN_KEY || 'local-admin-key';

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, material, minRating, maxRating, search } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (material) {
      query.material = { $regex: material, $options: 'i' };
    }
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = parseFloat(minRating);
      if (maxRating) query.rating.$lte = parseFloat(maxRating);
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Add new product
router.post('/', async (req, res) => {
  try {
    const productData = {
      ...req.body,
      owner: req.body.owner || 'anonymous'
    };

    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({ 
      message: 'Product added successfully', 
      product: product 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message) 
      });
    }
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

// Update product (including stock) - owner protected via body owner
router.put('/:id', async (req, res) => {
  try {
    const { owner } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.owner !== owner) {
      return res.status(403).json({ message: 'Unauthorized to update this product' });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Admin: update stock only
router.put('/:id/admin/stock', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
    const { stock } = req.body;
    if (typeof stock !== 'number' || stock < 0) return res.status(400).json({ message: 'Invalid stock' });
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { stock, inStock: stock > 0 },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Stock updated', product: updated });
  } catch (error) {
    console.error('Admin stock update error:', error);
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
});

// Admin delete product
router.delete('/:id/admin', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted by admin' });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Get products by owner
router.get('/owner/:email', async (req, res) => {
  try {
    const products = await Product.find({ owner: req.params.email }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching owner products:', error);
    res.status(500).json({ message: 'Error fetching owner products', error: error.message });
  }
});

module.exports = router;