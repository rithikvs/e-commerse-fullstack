import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Please fill in all fields');
      }

      console.log('Login attempt:', formData);
      
      localStorage.setItem('currentUser', JSON.stringify({
        email: formData.email,
        name: 'User'
      }));
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Enhanced Left side with particles */}
      <div style={styles.imageSection}>
        <div style={styles.particleContainer}>
          <div style={styles.particle1}></div>
          <div style={styles.particle2}></div>
          <div style={styles.particle3}></div>
          <div style={styles.particle4}></div>
          <div style={styles.particle5}></div>
        </div>
        <div style={styles.imageOverlay}>
          <div style={styles.imageContent}>
            <div style={styles.logoContainer}>
              <div style={styles.logo}>🎓</div>
            </div>
            <h1 style={styles.welcomeTitle}>Welcome Back</h1>
            <p style={styles.welcomeText}>
              Sign in to continue your journey with us and unlock amazing features
            </p>
            <div style={styles.statsContainer}>
              <div style={styles.stat}>
                <div style={styles.statNumber}>10K+</div>
                <div style={styles.statLabel}>Students</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>500+</div>
                <div style={styles.statLabel}>Courses</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statNumber}>50+</div>
                <div style={styles.statLabel}>Faculty</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Right side form */}
      <div style={styles.formSection}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <div style={styles.titleContainer}>
              <h2 style={styles.title}>Kengu Engineering College</h2>
              <div style={styles.titleUnderline}></div>
            </div>
            <h3 style={styles.subtitle}>Sign In</h3>
            <p style={styles.description}>
              Hey, Enter your details to get sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorMessage}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📧</span>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your @kengu.ac.in email"
                style={styles.input}
                className="enhanced-input"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span>
                Password
              </label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  style={styles.passwordInput}
                  className="enhanced-input"
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

            <div style={styles.optionsContainer}>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  style={styles.checkbox}
                />
                <label htmlFor="showPassword" style={styles.checkboxLabel}>
                  Show Password
                </label>
              </div>
              <a href="#" style={styles.forgotPassword}>Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.loginButton,
                opacity: isLoading ? 0.8 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              className="enhanced-button"
            >
              {isLoading ? (
                <span style={styles.loadingContent}>
                  <span style={styles.spinner}></span>
                  Signing In...
                </span>
              ) : (
                <span style={styles.buttonContent}>
                  <span>🚀</span>
                  Login
                </span>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>or continue with</span>
          </div>

          <div style={styles.socialButtons}>
            <button style={styles.socialButton} type="button">
              <span style={styles.socialIcon}>🔵</span>
              Facebook
            </button>
            <button style={styles.socialButton} type="button">
              <span style={styles.socialIcon}>🔴</span>
              Google
            </button>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/signup" style={styles.signupLink}>
                Sign Up Here
              </Link>
            </p>
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
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  imageSection: {
    flex: 1,
    background: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  particle1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    animation: 'float 6s ease-in-out infinite'
  },
  particle2: {
    position: 'absolute',
    top: '70%',
    right: '15%',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    animation: 'float 4s ease-in-out infinite reverse'
  },
  particle3: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.12)',
    animation: 'float 5s ease-in-out infinite'
  },
  particle4: {
    position: 'absolute',
    top: '40%',
    right: '30%',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.15)',
    animation: 'float 3s ease-in-out infinite reverse'
  },
  particle5: {
    position: 'absolute',
    top: '60%',
    left: '40%',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.06)',
    animation: 'float 7s ease-in-out infinite'
  },
  imageOverlay: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    color: 'white',
    padding: '2rem'
  },
  imageContent: {
    maxWidth: '500px'
  },
  logoContainer: {
    marginBottom: '2rem'
  },
  logo: {
    fontSize: '4rem',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    width: '120px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  welcomeTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '1.5rem',
    background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    animation: 'glow 2s ease-in-out infinite alternate'
  },
  welcomeText: {
    fontSize: '1.3rem',
    fontWeight: '300',
    opacity: 0.95,
    lineHeight: '1.6',
    marginBottom: '3rem'
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '2rem'
  },
  stat: {
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  statLabel: {
    fontSize: '0.95rem',
    opacity: 0.8
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
    padding: '3.5rem',
    borderRadius: '28px',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.12)',
    width: '100%',
    maxWidth: '480px',
    border: '1px solid rgba(255, 255, 255, 0.4)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem'
  },
  titleContainer: {
    position: 'relative',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '0.5rem'
  },
  titleUnderline: {
    width: '60px',
    height: '3px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    margin: '0 auto',
    borderRadius: '2px'
  },
  subtitle: {
    fontSize: '2.2rem',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  description: {
    fontSize: '1rem',
    color: '#718096',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.8rem'
  },
  errorMessage: {
    background: 'linear-gradient(135deg, #fed7d7, #feb2b2)',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    textAlign: 'center',
    border: '1px solid #feb2b2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  errorIcon: {
    fontSize: '1.2rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#4a5568',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  labelIcon: {
    fontSize: '1rem'
  },
  input: {
    padding: '1.3rem',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: 'rgba(248, 250, 252, 0.8)',
    backdropFilter: 'blur(10px)'
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordInput: {
    padding: '1.3rem',
    paddingRight: '3.5rem',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    background: 'rgba(248, 250, 252, 0.8)',
    backdropFilter: 'blur(10px)',
    width: '100%',
    boxSizing: 'border-box'
  },
  passwordToggle: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.3rem',
    color: '#718096',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  optionsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#667eea'
  },
  checkboxLabel: {
    fontSize: '0.9rem',
    color: '#4a5568',
    cursor: 'pointer'
  },
  forgotPassword: {
    fontSize: '0.9rem',
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },
  loginButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1.4rem',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
    marginTop: '0.5rem'
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem'
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  divider: {
    textAlign: 'center',
    margin: '2rem 0',
    position: 'relative'
  },
  dividerText: {
    background: 'white',
    color: '#718096',
    padding: '0 1rem',
    fontSize: '0.9rem',
    position: 'relative',
    zIndex: 1
  },
  socialButtons: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem'
  },
  socialButton: {
    flex: 1,
    padding: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: 'white',
    color: '#4a5568',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  socialIcon: {
    fontSize: '1.2rem'
  },
  footer: {
    textAlign: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid #e2e8f0'
  },
  footerText: {
    fontSize: '0.95rem',
    color: '#718096'
  },
  signupLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  }
};

// Enhanced CSS animations
const enhancedStyleSheet = document.createElement('style');
enhancedStyleSheet.innerHTML = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
  }
  @keyframes glow {
    0% { text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    100% { text-shadow: 2px 2px 20px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.3); }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .enhanced-input:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
    transform: translateY(-2px);
  }
  .enhanced-button:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4) !important;
  }
  .social-button:hover {
    border-color: #667eea !important;
    background: #f8fafc !important;
    transform: translateY(-2px);
  }
  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e2e8f0;
    z-index: 0;
  }
`;
document.head.appendChild(enhancedStyleSheet);

export default Login;
