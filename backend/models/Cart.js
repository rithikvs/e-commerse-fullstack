const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
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
    max: [5, 'Rating cannot exceed 5']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  productId: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  }
});

const cartSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
cartSchema.index({ userEmail: 1 });
cartSchema.index({ lastUpdated: -1 });

// Pre-save middleware to update totalItems
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + (item.quantity || 1), 0);
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
