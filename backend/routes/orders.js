const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
<<<<<<< HEAD
const dataStore = require('../dataStore');
=======
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577

const ADMIN_KEY = process.env.ADMIN_KEY || 'local-admin-key';

// Create new order
router.post('/', async (req, res) => {
  try {
<<<<<<< HEAD
    if (req.app.locals.dbConnected) {
      const order = new Order(req.body);
      await order.save();
      return res.status(201).json(order);
    }
    // fallback: file-store
    const created = await dataStore.addOrder({ ...req.body, createdAt: new Date().toISOString(), _id: `order_${Date.now()}` });
    res.status(201).json(created);
=======
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Get user's orders
router.get('/user/:email', async (req, res) => {
  try {
<<<<<<< HEAD
    if (req.app.locals.dbConnected) {
      const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
      return res.json(orders);
    }
    const orders = await dataStore.getOrders();
    const filtered = (orders || []).filter(o => o.userEmail === req.params.email).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(filtered);
=======
    const orders = await Order.find({ userEmail: req.params.email })
      .sort({ createdAt: -1 });
    res.json(orders);
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// New: Admin - get all orders (protected by ADMIN_KEY)
router.get('/all', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });

<<<<<<< HEAD
    if (req.app.locals.dbConnected) {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      return res.json(orders);
    }
    const orders = await dataStore.getOrders();
    res.json((orders || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
=======
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// New: Admin - export all orders as CSV (attachment)
router.get('/export', async (req, res) => {
  try {
    const key = req.headers['x-admin-key'];
    if (key !== ADMIN_KEY) return res.status(401).json({ message: 'Unauthorized' });

<<<<<<< HEAD
    const orders = req.app.locals.dbConnected
      ? await Order.find({}).sort({ createdAt: -1 }).lean()
      : await dataStore.getOrders();
=======
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
>>>>>>> b20a3629c6727b9dbf43b803b1c51c5cb2b1e577

    // CSV header
    const headers = [
      'OrderID',
      'OrderDate',
      'UserEmail',
      'BuyerName',
      'ProductID',
      'ProductName',
      'Quantity',
      'ItemPrice',
      'OrderTotal',
      'PaymentMethod',
      'PaymentStatus',
      'OrderStatus',
      'ShippingAddress',
      'ShippingCity',
      'ShippingPostalCode'
    ];

    const escapeCell = (val) => {
      if (val === undefined || val === null) return '';
      const str = typeof val === 'string' ? val : String(val);
      // Escape double quotes by doubling them, and wrap cell in quotes if contains comma/newline/quote
      if (/[,"\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csv = headers.join(',') + '\n';

    for (const order of orders) {
      const orderDate = order.createdAt ? new Date(order.createdAt).toISOString() : '';
      const orderTotal = order.totalAmount ?? '';
      const buyerName = order?.shippingDetails?.fullName || '';

      if (Array.isArray(order.items) && order.items.length) {
        for (const item of order.items) {
          const row = [
            order._id,
            orderDate,
            order.userEmail,
            buyerName,
            item.productId || '',
            item.name || '',
            item.quantity || '',
            item.price || '',
            orderTotal,
            order.paymentMethod || '',
            order.paymentStatus || '',
            order.orderStatus || '',
            order?.shippingDetails?.address || '',
            order?.shippingDetails?.city || '',
            order?.shippingDetails?.postalCode || ''
          ].map(escapeCell);
          csv += row.join(',') + '\n';
        }
      } else {
        // Order without items (unlikely) — still include a row
        const row = [
          order._id,
          orderDate,
          order.userEmail,
          buyerName,
          '',
          '',
          '',
          '',
          orderTotal,
          order.paymentMethod || '',
          order.paymentStatus || '',
          order.orderStatus || '',
          order?.shippingDetails?.address || '',
          order?.shippingDetails?.city || '',
          order?.shippingDetails?.postalCode || ''
        ].map(escapeCell);
        csv += row.join(',') + '\n';
      }
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_report.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting orders:', error);
    res.status(500).json({ message: 'Error exporting orders', error: error.message });
  }
});

module.exports = router;
