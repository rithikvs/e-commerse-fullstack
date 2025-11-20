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
  const [userType, setUserType] = useState('user');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
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
      const res = await fetch('https://e-commerse-fullstack-1.onrender.com/api/auth/register', {
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
        ? 'https://e-commerse-fullstack-1.onrender.com/api/auth/admin/login'
        : 'https://e-commerse-fullstack-1.onrender.com/api/auth/login';

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

      const userData = {
        ...data,
        isAdmin: userType === 'admin',
        adminKey: data.adminKey
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      if (typeof onLogin === 'function') onLogin(userData);
      
      navigate(userType === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background Section */}
      <div style={styles.backgroundSection}>
        <div style={styles.animatedBackground}>
          <div style={styles.floatingElement1}></div>
          <div style={styles.floatingElement2}></div>
          <div style={styles.floatingElement3}></div>
          <div style={styles.floatingElement4}></div>
        </div>
        <div style={styles.backgroundOverlay}>
          <div style={styles.backgroundContent}>
            <h1 style={styles.brandTitle}>
              {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
            </h1>
            <p style={styles.brandSubtitle}>
              {isLogin 
                ? 'Continue your journey with our amazing platform' 
                : 'Create your account and start exploring endless possibilities'
              }
            </p>
            <div style={styles.brandFeatures}>
              <div style={styles.feature}>✨ Secure & Reliable</div>
              <div style={styles.feature}>🚀 Fast & Efficient</div>
              <div style={styles.feature}>💎 Premium Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div style={styles.formSection}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <h2 style={styles.formTitle}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={styles.formDescription}>
              {isLogin 
                ? 'Enter your credentials to access your account'
                : 'Fill in your details to create a new account'
              }
            </p>
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}
          
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
                  👤 User Login
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.loginTypeBtn,
                    ...(userType === 'admin' ? styles.activeLoginType : {})
                  }}
                  onClick={() => setUserType('admin')}
                >
                  🔐 Admin Login
                </button>
              </div>
            )}

            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <input
                  name="username"
                  placeholder="Choose a username"
                  style={styles.input}
                  className="enhanced-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email address"
                style={styles.input}
                className="enhanced-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  style={styles.passwordInput}
                  className="enhanced-input"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }} 
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingText}>
                  <span style={styles.spinner}></span>
                  Processing...
                </span>
              ) : (
                isLogin ? '🚀 Sign In' : '✨ Create Account'
              )}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              style={styles.toggleButton}
              onClick={() => { 
                setIsLogin(!isLogin); 
                setError(''); 
                setFormData({ username: '', email: '', password: '' });
              }}
            >
              {isLogin ? '📝 Create new account' : '🔑 Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden'
  },
  backgroundSection: {
    flex: 1,
    position: 'relative',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  floatingElement1: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    animation: 'float1 6s ease-in-out infinite'
  },
  floatingElement2: {
    position: 'absolute',
    top: '60%',
    right: '20%',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.15)',
    animation: 'float2 4s ease-in-out infinite'
  },
  floatingElement3: {
    position: 'absolute',
    bottom: '25%',
    left: '25%',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    animation: 'float3 5s ease-in-out infinite'
  },
  floatingElement4: {
    position: 'absolute',
    top: '40%',
    right: '35%',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.12)',
    animation: 'float4 7s ease-in-out infinite'
  },
  backgroundOverlay: {
    position: 'relative',
    zIndex: 2,
    padding: '2rem',
    textAlign: 'center'
  },
  backgroundContent: {
    color: 'white'
  },
  brandTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '1.5rem',
    background: 'linear-gradient(45deg, #ffffff, #f0f8ff, #e6f3ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    animation: 'titleGlow 3s ease-in-out infinite alternate'
  },
  brandSubtitle: {
    fontSize: '1.3rem',
    opacity: 0.9,
    marginBottom: '2rem',
    maxWidth: '450px',
    lineHeight: '1.6'
  },
  brandFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center'
  },
  feature: {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '0.8rem 1.5rem',
    borderRadius: '25px',
    backdropFilter: 'blur(10px)',
    fontSize: '1.1rem',
    fontWeight: '500'
  },
  formSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '2rem'
  },
  formContainer: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)',
    width: '100%',
    maxWidth: '460px',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  formTitle: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '0.8rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  formDescription: {
    fontSize: '1rem',
    color: '#718096',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  loginTypeContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    background: '#f7fafc',
    padding: '0.5rem',
    borderRadius: '16px'
  },
  loginTypeBtn: {
    flex: 1,
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    color: '#4a5568',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease'
  },
  activeLoginType: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transform: 'translateY(-2px)'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4a5568'
  },
  input: {
    padding: '1.2rem',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: 'rgba(248, 250, 252, 0.8)',
    backdropFilter: 'blur(10px)',
    color: 'black' // ensure typed text is black
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordInput: {
    padding: '1.2rem',
    paddingRight: '3.5rem',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: 'rgba(248, 250, 252, 0.8)',
    backdropFilter: 'blur(10px)',
    width: '100%',
    boxSizing: 'border-box',
    color: 'black' // ensure typed password text is black
  },
  passwordToggle: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    color: '#718096',
    padding: '0.5rem'
  },
  submitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1.3rem',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    marginTop: '1rem'
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorMessage: {
    background: 'linear-gradient(135deg, #fed7d7, #feb2b2)',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    textAlign: 'center',
    border: '1px solid #feb2b2',
    marginBottom: '1rem'
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e2e8f0'
  },
  footerText: {
    fontSize: '0.95rem',
    color: '#718096',
    marginBottom: '1rem'
  },
  toggleButton: {
    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
    color: 'white',
    padding: '0.8rem 2rem',
    border: 'none',
    borderRadius: '25px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
  }
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  @keyframes float1 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(-8deg); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-25px) rotate(5deg); }
  }
  @keyframes float4 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-18px) rotate(-12deg); }
  }
  @keyframes titleGlow {
    0% { text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    100% { text-shadow: 2px 2px 20px rgba(255,255,255,0.4); }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Force typed text & autofill text to be black; placeholder subtle */
  .enhanced-input {
    color: #000 !important;
    -webkit-text-fill-color: #000 !important;
  }
  .enhanced-input::placeholder {
    color: rgba(0,0,0,0.45) !important;
  }
  input.enhanced-input:-webkit-autofill,
  input.enhanced-input:-webkit-autofill:focus,
  input.enhanced-input:-webkit-autofill:hover,
  input.enhanced-input:-internal-autofill-selected {
    -webkit-text-fill-color: #000 !important;
    box-shadow: 0 0 0px 1000px rgba(248,250,252,0.8) inset !important;
  }
`;
document.head.appendChild(styleSheet);

export default LoginRegister;

