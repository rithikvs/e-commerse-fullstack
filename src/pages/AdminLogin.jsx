import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const doLogin = async (url) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const contentType = res.headers.get('content-type') || '';
    let data = {};
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    }
    if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let data;
      try {
        data = await doLogin('http://localhost:5000/api/auth/admin/login');
      } catch (err) {
        // fallback
        data = await doLogin('http://localhost:5000/api/admin/login');
      }
      localStorage.setItem('adminKey', data.adminKey);
      // Mark currentUser as admin so the SPA UI switches to admin-only mode
      const adminUser = {
        email: data.email || (data.admin && data.admin.email) || '',
        username: data.username || (data.admin && data.admin.username) || 'admin',
        isAdmin: true,
        adminKey: data.adminKey
      };
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{marginBottom: '20px'}}>Admin Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button className="button" style={styles.button} type="submit">Login</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 30px',
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)'
  },
  form: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px'
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    background: '#fdecea',
    color: '#b00020',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px'
  }
};

export default AdminLogin;
