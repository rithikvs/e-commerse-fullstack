import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import LoginRegister from './pages/LoginRegister';
import Sell from './pages/Sell';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')) || null);

  // Fetch cart from MongoDB when user logs in
  useEffect(() => {
    if (user?.email) {
      fetch(`http://localhost:5000/api/cart/${user.email}`)
        .then(res => res.json())
        .then(data => {
          setCartItems(data?.items || []);
        });
    }
  }, [user]);

  // Save cart to MongoDB
  const saveCartToDB = async (updatedCart) => {
    if (!user?.email) return;
    // Ensure items match backend schema
    const normalizedItems = (updatedCart || []).map((p) => ({
      name: p.name,
      price: p.price,
      material: p.material ?? '',
      rating: typeof p.rating === 'number' ? p.rating : Number(p.rating) || 4,
      image: p.image,
      productId: p._id || p.id || undefined,
      quantity: p.quantity ? Number(p.quantity) : 1
    }));
    try {
      const response = await fetch('http://localhost:5000/api/cart/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email, items: normalizedItems })
      });
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to save cart:', response.status, text);
      }
    } catch (error) {
      console.error('Network error saving cart:', error);
    }
  };

  const addToCart = (product) => {
    const updated = [...cartItems, product];
    setCartItems(updated);
    saveCartToDB(updated);
    alert(`${product.name} has been added to your cart.`);
  };

  const removeFromCart = (indexToRemove) => {
    const updated = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(updated);
    saveCartToDB(updated);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setCartItems([]);
  };

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <Router>
      <div>
        {/* Header */}
        <header style={styles.header}>
          <h1>Handmade Crafts</h1>
        </header>

        {/* Navbar */}
        <nav style={styles.navbar} className="navbar">
          <Link to="/" className="nav-link" style={styles.navLink}>Home</Link>
          <Link to="/about" className="nav-link" style={styles.navLink}>About</Link>
          <Link to="/contact" className="nav-link" style={styles.navLink}>Contact</Link>
          <Link to="/cart" className="nav-link" style={styles.navLink}>Cart ({cartItems.length})</Link>
          <Link to="/sell" className="nav-link" style={styles.navLink}>Sell</Link>
          <Link to="/admin" className="nav-link" style={styles.navLink}>Admin</Link>
          {user ? (
            <>
              <span className="nav-link" style={styles.navLink}>Welcome, {user.username}</span>
              <span className="nav-link" style={styles.navLink} onClick={handleLogout}>Logout</span>
            </>
          ) : (
            <Link to="/login" className="nav-link" style={styles.navLink}>Login</Link>
          )}
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} user={user} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} removeFromCart={removeFromCart} />} />
          <Route path="/payment" element={<Payment cartItems={cartItems} />} />
          <Route path="/sell" element={<Sell user={user} />} />
          <Route path="/login" element={<LoginRegister onLogin={handleLogin} />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>&copy; 2025 Handmade Crafts. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

const styles = {
  header: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px 0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '15px 20px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0,0,0,0.1)',
    position: 'sticky',
    top: '0',
    zIndex: '1000',
    gap: '10px'
  },
  navLink: {
    margin: '0 5px',
    textDecoration: 'none',
    color: '#2c3e50',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '20px',
    transition: 'all 0.3s ease',
    fontSize: '0.95em',
    whiteSpace: 'nowrap',
    userSelect: 'none'
  },
  footer: {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    color: 'white',
    textAlign: 'center',
    padding: '25px 0',
    marginTop: '60px',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
  }
};

export default App;
