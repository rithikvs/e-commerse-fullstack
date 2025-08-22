import React from 'react';
import { Link } from 'react-router-dom';

function Cart({ cartItems, removeFromCart }) {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid" style={styles.grid}>
          {cartItems.map((item, index) => (
            <div key={index} className="card" style={styles.card}>
              <img src={item.image} alt={item.name} style={styles.image} />
              <h3>{item.name}</h3>
              <p><strong>Price:</strong> {item.price}</p>
              <p><strong>Material:</strong> {item.material}</p>
              <p><strong>Rating:</strong> ⭐ {item.rating}</p>

              <div style={styles.buttonGroup}>
                <button
                  className="removeBtn"
                  onClick={() => removeFromCart(index)}
                  style={styles.removeBtn}
                >
                  Remove
                </button>
                <Link to="/payment">
                  <button className="buyBtn" style={styles.buyBtn}>Buy Now</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
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
  buyBtn: {
    backgroundColor: '#27ae60',
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
  }
};

export default Cart;
