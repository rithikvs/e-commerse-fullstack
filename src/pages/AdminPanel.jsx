import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

async function safeJsonFetch(url, options = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return {};
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [products, setProducts] = useState([]);
  const [carts, setCarts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [stockUpdates, setStockUpdates] = useState({});
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const adminKey = localStorage.getItem('adminKey');

  useEffect(() => {
    if (!adminKey) {
      navigate('/admin/login');
    }
  }, [adminKey, navigate]);

  const authHeaders = {
    'x-admin-key': adminKey || ''
  };

  const fetchAll = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const [usersData, productsData, cartsData, adminsData] = await Promise.all([
        safeJsonFetch('http://localhost:5000/api/users/all', { headers: authHeaders }),
        safeJsonFetch('http://localhost:5000/api/products', { headers: authHeaders }),
        safeJsonFetch('http://localhost:5000/api/cart/all', { headers: authHeaders }),
        safeJsonFetch('http://localhost:5000/api/auth/admins', { headers: authHeaders }),
      ]);

      const usersArr = Array.isArray(usersData) ? usersData : [];
      const productsArr = Array.isArray(productsData) ? productsData : [];
      const cartsArr = Array.isArray(cartsData) ? cartsData : [];
      const adminsArr = Array.isArray(adminsData) ? adminsData : [];

      setUsers(usersArr);
      setAdmins(adminsArr);
      setProducts(productsArr);
      setCarts(cartsArr);

      // Initialize stock form values from latest products
      const initialStocks = {};
      for (const p of productsArr) {
        initialStocks[p._id] = typeof p.stock === 'number' ? p.stock : 0;
      }
      setStockUpdates(initialStocks);

      let allActivities = [];
      if (productsArr.length > 0) {
        allActivities = allActivities.concat(productsArr.map(p => ({
          type: 'product_added',
          timestamp: p.createdAt || new Date().toISOString(),
          email: p.owner || 'unknown',
          details: `Added product: ${p.name} (₹${p.price})`,
          data: p
        })));
      }
      if (cartsArr.length > 0) {
        allActivities = allActivities.concat(cartsArr.map(c => ({
          type: 'cart_updated',
          timestamp: c.lastUpdated || c.updatedAt || new Date().toISOString(),
          email: c.userEmail || 'unknown',
          details: `Updated cart with ${c.totalItems || c.items?.length || 0} items`,
          data: c
        })));
      }
      // Separate admin users from regular users in activity logs
      const adminEmails = adminsArr.map(admin => admin.email);
      if (usersArr.length > 0) {
        allActivities = allActivities.concat(usersArr.map(u => ({
          type: 'user_registered',
          timestamp: u.createdAt || new Date().toISOString(),
          email: u.email || 'unknown',
          details: `User registered as ${adminEmails.includes(u.email) ? 'admin' : (u.role || 'buyer')}`,
          data: u
        })));
      }
      allActivities.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      setActivities(allActivities);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('AdminPanel fetch error details:', err);
      setUsers([]);
      setAdmins([]);
      setProducts([]);
      setCarts([]);
      setActivities([]);
      if (String(err.message).toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('adminKey');
        navigate('/admin/login');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(fetchAll, 5000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh]);

  const handleLogout = () => {
    localStorage.removeItem('adminKey');
    navigate('/admin/login');
  };

  const handleStockChange = (id, value) => {
    setStockUpdates(prev => ({ ...prev, [id]: value }));
  };

  const saveStock = async (id) => {
    const val = Number(stockUpdates[id]);
    if (Number.isNaN(val) || val < 0) {
      alert('Enter a valid non-negative number');
      return;
    }
    await safeJsonFetch(`http://localhost:5000/api/products/${id}/admin/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey || '' },
      body: JSON.stringify({ stock: val })
    });
    const next = { ...stockUpdates };
    delete next[id];
    setStockUpdates(next);
    fetchAll();
  };

  const saveAllStocks = async () => {
    const requests = [];
    for (const p of products) {
      const val = Number(stockUpdates[p._id]);
      if (Number.isNaN(val) || val < 0) {
        alert(`Invalid stock for ${p.name}`);
        return;
      }
      // Only send if changed
      if (val !== (typeof p.stock === 'number' ? p.stock : 0)) {
        requests.push(
          safeJsonFetch(`http://localhost:5000/api/products/${p._id}/admin/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey || '' },
            body: JSON.stringify({ stock: val })
          })
        );
      }
    }
    if (requests.length === 0) {
      alert('No stock changes to save');
      return;
    }
    await Promise.all(requests);
    fetchAll();
    alert('All stock changes saved');
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    await safeJsonFetch(`http://localhost:5000/api/users/${email}`, { method: 'DELETE', headers: authHeaders });
    fetchAll();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm(`Delete product ${id}?`)) return;
    await safeJsonFetch(`http://localhost:5000/api/products/${id}/admin`, { method: 'DELETE', headers: authHeaders });
    fetchAll();
  };

  const handleDeleteCart = async (email) => {
    if (!window.confirm(`Delete cart for ${email}?`)) return;
    await safeJsonFetch(`http://localhost:5000/api/cart/${email}`, { method: 'DELETE', headers: authHeaders });
    fetchAll();
  };

  const getUserProducts = (email) => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p.owner === email);
  };

  const getUserCart = (email) => {
    if (!Array.isArray(carts)) return null;
    return carts.find(c => c.userEmail === email);
  };

  const totalCartItems = carts.reduce((sum, c) => sum + (c.totalItems || (c.items?.length || 0)), 0);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Admin Panel</h2>
        <div style={styles.headerActions}>
          <button onClick={fetchAll} style={styles.primaryBtn}>Refresh</button>
          <button onClick={saveAllStocks} style={styles.primaryBtn}>Save All Stocks</button>
          <label style={styles.toggleLabel}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh
          </label>
          <button onClick={handleLogout} style={styles.dangerBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Regular Users</div>
          <div style={styles.kpiValue}>{users.length - admins.length}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Admin Users</div>
          <div style={styles.kpiValue}>{admins.length}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Total Products</div>
          <div style={styles.kpiValue}>{products.length}</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiTitle}>Items in Carts</div>
          <div style={styles.kpiValue}>{totalCartItems}</div>
        </div>
      </div>

      <div style={styles.updatedAt}>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</div>

      {loading ? <div>Loading...</div> : (
        <>
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
                  {admins.map((admin, idx) => (
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
                  {users
                    .filter(u => u.role !== 'admin') // Only non-admin users
                    .map((u, idx) => {
                      const userProducts = getUserProducts(u.email);
                      const userCart = getUserCart(u.email);
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
                  {products.map((p, idx) => (
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
                  {Array.isArray(carts) && carts.length > 0 ? carts.map((c, idx) => (
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
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No activities recorded yet</td>
                    </tr>
                  ) : (
                    activities.map((activity, index) => (
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
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 30px',
    minHeight: '80vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)'
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
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fff',
    border: '1px solid #e9ecef',
    padding: '6px 10px',
    borderRadius: '8px'
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
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#2c3e50',
    borderBottom: '1px solid #e9ecef',
    paddingBottom: '15px'
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    background: 'white'
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
  }
};

export default AdminPanel;

