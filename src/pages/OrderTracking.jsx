import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OrderProgress from '../components/OrderProgress';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}>Loading order tracking...</div>;
  if (error) return <div style={{ padding: 40, color: 'red' }}>Error: {error}</div>;
  if (!order) return <div style={{ padding: 40 }}>No order data.</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Order Tracking</h2>
      <div style={styles.card}>
        <div style={styles.summary}>
          <div><strong>Order ID:</strong> {order._id}</div>
          <div><strong>Placed:</strong> {new Date(order.createdAt || order.createdAt).toLocaleString()}</div>
          <div><strong>Status:</strong> {order.orderStatus}</div>
          <div><strong>Recipient:</strong> {order.shippingDetails?.fullName || order.userEmail}</div>
        </div>

        <OrderProgress currentStatus={order.orderStatus} statusHistory={order.statusHistory || []} />

        <div style={styles.items}>
          <h4 style={{ marginTop: 10 }}>Items</h4>
          {(order.items || []).map((it, idx) => (
            <div key={idx} style={styles.itemRow}>
              <div style={{ fontWeight: 700 }}>{it.name}</div>
              <div>Qty: {it.quantity}</div>
              <div>₹{it.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 30 },
  title: { textAlign: 'center', marginBottom: 20 },
  card: { maxWidth: 900, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' },
  summary: { display: 'flex', gap: 20, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  items: { marginTop: 10 },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f1f1' }
};
