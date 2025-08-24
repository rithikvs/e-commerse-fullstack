import React from 'react';
import { Link } from 'react-router-dom';

function Cart({ cartItems, removeFromCart }) {
  // Calculate total amount
  const totalAmount = cartItems.reduce((sum, item) => {
    const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
    return sum + price * (item.quantity || 1);
  }, 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="grid" style={styles.grid}>
            {cartItems.map((item, index) => (
              <div key={index} className="card" style={styles.card}>
                <img src={item.image} alt={item.name} style={styles.image} />
                <h3>{item.name}</h3>
                <p><strong>Price:</strong> ₹{String(item.price).replace(/^₹+/, '')}</p>
                <p><strong>Material:</strong> {item.material}</p>
                <p><strong>Rating:</strong> ⭐ {item.rating}</p>
                <p><strong>Quantity:</strong> {item.quantity || 1}</p>
                <div style={styles.buttonGroup}>
                  <button
                    className="removeBtn"
                    onClick={() => removeFromCart(index)}
                    style={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={styles.totalSection}>
            <h3 style={styles.totalLabel}>Total Amount:</h3>
            <div style={styles.totalValue}>₹{totalAmount.toFixed(2)}</div>
            <Link to="/payment">
              <button className="buyBtn" style={styles.buyBtn}>Buy All</button>
            </Link>
          </div>
        </>
      )}
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
  title: {
    marginBottom: '40px',
    color: '#2c3e50',
    fontSize: '2.5em',
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px',
    justifyContent: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  card: {
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    textAlign: 'left',
    transition: 'all 0.3s ease'
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    marginBottom: '15px',
    borderRadius: '15px'
  },
  buttonGroup: {
    marginTop: '20px',
    display: 'flex',
    gap: '15px',
    justifyContent: 'space-between'
  },
  removeBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.95em',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    boxShadow: 'none',
    flex: '1',
    height: '44px',
    lineHeight: '20px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  totalSection: {
    marginTop: '40px',
    textAlign: 'center',
    background: '#f8f9fa',
    borderRadius: '16px',
    padding: '30px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  totalLabel: {
    fontSize: '1.3em',
    color: '#3498db',
    marginBottom: '10px'
  },
  totalValue: {
    fontSize: '2em',
    color: '#e74c3c',
    fontWeight: '700',
    marginBottom: '18px'
  },
  buyBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    boxShadow: 'none',
    width: '100%',
    maxWidth: '220px',
    height: '50px',
    lineHeight: '24px',
    outline: 'none',
    boxSizing: 'border-box'
  }
};

export default Cart;
