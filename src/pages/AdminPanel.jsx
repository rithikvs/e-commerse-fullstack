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
  const [orders, setOrders] = useState([]);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  // Helper to get admin key (explicit localStorage key takes precedence)
  const getAdminKey = () => {
    try {
      const explicit = localStorage.getItem('adminKey');
      if (explicit) return explicit;
      const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return cu?.adminKey || '';
    } catch {
      return localStorage.getItem('adminKey') || '';
    }
  };

  const syncAllData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/sync/all', {
        headers: { 'x-admin-key': getAdminKey() }
      });
      
      if (!response.ok) throw new Error('Failed to sync data');
      
      const data = await response.json();
      setState({
        users: data.users || [],
        admins: data.admins || [],
        products: data.products || [],
        carts: data.carts || [],
        activities: generateActivities(data)
      });

      alert('Data synchronized successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      alert('Error syncing data: ' + error.message);
    }
  };

  // Update verifyAdmin function
  const verifyAdmin = async () => {
    try {
      const key = getAdminKey();
      if (!key) throw new Error('No admin credentials found');
      const response = await fetch('http://localhost:5000/api/auth/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key
        }
      });

      if (!response.ok) {
        throw new Error('Admin verification failed');
      }

      return true;
    } catch (error) {
      console.error('Admin verification error:', error);
      navigate('/admin/login');
      return false;
    }
  };

  // Add activity generation helper
  const generateActivities = (data) => {
    let activities = [];

    // Product activities
    data.products?.forEach(p => {
      activities.push({
        timestamp: p.createdAt,
        email: p.owner,
        type: 'product_added',
        details: `Added product: ${p.name} (₹${p.price})`
      });
    });

    // Cart activities
    data.carts?.forEach(c => {
      activities.push({
        timestamp: c.updatedAt || c.lastUpdated,
        email: c.userEmail,
        type: 'cart_updated',
        details: `Cart updated: ${c.items?.length || 0} items`
      });
    });

    // Sort by timestamp
    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Update loadAdminData function
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const key = getAdminKey();
      if (!key) throw new Error('No admin credentials found');
      const response = await fetch('http://localhost:5000/api/auth/sync/all', {
        headers: {
          'x-admin-key': key
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const data = await response.json();
      console.log('Fetched data:', data); // Debug log

      setState({
        users: data.users || [],
        admins: data.admins || [],
        products: data.products || [],
        carts: data.carts || [],
        activities: generateActivities(data)
      });

      // Update stock values
      const stocks = {};
      data.products?.forEach(p => {
        stocks[p._id] = p.stock || 0;
      });
      setStockUpdates(stocks);
      
      // Ensure orders are fetched and displayed after admin data loads
      await fetchOrders();

    } catch (error) {
      console.error('Admin data load error:', error);
      alert('Error loading admin data: ' + error.message);
      if (error.message.includes('credentials')) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/generate-report', {
        headers: { 'x-admin-key': getAdminKey() }
      });

      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      
      // Format report data as CSV
      const reportContent = `HANDMADE CRAFTS ADMIN REPORT
Generated on: ${new Date().toLocaleString()}

STATISTICS
==========
Total Users,${data.report.totalUsers}
Total Admins,${data.report.totalAdmins}
Total Products,${data.report.totalProducts}
Active Products,${data.report.activeProducts}
Pending Products,${data.report.pendingProducts}
Total Orders,${data.report.totalOrders}
Average Product Rating,${data.report.averageRating.toFixed(2)}
Active Carts,${data.report.totalCarts}

Generated by Admin Panel
`;

      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `admin_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report: ' + error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      const isValid = await verifyAdmin();
      if (isValid) {
        await loadAdminData();
      }
    };

    init();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleDeleteUser = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${email}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': getAdminKey() }
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
        headers: { 'x-admin-key': getAdminKey() }
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
        headers: { 'x-admin-key': getAdminKey() }
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
          'x-admin-key': getAdminKey()
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
          'x-admin-key': getAdminKey()
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
          'x-admin-key': getAdminKey()
        }
      });
      if (!response.ok) throw new Error('Failed to reject product');
      loadAdminData(); // Refresh data
      alert('Product rejected successfully');
    } catch (error) {
      alert('Error rejecting product: ' + error.message);
    }
  };

  // Robust fetchOrders: try protected /all endpoint, fallback to per-user aggregation
  // fetchOrders supports suppressLoading: when polling in background we don't want to toggle the loading UI
  const fetchOrders = async (suppressLoading = false) => {
    if (!suppressLoading) setLoading(true);
    try {
      const adminKey = getAdminKey();
      let data = [];

      // Try protected endpoint first
      try {
        const res = await fetch('http://localhost:5000/api/orders/all', {
          headers: adminKey ? { 'x-admin-key': adminKey } : {}
        });
        if (res.ok) {
          data = await res.json();
          console.log('Fetched orders from /orders/all:', Array.isArray(data) ? data.length : 0);
        } else {
          console.warn('Protected /orders/all returned', res.status, 'falling back to per-user fetch');
        }
      } catch (err) {
        console.warn('Error fetching /orders/all, will fallback to per-user:', err);
      }

      // Fallback: aggregate orders per user (public endpoint /orders/user/:email)
      if (!data || data.length === 0) {
        const usersToQuery = state.users && state.users.length ? state.users : [];
        const aggregated = [];
        for (const u of usersToQuery) {
          if (!u || !u.email) continue;
          try {
            const r = await fetch(`http://localhost:5000/api/orders/user/${encodeURIComponent(u.email)}`);
            if (r.ok) {
              const userOrders = await r.json();
              if (Array.isArray(userOrders) && userOrders.length) {
                aggregated.push(...userOrders);
              }
            }
          } catch (e) {
            console.warn('Error fetching orders for', u.email, e);
          }
        }

        // As an additional fallback, try fetching orders for currentUser if exists
        try {
          const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (cu?.email) {
            const r2 = await fetch(`http://localhost:5000/api/orders/user/${encodeURIComponent(cu.email)}`);
            if (r2.ok) {
              const curOrders = await r2.json();
              if (Array.isArray(curOrders) && curOrders.length) aggregated.push(...curOrders);
            }
          }
        } catch (e) {
          // ignore
        }

        // Deduplicate by order _id
        const dedup = {};
        aggregated.forEach(o => { if (o && o._id) dedup[o._id] = o; });
        data = Object.values(dedup);
        console.log('Aggregated orders from per-user endpoints:', data.length);
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      if (!suppressLoading) setLoading(false);
    }
  };

  // Flatten orders into rows (one per item)
  const buildRows = () => {
    const rows = [];
    orders.forEach(order => {
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';
      const total = order.totalAmount ?? '';
      const buyer = order.userEmail || (order.shippingDetails && order.shippingDetails.email) || '';
      const buyerName = order.shippingDetails?.fullName || '';
      if (Array.isArray(order.items) && order.items.length) {
        order.items.forEach(item => {
          rows.push({
            orderId: order._id,
            orderDate,
            buyer,
            buyerName,
            productId: item.productId || '',
            productName: item.name || '',
            qty: item.quantity || '',
            itemPrice: item.price || '',
            orderTotal: total,
            paymentMethod: order.paymentMethod || '',
            paymentStatus: order.paymentStatus || '',
            orderStatus: order.orderStatus || '',
            shippingAddress: order.shippingDetails?.address || '',
            shippingCity: order.shippingDetails?.city || '',
            shippingPostalCode: order.shippingDetails?.postalCode || ''
          });
        });
      } else {
        rows.push({
          orderId: order._id,
          orderDate,
          buyer,
          buyerName,
          productId: '',
          productName: '',
          qty: '',
          itemPrice: '',
          orderTotal: total,
          paymentMethod: order.paymentMethod || '',
          paymentStatus: order.paymentStatus || '',
          orderStatus: order.orderStatus || '',
          shippingAddress: order.shippingDetails?.address || '',
          shippingCity: order.shippingDetails?.city || '',
          shippingPostalCode: order.shippingDetails?.postalCode || ''
        });
      }
    });
    return rows;
  };

  // Build chart data: aggregate quantities per product grouped by orderStatus
  const buildChartData = () => {
    const agg = {}; // { productName: { placed: n, confirmed: n, shipped: n, delivered: n, total: n } }
    (orders || []).forEach(order => {
      const status = (order.orderStatus || 'placed').toLowerCase(); // normalize
      (order.items || []).forEach(item => {
        const name = item.name || item.productId || 'Unknown Product';
        const qty = Number(item.quantity) || 1;
        if (!agg[name]) agg[name] = { placed: 0, confirmed: 0, shipped: 0, delivered: 0, total: 0 };
        if (['placed','confirmed','shipped','delivered'].includes(status)) {
          agg[name][status] += qty;
        } else {
          agg[name].placed += qty;
        }
        agg[name].total += qty;
      });
    });
    const arr = Object.keys(agg).map(name => ({ name, ...agg[name] }));
    arr.sort((a,b) => b.total - a.total);
    return arr.slice(0, 12); // top 12 products by demand
  };

  // Chart colors per order status
  const statusOrder = ['placed','confirmed','shipped','delivered'];
  const statusColors = {
    placed: '#f6c23e',
    confirmed: '#1cc88a',
    shipped: '#36b9cc',
    delivered: '#4e73df'
  };

  // expose a refresh that also refetches orders
  const refreshAll = async () => {
    setLoading(true);
    await loadAdminData();
    await fetchOrders();
    setLoading(false);
  };

  const handleDownloadCSV = async () => {
    setExporting(true);
    try {
      const adminKey = getAdminKey();
       // Preferred: ask backend to export CSV
      const res = await fetch('http://localhost:5000/api/orders/export', {
        headers: { 'x-admin-key': adminKey }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders_report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
      // fallback: build CSV client-side
      const rows = buildRows();
      const headers = [
        'OrderID','OrderDate','UserEmail','BuyerName','ProductID','ProductName',
        'Quantity','ItemPrice','OrderTotal','PaymentMethod','PaymentStatus',
        'OrderStatus','ShippingAddress','ShippingCity','ShippingPostalCode'
      ];
      const escapeCell = (val) => {
        if (val === undefined || val === null) return '';
        const str = typeof val === 'string' ? val : String(val);
        if (/[,"\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
        return str;
      };
      let csv = headers.join(',') + '\n';
      for (const r of rows) {
        const row = [
          r.orderId, r.orderDate, r.buyer, r.buyerName, r.productId, r.productName,
          r.qty, r.itemPrice, r.orderTotal, r.paymentMethod, r.paymentStatus,
          r.orderStatus, r.shippingAddress, r.shippingCity, r.shippingPostalCode
        ].map(escapeCell);
        csv += row.join(',') + '\n';
      }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders_report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report. See console for details.');
    } finally {
      setExporting(false);
    }
  };

  const rows = buildRows();

  if (loading) {
    return <div style={styles.loadingContainer}>Loading admin panel...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={styles.heading}>Admin Panel</h2>
        <div style={styles.headerActions}>
          <button onClick={syncAllData} style={styles.primaryBtn}>Sync Data</button>
          <button onClick={refreshAll} style={styles.primaryBtn}>Refresh</button>
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

      {/* Orders demand chart - shows top products by ordered quantity (stacked by orderStatus) */}
      {orders.length > 0 && (() => {
        const chartData = buildChartData();
        if (!chartData || chartData.length === 0) return null;
        const maxTotal = Math.max(...chartData.map(d => d.total), 1);
        const chartWidth = 900; // px
        const barHeight = 22;
        const gap = 12;
        return (
          <section style={{ ...styles.section, paddingBottom: 12 }}>
            <h3 style={styles.sectionTitle}>Top Products by Demand</h3>
            {/* Only show the compact description — legend removed to display only the graph */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#555' }}>
                Showing products with highest ordered quantities (stacked by order status).
              </div>
            </div>

            <div style={{ overflowX: 'auto', padding: '6px 0' }}>
              <svg width={Math.min(chartWidth, 1000)} height={(barHeight + gap) * chartData.length} role="img" aria-label="Top product demand chart">
                {chartData.map((d, i) => {
                  let x = 0;
                  const y = i * (barHeight + gap);
                  return (
                    <g key={d.name} transform={`translate(0, ${y})`}>
                      {/* product label */}
                      <text x={0} y={barHeight/2} dy="0.35em" style={{ fontSize: 12, fill: '#2c3e50' }}>
                        {d.name.length > 36 ? d.name.slice(0,33) + '…' : d.name}
                      </text>
                      {/* stacked bar */}
                      <g transform={`translate(220, 0)`}>
                        {statusOrder.map(s => {
                          const val = Number(d[s] || 0);
                          const w = (val / maxTotal) * (Math.min(chartWidth, 1000) - 240);
                          const rect = (
                            <rect key={s}
                              x={x}
                              y={0}
                              width={w}
                              height={barHeight}
                              fill={statusColors[s]}
                              rx={4}
                            />
                          );
                          x += w;
                          return rect;
                        })}
                        {/* total label */}
                        <text x={Math.max(0, x) + 8} y={barHeight/2} dy="0.35em" style={{ fontSize: 12, fill: '#333' }}>
                          {d.total}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>
        );
      })()}

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>Admin Panel — Orders Report</h3>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <strong>Total orders:</strong> {orders.length} &nbsp; | &nbsp;
            <strong>Report rows:</strong> {rows.length}
          </div>
          <div>
            <button
              onClick={handleDownloadCSV}
              disabled={exporting || loading}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: '#2c7be5',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {exporting ? 'Preparing...' : 'Download CSV'}
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '50vh', overflow: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#fafafa' }}>
              <tr>
                <th style={th}>Order ID</th>
                <th style={th}>Date / Time</th>
                <th style={th}>User Email</th>
                <th style={th}>Buyer Name</th>
                <th style={th}>Product</th>
                <th style={th}>Qty</th>
                <th style={th}>Item Price</th>
                <th style={th}>Order Total</th>
                <th style={th}>Payment</th>
                <th style={th}>Payment Status</th>
                <th style={th}>Order Status</th>
                <th style={th}>Shipping City</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ padding: 16, textAlign: 'center' }}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: 16, textAlign: 'center' }}>No orders found</td></tr>
              ) : rows.map((r, idx) => (
                <tr key={idx} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={td}>{r.orderId}</td>
                  <td style={td}>{r.orderDate}</td>
                  <td style={td}>{r.buyer}</td>
                  <td style={td}>{r.buyerName}</td>
                  <td style={td}>{r.productName}</td>
                  <td style={td}>{r.qty}</td>
                  <td style={td}>{r.itemPrice}</td>
                  <td style={td}>{r.orderTotal}</td>
                  <td style={td}>{r.paymentMethod}</td>
                  <td style={td}>{r.paymentStatus}</td>
                  <td style={td}>{r.orderStatus}</td>
                  <td style={td}>{r.shippingCity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
        <h3 style={styles.sectionTitle}>Pending Products to verify</h3>
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

const th = { padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e6e6e6', fontWeight: 700 };
const td = { padding: '8px 12px', textAlign: 'left', verticalAlign: 'top' };

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
    padding: '10px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9em',
    transition: 'background-color 0.2s'
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
    minWidth: '1200px' // Increased minimum width
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
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#2c3e50'
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }
};

export default AdminPanel;
