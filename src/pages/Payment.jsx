import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Payment({ cartItems: propCartItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [totalAmount, setTotalAmount] = useState(0);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: ''
  });
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const [shippingDetails, setShippingDetails] = useState(() => ({
    fullName: user?.username || '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: ''
  }));

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Get cart items from location state or props
  const cartItems = location.state?.cartItems || propCartItems || [];

  useEffect(() => {
    // Calculate total from cart items
    const total = cartItems.reduce((sum, item) => {
      const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
      return sum + price * (item.quantity || 1);
    }, 0);
    setTotalAmount(total);
  }, [cartItems]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setCardDetails({ cardNumber: '', expiry: '', cvv: '', nameOnCard: '' });
  };

  const handleCardInput = (e) => {
    setCardDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Background sync for any queued orders
  useEffect(() => {
    const syncPendingOrders = async () => {
      const pending = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      if (!pending.length) return;
      const remaining = [];
      for (const order of pending) {
        const ok = await saveOrderWithRetry(order, 3);
        if (!ok) remaining.push(order);
      }
      localStorage.setItem('pendingOrders', JSON.stringify(remaining));
    };

    // run immediately then every 60s
    syncPendingOrders();
    const interval = setInterval(syncPendingOrders, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Helper: retry POST to /api/orders
  // Helper: retry POST to /api/orders — returns true on success, false on failure
  const saveOrderWithRetry = async (orderPayload, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const orderResponse = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        if (orderResponse.ok) {
          console.log('Order saved on attempt', attempt);
          return true;
        } else {
          const text = await orderResponse.text();
          console.error(`Order save failed (attempt ${attempt})`, orderResponse.status, text);
        }
      } catch (err) {
        console.error(`Network error saving order (attempt ${attempt}):`, err);
      }
      // Exponential backoff
      await new Promise(res => setTimeout(res, 500 * attempt));
    }
    return false;
  };

  const queueOrderForLater = (orderPayload) => {
    const pending = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    pending.push({ ...orderPayload, queuedAt: new Date().toISOString() });
    localStorage.setItem('pendingOrders', JSON.stringify(pending));
    console.warn('Order queued for later sync (pendingOrders updated).');
  };

  const processOrder = async () => {
    setOrderProcessing(true);
    try {
      // Validate form fields (use controlled state)
      if (!shippingDetails.fullName || !shippingDetails.email || !shippingDetails.address || !shippingDetails.city || !shippingDetails.postalCode) {
        throw new Error('Please fill all shipping details');
      }

      // Process each cart item and update stock
      for (const item of cartItems) {
        const productId = item._id || item.productId;
        const quantity = item.quantity || 1;

        // Update product stock
        const response = await fetch(`http://localhost:5000/api/products/${productId}/stock`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reduceBy: quantity
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update product stock');
        }
      }

      // Save order to database
      const orderItems = cartItems.map(item => ({
        productId: item._id || item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        material: item.material
      }));

      // shippingDetails already comes from controlled state

      const orderPayload = {
        userEmail: user?.email || shippingDetails.email,
        items: orderItems,
        totalAmount: totalAmount,
        shippingDetails,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'pending' : 'completed',
        orderStatus: 'placed'
      };

      // Attempt to save order with retries — returns boolean
      const saved = await saveOrderWithRetry(orderPayload, 3);
      if (!saved) {
        // If save ultimately fails, queue for automatic background retry
        queueOrderForLater(orderPayload);
        alert('Order placed locally, but saving to the server failed. The app queued the order and will retry.');
      } else {
        alert('Order placed successfully!');
      }

      // Clear purchased items from cart
      if (user?.email) {
        try {
          // Get current cart
          const cartResponse = await fetch(`http://localhost:5000/api/cart/${user.email}`);
          const currentCart = await cartResponse.json();
          
          // Remove purchased items
          const remainingItems = currentCart.items?.filter(item => 
            !cartItems.some(purchasedItem => 
              purchasedItem._id === item.productId || 
              purchasedItem.productId === item.productId
            )
          ) || [];

          // Update cart
          await fetch('http://localhost:5000/api/cart/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: user.email,
              items: remainingItems
            })
          });

          // Clear local storage
          localStorage.setItem('cartItems', JSON.stringify(remainingItems));
        } catch (error) {
          console.error('Error updating cart:', error);
        }
      }

      navigate('/');
    } catch (err) {
      alert(err.message || 'Error processing order');
    } finally {
      setOrderProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await processOrder();
    } catch (err) {
      console.error('Order processing error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Checkout</h2>
        <p style={styles.description}>Complete your purchase with secure payment</p>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              style={styles.input}
              value={shippingDetails.fullName}
              onChange={handleShippingChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              style={styles.input}
              value={shippingDetails.email}
              onChange={handleShippingChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Shipping Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter your address"
              style={styles.input}
              value={shippingDetails.address}
              onChange={handleShippingChange}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input
                type="text"
                name="city"
                placeholder="Enter city"
                style={styles.input}
                value={shippingDetails.city}
                onChange={handleShippingChange}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Postal Code</label>
              <input
                type="text"
                name="postalCode"
                placeholder="Enter postal code"
                style={styles.input}
                value={shippingDetails.postalCode}
                onChange={handleShippingChange}
              />
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Method</label>
            <select style={styles.input} value={paymentMethod} onChange={handlePaymentMethodChange}>
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>UPI</option>
              <option>Cash on Delivery</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Total Amount</label>
            <input
              type="text"
              value={`₹${totalAmount.toFixed(2)}`}
              style={styles.input}
              readOnly
            />
          </div>

          {/* Credit Card / Debit Card fields */}
          {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
            <div style={styles.cardSection}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name on Card</label>
                <input
                  type="text"
                  name="nameOnCard"
                  value={cardDetails.nameOnCard}
                  onChange={handleCardInput}
                  style={styles.input}
                  placeholder="Name as on card"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInput}
                  style={styles.input}
                  placeholder="Card Number"
                  maxLength={16}
                  required
                />
              </div>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Expiry</label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardInput}
                    style={styles.input}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CVV</label>
                  <input
                    type="password"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardInput}
                    style={styles.input}
                    placeholder="CVV"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="button" 
            style={{...styles.button, opacity: orderProcessing ? 0.7 : 1}} 
            disabled={orderProcessing}
          >
            {orderProcessing ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        {/* Show QR code if UPI is selected */}
        {paymentMethod === 'UPI' && (
          <div style={styles.qrSection}>
            <h3 style={styles.qrTitle}>Scan & Pay via UPI</h3>
            <img
              src="/Rithik_UPI_QR.jpg" // Make sure this image exists in your public folder
              alt="UPI QR Code"
              style={styles.qrImage}
            />
            <div style={styles.qrDetails}>
              <div><b>UPI ID:</b> jeyarithik2111@okhdfcbank</div>
              <div style={{ fontSize: '1.1em', color: '#e74c3c', marginTop: '10px', fontWeight: 'bold' }}>
                <b>Amount to Pay: ₹{totalAmount.toFixed(2)}</b>
              </div>
              <div style={{ fontSize: '0.95em', color: '#6c757d', marginTop: '8px' }}>
                Scan to pay with any UPI app. Please pay the exact amount shown above.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 30px',
    textAlign: 'center',
    minHeight: '80vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)'
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    background: 'white',
    padding: '50px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2.5em',
    fontWeight: '700',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  },
  description: {
    fontSize: '1.1em',
    color: '#6c757d',
    marginBottom: '40px'
  },
  form: {
    textAlign: 'left'
  },
  formGroup: {
    marginBottom: '20px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#2c3e50',
    fontWeight: '600',
    fontSize: '0.95em'
  },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '25px',
    border: '2px solid #e9ecef',
    fontSize: '1em',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    backgroundColor: '#27ae60',
    color: 'white',
    padding: '15px 30px',
    width: '100%',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: '600',
    marginTop: '20px',
    transition: 'background-color 0.2s',
    boxShadow: 'none',
    height: '50px',
    lineHeight: '20px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  qrSection: {
    marginTop: '40px',
    textAlign: 'center',
    background: '#f8f9fa',
    borderRadius: '16px',
    padding: '30px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
  },
  qrTitle: {
    fontSize: '1.3em',
    color: '#3498db',
    marginBottom: '18px'
  },
  qrImage: {
    width: '260px',
    height: '260px',
    objectFit: 'contain',
    marginBottom: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  qrDetails: {
    fontSize: '1.1em',
    color: '#2c3e50'
  },
  cardSection: {
    marginTop: '20px',
    marginBottom: '20px',
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px'
  }
};

export default Payment;
