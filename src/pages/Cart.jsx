import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Cart({ cartItems, removeFromCart }) {
  // Initialize quantities from localStorage or fallback to cartItems
  const [quantities, setQuantities] = useState(() => {
    const savedQuantities = JSON.parse(localStorage.getItem('cartQuantities')) || {};
    // Initialize with current cart items
    const initialQuantities = {};
    cartItems.forEach((item, index) => {
      initialQuantities[index] = savedQuantities[index] || item.quantity || 1;
    });
    return initialQuantities;
  });

  // Save quantities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartQuantities', JSON.stringify(quantities));
    
    // Update cart items with new quantities
    const updatedItems = cartItems.map((item, index) => ({
      ...item,
      quantity: quantities[index] || 1
    }));
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  }, [quantities]);

  const handleQuantityChange = (index, delta) => {
    const item = cartItems[index];
    const currentQty = quantities[index] || 1;
    const newQuantity = currentQty + delta;
    
    // Don't allow quantity below 1
    if (newQuantity < 1) return;
    
    // Don't allow quantity above stock
    if (typeof item.stock === 'number' && newQuantity > item.stock) {
      alert(`Only ${item.stock} items available in stock`);
      return;
    }

    // Update quantities state
    setQuantities(prev => ({
      ...prev,
      [index]: newQuantity
    }));
  };

  // Calculate total with current quantities
  const totalAmount = cartItems.reduce((sum, item, index) => {
    const price = Number(String(item.price).replace(/[^0-9.]/g, ''));
    return sum + price * (quantities[index] || 1);
  }, 0);

  // Format cart items with current quantities
  const prepareCartItems = cartItems.map((item, index) => ({
    ...item,
    _id: item._id || item.productId,
    quantity: quantities[index] || 1,
    price: String(item.price).replace(/[₹,]/g, '')
  }));

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
                
                <div style={styles.quantityControl}>
                  <button 
                    style={styles.quantityBtn}
                    onClick={() => handleQuantityChange(index, -1)}
                  >
                    −
                  </button>
                  <span style={styles.quantityDisplay}>
                    {quantities[index] || 1}
                  </span>
                  <button 
                    style={{...styles.quantityBtn, backgroundColor: '#27ae60'}}
                    onClick={() => handleQuantityChange(index, 1)}
                  >
                    +
                  </button>
                </div>

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
            <Link 
              to="/payment" 
              state={{ cartItems: prepareCartItems }}
            >
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
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '15px 0',
    background: '#f8f9fa',
    padding: '8px',
    borderRadius: '25px',
    width: 'fit-content'
  },
  quantityBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '15px',
    border: 'none',
    background: '#3498db',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    lineHeight: '1'
  },
  quantityDisplay: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: '40px',
    textAlign: 'center'
  }
};

export default Cart;
