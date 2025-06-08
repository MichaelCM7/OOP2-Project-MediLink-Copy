import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    userType: 'patient' // 'patient', 'doctor', 'admin'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);

  // Get redirect path from URL params or default based on user type
  const redirectTo = location.state?.from?.pathname || getDefaultRedirect();

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      navigate(getDefaultRedirect(), { replace: true });
    }

    // Check if there's a success message from registration
    if (location.state?.message) {
      setSuccess(location.state.message);
    }

    // Load saved email if "remember me" was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }

    // Check for account lockout
    checkLockoutStatus();
  }, [user, navigate, location]);

  const getDefaultRedirect = () => {
    switch (formData.userType) {
      case 'doctor':
        return '/doctor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  const checkLockoutStatus = () => {
    const lockoutData = localStorage.getItem('loginLockout');
    if (lockoutData) {
      const { attempts, timestamp } = JSON.parse(lockoutData);
      const now = new Date().getTime();
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (attempts >= 5 && (now - timestamp) < lockoutDuration) {
        setIsLocked(true);
        setLockoutTime(new Date(timestamp + lockoutDuration));
        setLoginAttempts(attempts);
      } else if ((now - timestamp) >= lockoutDuration) {
        // Lockout expired, reset
        localStorage.removeItem('loginLockout');
        setIsLocked(false);
        setLoginAttempts(0);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  };

  const handleLockout = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);

    if (newAttempts >= 5) {
      const lockoutData = {
        attempts: newAttempts,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('loginLockout', JSON.stringify(lockoutData));
      setIsLocked(true);
      setLockoutTime(new Date(Date.now() + 15 * 60 * 1000));
      setError('Too many failed login attempts. Account locked for 15 minutes.');
    } else {
      const remainingAttempts = 5 - newAttempts;
      setError(`Invalid credentials. ${remainingAttempts} attempts remaining before lockout.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Account is locked. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      setLoading(false);
      return;
    }

    try {
      const loginData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        userType: formData.userType
      };

      const response = await authService.login(loginData);
      
      // Clear lockout data on successful login
      localStorage.removeItem('loginLockout');
      setLoginAttempts(0);
      setIsLocked(false);

      // Handle "Remember Me"
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Login through context
      await login(response.data.token, response.data.user);

      // Show success message
      setSuccess('Login successful! Redirecting...');

      // Redirect to appropriate dashboard
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000);

    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        handleLockout();
      } else if (err.response?.status === 423) {
        setError('Account is locked. Please contact support or try again later.');
      } else if (err.response?.status === 403) {
        setError('Account not verified. Please check your email for verification link.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      setError('');

      // Redirect to social auth provider
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}?userType=${formData.userType}`;
    } catch (err) {
      setError(`${provider} login failed. Please try again.`);
      setLoading(false);
    }
  };

  const formatLockoutTime = (time) => {
    if (!time) return '';
    const now = new Date();
    const diff = time - now;
    const minutes = Math.ceil(diff / (1000 * 60));
    return minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : 'shortly';
  };

  if (loading && !formData.email) return <LoadingSpinner />;

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <h1>Medi-Link</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your healthcare dashboard</p>
        </div>

        {/* User Type Selector */}
        <div className="user-type-selector">
          <button
            type="button"
            className={`type-btn ${formData.userType === 'patient' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, userType: 'patient' }))}
          >
            <span className="type-icon">👤</span>
            <span>Patient</span>
          </button>
          <button
            type="button"
            className={`type-btn ${formData.userType === 'doctor' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, userType: 'doctor' }))}
          >
            <span className="type-icon">👨‍⚕️</span>
            <span>Doctor</span>
          </button>
          <button
            type="button"
            className={`type-btn ${formData.userType === 'admin' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, userType: 'admin' }))}
          >
            <span className="type-icon">⚙️</span>
            <span>Admin</span>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        {isLocked && (
          <div className="lockout-message">
            <span className="lockout-icon">🔒</span>
            <div className="lockout-content">
              <strong>Account Temporarily Locked</strong>
              <p>
                Due to multiple failed login attempts, your account has been locked.
                Please try again in {formatLockoutTime(lockoutTime)}.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                disabled={isLocked}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={isLocked}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLocked}
              />
              <span className="checkbox-custom"></span>
              <span>Remember me</span>
            </label>

            <Link to="/forgot-password" className="forgot-password-link">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading || isLocked}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing In...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="btn-icon">→</span>
              </>
            )}
          </button>
        </form>

        {/* Social Login */}
        <div className="social-login">
          <div className="divider">
            <span>Or continue with</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-btn google"
              onClick={() => handleSocialLogin('google')}
              disabled={loading || isLocked}
            >
              <span className="social-icon">🔵</span>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="social-btn facebook"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading || isLocked}
            >
              <span className="social-icon">📘</span>
              <span>Facebook</span>
            </button>

            <button
              type="button"
              className="social-btn apple"
              onClick={() => handleSocialLogin('apple')}
              disabled={loading || isLocked}
            >
              <span className="social-icon">🍎</span>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="security-info">
          <div className="security-item">
            <span className="security-icon">🔒</span>
            <span>Your data is encrypted and secure</span>
          </div>
          <div className="security-item">
            <span className="security-icon">🛡️</span>
            <span>HIPAA compliant platform</span>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="signup-link">
          <p>
            Don't have an account?{' '}
            <Link 
              to={`/signup?type=${formData.userType}`}
              className="signup-btn"
            >
              Sign Up
            </Link>
          </p>
        </div>

        {/* Help Links */}
        <div className="help-links">
          <Link to="/help" className="help-link">Help Center</Link>
          <span className="separator">•</span>
          <Link to="/contact" className="help-link">Contact Support</Link>
          <span className="separator">•</span>
          <Link to="/privacy" className="help-link">Privacy Policy</Link>
        </div>

        {/* Emergency Access */}
        <div className="emergency-access">
          <p className="emergency-text">
            <span className="emergency-icon">🚨</span>
            Medical Emergency?
          </p>
          <button
            type="button"
            className="emergency-btn"
            onClick={() => navigate('/emergency')}
          >
            Emergency Alert System
          </button>
        </div>
      </div>

      {/* Background Elements */}
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
};

export default LoginForm;