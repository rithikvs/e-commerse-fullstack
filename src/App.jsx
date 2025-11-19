import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import MyOrders from './pages/MyOrders';
import LoginRegister from './pages/LoginRegister';
import Sell from './pages/Sell';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

// Create a separate component for the app content
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  // Load user and cart from localStorage so visitors can browse; actions remain protected.
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cartItems')) || []; } catch { return []; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) || null; } catch { return null; }
  });

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

  // Add to cart but require authentication; redirect to login otherwise.
  const addToCart = (product) => {
    // Admins are not allowed to perform buyer actions
    if (user?.isAdmin) {
      alert('Admin accounts cannot purchase items from the storefront. Please use the Admin Panel.');
      navigate('/admin');
      return;
    }
    if (!user || !user.email) {
      alert('Please login to add items to your cart.');
      navigate('/login');
      return;
    }

    // Find if product already exists in cart (by productId, _id, or id)
    const productId = product._id || product.id;
    const existingIndex = cartItems.findIndex(
      item => (item.productId || item._id || item.id) === productId
    );
    let updated;
    if (existingIndex !== -1) {
      // Increase quantity
      updated = cartItems.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      );
    } else {
      // Add new product with quantity 1
      updated = [...cartItems, { ...product, quantity: 1 }];
    }
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
    navigate('/login');
  };

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Check if user is authenticated and is admin
  const isAdmin = user?.isAdmin && user?.adminKey;
  const isAuthenticated = !!user;

  // Protected route component
  const ProtectedRoute = ({ children, adminRequired = false }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (adminRequired && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  // Protected admin route component
  const ProtectedAdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = user?.isAdmin && user?.adminKey;
    
    if (!isAdmin) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div>
      {/* Header and Navigation (always visible so visitors can browse) */}
      <header style={styles.header}>
        <h1>Handmade Crafts</h1>
      </header>
      <nav style={styles.navbar}>
        {/* For normal users show full nav */}
        {!isAdmin && (
          <>
            <Link to="/" className="nav-link" style={styles.navLink}>Home</Link>
            <Link to="/about" className="nav-link" style={styles.navLink}>About</Link>
            <Link to="/contact" className="nav-link" style={styles.navLink}>Contact</Link>
            <Link to="/cart" className="nav-link" style={styles.navLink}>Cart ({cartItems.length})</Link>
            <Link to="/my-orders" className="nav-link" style={styles.navLink}>My Orders</Link>
            <Link to="/sell" className="nav-link" style={styles.navLink}>Sell</Link>
          </>
        )}

        {isAuthenticated ? (
          <>
            {/* Admins see only a label; no direct Admin Panel link in nav */}
            {!isAdmin && <span className="nav-link" style={styles.navLink}>Welcome, {user.username}</span>}
            {isAdmin && <span className="nav-link" style={styles.navLink}>Admin: {user.username}</span>}
            <span className="nav-link" style={styles.navLink} onClick={handleLogout}>Logout</span>
          </>
        ) : (
          <Link to="/login" className="nav-link" style={styles.navLink}>Login / Register</Link>
        )}
      </nav>

      {/* Routes */}
      <Routes>
        {isAdmin ? (
          // Admin-only routes when an admin is signed in
          <>
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            } />
            <Route path="/login" element={<LoginRegister onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          // Normal visitor / user routes
          <>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginRegister onLogin={handleLogin} />
            } />
            <Route path="/" element={<Home addToCart={addToCart} user={user} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart cartItems={cartItems} removeFromCart={removeFromCart} />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <Payment cartItems={cartItems} />
              </ProtectedRoute>
            } />
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            } />
            <Route path="/sell" element={
              <ProtectedRoute>
                <Sell user={user} />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const styles = {
  header: {
    textAlign: 'center',
    background: 'linear-gradient(135deg, #e8d47bff 0%, #edb60eff 100%)',
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
    background: 'rgba(20, 160, 230, 0.95)',
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
