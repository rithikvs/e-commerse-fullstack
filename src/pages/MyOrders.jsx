import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user || !user.email) {
      setError('You must be logged in to view your orders');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/orders/user/${encodeURIComponent(user.email)}`);
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        setError(err.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleDetails = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const reorder = async (order) => {
    // merge items into local cart and navigate to cart
    try {
      const existing = JSON.parse(localStorage.getItem('cartItems') || '[]');
      // Build a map by productId to sum quantities
      const map = new Map();
      const pushToMap = (it) => {
        const id = it.productId || it._id || it.id || JSON.stringify(it.name);
        const key = String(id);
        const prev = map.get(key) || { ...it, quantity: 0 };
        prev.productId = it.productId || prev.productId;
        prev.name = it.name || prev.name;
        prev.price = it.price || prev.price;
        prev.material = it.material || prev.material;
        prev.image = it.image || prev.image;
        prev.quantity = (Number(prev.quantity) || 0) + (Number(it.quantity) || 1);
        map.set(key, prev);
      };

      existing.forEach(pushToMap);
      (order.items || []).forEach(i => pushToMap({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity || 1, material: i.material || '', image: i.image }));

      // For any merged item missing an image but having a productId, try to fetch product details
      const merged = Array.from(map.values());
      await Promise.all(merged.map(async (it) => {
        if ((!it.image || it.image === '') && it.productId) {
          try {
            const res = await fetch(`http://localhost:5000/api/products/${it.productId}`);
            if (res.ok) {
              const p = await res.json();
              if (p && p.image) it.image = p.image;
            }
          } catch (err) {
            // ignore fetch errors, image will be undefined
            console.warn('Could not fetch product image for reorder', it.productId, err);
          }
        }
      }));

      localStorage.setItem('cartItems', JSON.stringify(merged));
      // dispatch event so App can pick up the change
      try { window.dispatchEvent(new CustomEvent('cart-updated', { detail: merged })); } catch (e) { /* ignore */ }
      alert('Items added to your cart.');
      navigate('/cart');
    } catch (err) {
      console.error('Reorder error', err);
      alert('Could not add items to cart.');
    }
  };

  if (loading) return <div style={{ padding: 30 }}>Loading your orders...</div>;
  if (error) return <div style={{ padding: 30, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Your Orders</h2>
        <Link to="/" style={styles.smallLink}>Back to store</Link>
      </div>

      {orders.length === 0 ? (
        <div style={styles.empty}>You have no orders yet.</div>
      ) : (
        <div style={styles.list}>
          {orders.map(order => (
            <div key={order._id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.orderId}>Order #{String(order._id).slice(-8)}</div>
                  <div style={styles.muted}>Placed: {new Date(order.createdAt || order.createdAt).toLocaleString()}</div>
                </div>

                <div style={styles.rightCol}>
                  <div style={styles.amount}>₹{Number(order.totalAmount).toFixed(2)}</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ ...styles.badge, ...statusStyle(order.orderStatus) }}>{order.orderStatus}</span>
                  </div>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button style={styles.primaryBtn} onClick={() => reorder(order)}>Reorder</button>
                <button style={styles.ghostBtn} onClick={() => toggleDetails(order._id)}>
                  {expanded[order._id] ? 'Hide details' : 'Details'}
                </button>
                <Link to="/" style={{ ...styles.ghostBtn, textDecoration: 'none' }}>View store</Link>
              </div>

              {expanded[order._id] && (
                <div style={styles.details}>
                  <div style={styles.detailsRow}>
                    <div style={styles.detailsCol}>
                      <div style={styles.detailsTitle}>Items</div>
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} style={styles.itemRow}>
                          <div style={{ fontWeight: 700 }}>{it.name}</div>
                          <div>Qty: {it.quantity}</div>
                          <div>₹{it.price}</div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.detailsCol}>
                      <div style={styles.detailsTitle}>Shipping</div>
                      <div>{order.shippingDetails?.fullName}</div>
                      <div>{order.shippingDetails?.address}</div>
                      <div>{order.shippingDetails?.city} {order.shippingDetails?.postalCode}</div>
                      <div style={{ marginTop: 10 }}><strong>Payment:</strong> {order.paymentMethod} — {order.paymentStatus}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const statusStyle = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'placed': return { background: '#f1c40f', color: '#2c3e50' };
    case 'confirmed': return { background: '#3498db', color: 'white' };
    case 'shipped': return { background: '#9b59b6', color: 'white' };
    case 'delivered': return { background: '#27ae60', color: 'white' };
    default: return { background: '#bdc3c7', color: '#2c3e50' };
  }
};

const styles = {
  page: { padding: 28, maxWidth: 1100, margin: '0 auto' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { margin: 0 },
  smallLink: { color: '#666', textDecoration: 'none' },
  empty: { padding: 40, textAlign: 'center', color: '#666' },
  list: { display: 'grid', gap: 16 },
  card: { background: '#fff', padding: 18, borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: 800, fontSize: 16 },
  muted: { color: '#7f8c8d', fontSize: 13 },
  rightCol: { textAlign: 'right' },
  amount: { fontWeight: 800, fontSize: 18 },
  badge: { padding: '6px 10px', borderRadius: 20, fontWeight: 700, fontSize: 12 },
  cardActions: { marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' },
  primaryBtn: { background: '#2ecc71', color: 'white', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 },
  ghostBtn: { background: 'transparent', border: '1px solid #e0e0e0', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', color: '#333' },
  details: { marginTop: 14, padding: 12, borderRadius: 8, background: '#fbfbfb' },
  detailsRow: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  detailsCol: { flex: 1, minWidth: 220 },
  detailsTitle: { fontWeight: 800, marginBottom: 8 },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #eee' }
};
