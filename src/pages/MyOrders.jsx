import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div style={{ padding: 30 }}>Loading your orders...</div>;
  if (error) return <div style={{ padding: 30, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: 30 }}>
      <h2>Your Orders</h2>
      {orders.length === 0 ? (
        <div style={{ marginTop: 20 }}>You have no orders yet.</div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {orders.map(order => (
            <div key={order._id} style={styles.card}>
              <div style={styles.row}>
                <div>
                  <div style={{ fontWeight: 700 }}>Order ID: {order._id}</div>
                  <div style={{ color: '#666' }}>Placed: {new Date(order.createdAt || order.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>₹{order.totalAmount}</div>
                  <div style={{ color: '#666' }}>{order.orderStatus}</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <Link to={`/`} style={{ color: '#666' }}>View store</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    padding: 16,
    borderRadius: 10,
    boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
    marginBottom: 12,
    background: '#fff'
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};
