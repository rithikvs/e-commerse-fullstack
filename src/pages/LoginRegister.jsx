import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginRegister({ onLogin }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const safeJson = async (res) => {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { message: text }; }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Registration failed');
      alert('Registration successful! Please login.');
      setIsLogin(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = userType === 'admin' 
        ? 'http://localhost:5000/api/auth/admin/login'
        : 'http://localhost:5000/api/auth/login';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password 
        })
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Invalid credentials');

      // Store user/admin data
      const userData = {
        ...data,
        isAdmin: userType === 'admin',
        adminKey: data.adminKey
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      if (typeof onLogin === 'function') onLogin(userData);
      
      // Redirect admins to admin panel, regular users to home
      navigate(userType === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      {error && <div style={styles.error}>{error}</div>}
      
      <form style={styles.form} onSubmit={isLogin ? handleLogin : handleRegister}>
        {/* Login Type Selection */}
        {isLogin && (
          <div style={styles.loginTypeContainer}>
            <button
              type="button"
              style={{
                ...styles.loginTypeBtn,
                ...(userType === 'user' ? styles.activeLoginType : {})
              }}
              onClick={() => setUserType('user')}
            >
              User Login
            </button>
            <button
              type="button"
              style={{
                ...styles.loginTypeBtn,
                ...(userType === 'admin' ? styles.activeLoginType : {})
              }}
              onClick={() => setUserType('admin')}
            >
              Admin Login
            </button>
          </div>
        )}

        {!isLogin && (
          <input
            name="username"
            placeholder="Username"
            style={styles.input}
            value={formData.username}
            onChange={handleChange}
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          style={styles.input}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          style={styles.input}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="button" style={styles.button} disabled={loading}>
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      <p>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <span style={styles.toggle} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? 'Register here' : 'Login here'}
        </span>
      </p>
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
  form: {
    display: 'inline-block',
    textAlign: 'left',
    maxWidth: '450px',
    width: '100%',
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  input: {
    width: '100%',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '25px',
    border: '2px solid #e9ecef',
    fontSize: '1em',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '15px 30px',
    width: '100%',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: '600',
    transition: 'none',
    boxShadow: 'none'
  },
  toggle: {
    color: '#3498db',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline'
  },
  error: {
    background: '#fdecea',
    color: '#b00020',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '14px',
    display: 'inline-block'
  },
  loginTypeContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center'
  },
  loginTypeBtn: {
    padding: '10px 20px',
    borderRadius: '20px',
    border: '2px solid #3498db',
    background: 'transparent',
    color: '#3498db',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s'
  },
  activeLoginType: {
    background: '#3498db',
    color: 'white'
  }
};

export default LoginRegister;
