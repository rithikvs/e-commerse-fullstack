import React from 'react';

function Payment() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Checkout</h2>
        <p style={styles.description}>Complete your purchase with secure payment</p>
        
        <form style={styles.form}>
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
            <select style={styles.input}>
              <option>Credit Card</option>
              <option>Debit Card</option>
              <option>UPI</option>
              <option>Cash on Delivery</option>
            </select>
          </div>
          
          <button type="submit" className="button" style={styles.button}>Place Order</button>
        </form>
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
  }
};

export default Payment;
