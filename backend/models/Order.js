const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    productId: String,
    name: String,
    price: String,
    quantity: Number,
    material: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingDetails: {
    fullName: String,
    email: String,
    address: String,
    city: String,
    postalCode: String
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'shipped', 'delivered'],
    default: 'placed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
