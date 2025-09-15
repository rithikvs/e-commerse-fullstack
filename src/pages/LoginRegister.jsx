import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginRegister({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'buyer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Google Client ID from environment variable
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, role: formData.role })
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || 'Invalid credentials');
      // Persist and update app state
      localStorage.setItem('currentUser', JSON.stringify(data));
      if (typeof onLogin === 'function') onLogin(data);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Check for user data in URL after Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('currentUser', JSON.stringify(userData));
        if (typeof onLogin === 'function') onLogin(userData);
        navigate('/');
      } catch (err) {
        console.error('Error parsing user data from URL', err);
      }
    }
  }, [location, navigate, onLogin]);
  
  // Handle Google login success
  const handleGoogleSuccess = (credentialResponse) => {
    // Redirect to backend Google auth route
    window.location.href = 'http://localhost:5000/api/auth/google';
  };
  
  // Handle Google login error
  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };
  
  return (
    <div style={styles.container}>
      <h2>{isLogin ? 'Login' : 'Register'} as {formData.role}</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form style={styles.form} onSubmit={isLogin ? handleLogin : handleRegister}>
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
        <select name="role" value={formData.role} onChange={handleChange} style={styles.input}>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
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
      
      <div style={styles.divider}>
        <span>OR</span>
      </div>
      
      <div style={styles.googleContainer}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_blue"
            text="continue_with"
            shape="rectangular"
            logo_alignment="center"
            width="100%"
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
}

const styles = {
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    color: '#666',
    textAlign: 'center',
  },
  googleContainer: {
    width: '100%',
    marginTop: '10px',
  },
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
  }
};

export default LoginRegister;
