import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [state, setState] = useState({
    users: [],
    admins: [],
    products: [],
    carts: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [stockUpdates, setStockUpdates] = useState({});
  const navigate = useNavigate();

  const adminKey = JSON.parse(localStorage.getItem('currentUser'))?.adminKey;

  useEffect(() => {
    if (!adminKey) {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, [adminKey]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-admin-key': adminKey };
      const [users, products, carts, admins] = await Promise.all([
        fetch('http://localhost:5000/api/auth/all', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/products', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/cart/all', { headers }).then(r => r.json()),
        fetch('http://localhost:5000/api/auth/admins', { headers }).then(r => r.json())
      ]);

      // Generate activities from data
      let activities = [];

      // Product activities
      products?.forEach(p => {
        activities.push({
          timestamp: p.createdAt,
          email: p.owner,
          type: 'product_added',
          details: `Added product: ${p.name} (₹${p.price})`
        });
      });

      // Cart activities
      carts?.forEach(c => {
        activities.push({
          timestamp: c.updatedAt || c.lastUpdated,
          email: c.userEmail,
          type: 'cart_updated',
          details: `Cart updated: ${c.items?.length || 0} items`
        });
      });

      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setState({
        users: users || [],
        admins: admins || [],
        products: products || [],
        carts: carts || [],
        activities: activities
      });

      // Initialize stock values
      const stocks = {};
      products?.forEach(p => {
        stocks[p._id] = p.stock || 0;
      });
      setStockUpdates(stocks);

    } catch (error) {
      console.error('Admin data load error:', error);
      if (error.message.includes('unauthorized')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleDeleteUser = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${email}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      loadAdminData(); // Refresh data
      alert('User deleted successfully');
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/admin`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      loadAdminData(); // Refresh data
      alert('Product deleted successfully');
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    }
  };

  const handleDeleteCart = async (userEmail) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${userEmail}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });
      if (!response.ok) throw new Error('Failed to delete cart');
      loadAdminData(); // Refresh data
      alert('Cart deleted successfully');
    } catch (error) {
      alert('Error deleting cart: ' + error.message);
    }
  };

  const handleStockChange = (productId, value) => {
    setStockUpdates(prev => ({
      ...prev,
      [productId]: Number(value)
    }));
  };

  const saveStock = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/admin/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          stock: Number(stockUpdates[productId])
        })
      });
      
      if (!response.ok) throw new Error('Failed to update stock');
      loadAdminData(); // Refresh data
      alert('Stock updated successfully');
    } catch (error) {
      alert('Error updating stock: ' + error.message);
    }
  };

  const handleApproveProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        }
      });
      if (!response.ok) throw new Error('Failed to approve product');
      loadAdminData(); // Refresh data
      alert('Product approved successfully');
    } catch (error) {
      alert('Error approving product: ' + error.message);
    }
  };

  const handleRejectProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        }
      });
      if (!response.ok) throw new Error('Failed to reject product');
      loadAdminData(); // Refresh data
      alert('Product rejected successfully');
    } catch (error) {
      alert('Error rejecting product: ' + error.message);
    }
  };

  if (loading) {
    return <div style={styles.loadingContainer}>Loading admin panel...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Admin Panel</h2>
        <div style={styles.headerActions}>
          <button onClick={loadAdminData} style={styles.primaryBtn}>Refresh Data</button>
          <button onClick={handleLogout} style={styles.dangerBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Regular Users</div>
          <div style={styles.kpiValue}>{state.users.length - state.admins.length}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Admin Users</div>
          <div style={styles.kpiValue}>{state.admins.length}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Total Products</div>
          <div style={styles.kpiValue}>{state.products.length}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Items in Carts</div>
          <div style={styles.kpiValue}>{state.carts.reduce((sum, c) => sum + (c.totalItems || (c.items?.length || 0)), 0)}</div>
        </div>
      </div>

      <div style={styles.updatedAt}>Last updated: {new Date().toLocaleTimeString()}</div>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Admin Users</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.theadSticky}>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {state.admins.map((admin, idx) => (
                <tr key={admin._id || admin.email} style={idx % 2 ? styles.zebraRow : undefined}>
                  <td>{admin.email}</td>
                  <td>{admin.username}</td>
                  <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Regular Users</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.theadSticky}>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Products Added</th>
                <th>Cart Items</th>
                <th>Last Cart Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.users
                .filter(u => u.role !== 'admin') // Only non-admin users
                .map((u, idx) => {
                  const userProducts = state.products.filter(p => p.owner === u.email);
                  const userCart = state.carts.find(c => c.userEmail === u.email);
                  return (
                    <tr key={u._id || u.email} style={idx % 2 ? styles.zebraRow : undefined}>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>{u.role}</td>
                      <td>
                        {userProducts.length === 0 ? 'None' : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                            {userProducts.map(p => (
                              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>{p.name} (₹{p.price})</span>
                                <button style={styles.smallDangerBtn} onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        {userCart && userCart.items.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                            {userCart.items.map((i, iIdx) => (
                              <div key={i.productId || iIdx}>
                                {i.name} (Qty: {i.quantity}) - ₹{i.price}
                              </div>
                            ))}
                            <button style={styles.smallDangerBtn} onClick={() => handleDeleteCart(u.email)}>Delete Cart</button>
                          </div>
                        ) : 'Empty'}
                      </td>
                      <td>
                        {userCart ? new Date(userCart.lastUpdated).toLocaleString() : 'Never'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
                          <button style={styles.smallDangerBtn} onClick={() => handleDeleteUser(u.email)}>Delete User</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Pending Products</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.theadSticky}>
              <tr>
                <th>Name</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Material</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.products
                .filter(p => p.status === 'pending')
                .map((product, idx) => (
                  <tr key={product._id} style={idx % 2 ? styles.zebraRow : undefined}>
                    <td>{product.name}</td>
                    <td>{product.owner}</td>
                    <td>₹{product.price}</td>
                    <td>{product.material}</td>
                    <td>{product.stock}</td>
                    <td style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        style={styles.approveBtn} 
                        onClick={() => handleApproveProduct(product._id)}
                      >
                        Approve
                      </button>
                      <button 
                        style={styles.rejectBtn} 
                        onClick={() => handleRejectProduct(product._id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>All Products & Stock</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.theadSticky}>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Price</th>
                <th>Material</th>
                <th>Rating</th>
                <th>Stock</th>
                <th>In Stock</th>
                <th>Added</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((p, idx) => (
                <tr key={p._id} style={idx % 2 ? styles.zebraRow : undefined}>
                  <td>{p.name}</td>
                  <td>{p.owner}</td>
                  <td>{p.price}</td>
                  <td>{p.material}</td>
                  <td>{p.rating}</td>
                  <td>
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      <input type="number" min="0" value={stockUpdates[p._id] ?? (typeof p.stock==='number'?p.stock:0)} onChange={(e)=>handleStockChange(p._id, e.target.value)} style={styles.input} />
                      <button style={styles.primaryBtn} onClick={()=>saveStock(p._id)}>Save</button>
                    </div>
                  </td>
                  <td>{(typeof p.stock==='number'?p.stock:0) > 0 ? 'Yes' : 'No'}</td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</td>
                  <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'}</td>
                  <td>
                    <button style={styles.smallDangerBtn} onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>All Carts</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.theadSticky}>
              <tr>
                <th>User Email</th>
                <th>Products</th>
                <th>Total Items</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(state.carts) && state.carts.length > 0 ? state.carts.map((c, idx) => (
                <tr key={c._id || c.userEmail} style={idx % 2 ? styles.zebraRow : undefined}>
                  <td>{c.userEmail}</td>
                  <td>
                    {Array.isArray(c.items) && c.items.map((i, iIdx) => (
                      <div key={i.productId || iIdx}>
                        {i.name} (Qty: {i.quantity}) - ₹{i.price}
                      </div>
                    ))}
                  </td>
                  <td>{c.totalItems || (c.items && c.items.length) || 0}</td>
                  <td>{c.lastUpdated ? new Date(c.lastUpdated).toLocaleString() : '—'}</td>
                  <td>
                    <button style={styles.smallDangerBtn} onClick={() => handleDeleteCart(c.userEmail)}>Delete Cart</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No carts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>All Activities</h3>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.theadSticky}>
              <tr>
                <th>Timestamp</th>
                <th>User Email</th>
                <th>Activity Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {state.activities.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No activities recorded yet</td>
                </tr>
              ) : (
                state.activities.map((activity, index) => (
                  <tr key={index} style={index % 2 ? styles.zebraRow : undefined}>
                    <td>{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '—'}</td>
                    <td>{activity.email || '—'}</td>
                    <td>
                      <span style={{
                        ...styles.activityBadge,
                        backgroundColor: 
                          activity.type === 'product_added' ? '#e3f2fd' : 
                          activity.type === 'cart_updated' ? '#fff3e0' : 
                          '#e8f5e9',
                        color: 
                          activity.type === 'product_added' ? '#0d47a1' : 
                          activity.type === 'cart_updated' ? '#e65100' : 
                          '#1b5e20'
                      }}>
                        {activity.type === 'product_added' ? 'Product Added' : 
                         activity.type === 'cart_updated' ? 'Cart Updated' : 
                         'User Registered'}
                      </span>
                    </td>
                    <td>{activity.details || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 30px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)',
    overflowX: 'hidden',
    position: 'relative' // Add this
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  heading: {
    fontSize: '2.4em',
    fontWeight: '700',
    color: '#2c3e50',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  primaryBtn: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  dangerBtn: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '30px'
  },
  kpiCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '18px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
  },
  kpiTitle: {
    color: '#6c757d',
    fontSize: '0.95em',
    marginBottom: '6px'
  },
  kpiValue: {
    color: '#2c3e50',
    fontSize: '1.8em',
    fontWeight: '700'
  },
  updatedAt: {
    color: '#6c757d',
    fontSize: '0.9em',
    marginBottom: '14px'
  },
  section: {
    marginBottom: '40px',
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    overflowX: 'auto',
    minHeight: '200px' // Add minimum height
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    maxHeight: '500px', // Increase max height
    overflowY: 'auto',
    backgroundColor: '#fff'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    background: 'white',
    minWidth: '800px' // Add minimum width
  },
  theadSticky: {
    position: 'sticky',
    top: 0,
    background: '#f8f9fa',
    zIndex: 1
  },
  zebraRow: {
    backgroundColor: '#fafafa'
  },
  smallDangerBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginLeft: '8px'
  },
  activityBadge: {
    padding: '6px 10px',
    borderRadius: '4px',
    fontWeight: '500',
    display: 'inline-block',
    textAlign: 'center',
    minWidth: '120px'
  },
  input: {
    padding:'6px 8px',
    border:'1px solid #e1e5ea',
    borderRadius:6
  },
  approveBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  rejectBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '1.2em',
    color: '#666'
  }
};

export default AdminPanel;
