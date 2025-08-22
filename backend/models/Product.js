const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: String,
    required: [true, 'Product price is required'],
    trim: true
  },
  material: {
    type: String,
    required: [true, 'Product material is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Product rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 4.0
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  owner: {
    type: String,
    required: [true, 'Product owner is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    trim: true,
    default: 'Handmade'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 10,
    min: [0, 'Stock cannot be negative']
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Keep inStock in sync with stock
productSchema.pre('save', function(next) {
  this.inStock = (typeof this.stock === 'number' ? this.stock : 0) > 0;
  next();
});

// Index for better query performance
productSchema.index({ name: 'text', material: 'text', category: 'text' });
productSchema.index({ owner: 1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);