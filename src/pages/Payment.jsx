import React, { useState, useEffect } from 'react';

function Payment({ cartItems: propCartItems }) {
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [totalAmount, setTotalAmount] = useState(0);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: ''
  });

  useEffect(() => {
    // Prefer cartItems from props (App state), fallback to localStorage
    let cartItems = propCartItems;
    if (!cartItems || cartItems.length === 0) {
      cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    }
    const total = cartItems.reduce((sum, item) => {
      const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
      return sum + price * (item.quantity || 1);
    }, 0);
    setTotalAmount(total);
  }, [propCartItems]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setCardDetails({ cardNumber: '', expiry: '', cvv: '', nameOnCard: '' });
  };

  const handleCardInput = (e) => {
    setCardDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card')) {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.nameOnCard) {
        alert('Please fill all card details.');
        return;
      }
      // Optionally, add more validation for card number, expiry, cvv
      alert(`Payment of ₹${totalAmount.toFixed(2)} via ${paymentMethod} successful!`);
    } else if (paymentMethod === 'UPI') {
      alert('Please scan the QR code and pay the exact amount.');
    } else {
      alert('Order placed with Cash on Delivery!');
    }
    // ...existing code for order placement...
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Checkout</h2>
        <p style={styles.description}>Complete your purchase with secure payment</p>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input type="text" placeholder="Enter your full name" style={styles.input} />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" placeholder="Enter your email" style={styles.input} />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Shipping Address</label>
            <input type="text" placeholder="Enter your address" style={styles.input} />
          </div>
          
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input type="text" placeholder="Enter city" style={styles.input} />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Postal Code</label>
              <input type="text" placeholder="Enter postal code" style={styles.input} />
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

          <button type="submit" className="button" style={styles.button}>Place Order</button>
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
