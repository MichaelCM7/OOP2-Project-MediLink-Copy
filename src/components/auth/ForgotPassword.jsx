import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: Verify Code, 3: Reset Password
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
    userType: 'patient'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      navigate('/dashboard', { replace: true });
    }

    // Get email from URL params if coming from login page
    const urlParams = new URLSearchParams(location.search);
    const emailFromUrl = urlParams.get('email');
    const userTypeFromUrl = urlParams.get('type');
    
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: emailFromUrl }));
    }
    if (userTypeFromUrl && ['patient', 'doctor', 'admin'].includes(userTypeFromUrl)) {
      setFormData(prev => ({ ...prev, userType: userTypeFromUrl }));
    }

    // Start resend timer if on verification step
    if (currentStep === 2 && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, navigate, location, currentStep, resendTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (error) {
      setError('');
    }

    // Check password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const getPasswordStrengthLabel = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
      case 6:
        return 'Strong';
      default:
        return 'Very Weak';
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.requestPasswordReset({
        email: formData.email.toLowerCase().trim(),
        userType: formData.userType
      });

      setResetToken(response.data.resetToken);
      setSuccess('Password reset code sent to your email. Please check your inbox and spam folder.');
      setCurrentStep(2);
      setResendTimer(60); // 60 seconds before allowing resend

    } catch (err) {
      console.error('Password reset request error:', err);
      
      if (err.response?.status === 404) {
        setError('No account found with this email address. Please check your email or sign up.');
      } else if (err.response?.status === 429) {
        setError('Too many password reset requests. Please wait before trying again.');
      } else {
        setError(err.response?.data?.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    
    if (!formData.resetCode.trim()) {
      setError('Verification code is required');
      return;
    }

    if (formData.resetCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyResetCode({
        email: formData.email.toLowerCase().trim(),
        resetCode: formData.resetCode.trim(),
        resetToken: resetToken
      });

      setSuccess('Code verified successfully! Now create your new password.');
      setCurrentStep(3);
      setAttempts(0);

    } catch (err) {
      console.error('Code verification error:', err);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (err.response?.status === 400) {
        if (newAttempts >= 3) {
          setError('Too many failed attempts. Please request a new password reset.');
          setTimeout(() => {
            setCurrentStep(1);
            setFormData(prev => ({ ...prev, resetCode: '' }));
            setAttempts(0);
          }, 3000);
        } else {
          setError(`Invalid verification code. ${3 - newAttempts} attempts remaining.`);
        }
      } else if (err.response?.status === 410) {
        setError('Verification code has expired. Please request a new password reset.');
        setTimeout(() => {
          setCurrentStep(1);
          setFormData(prev => ({ ...prev, resetCode: '' }));
        }, 3000);
      } else {
        setError(err.response?.data?.message || 'Code verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword) {
      setError('New password is required');
      return;
    }

    if (!formData.confirmPassword) {
      setError('Please confirm your new password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please choose a stronger password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword({
        email: formData.email.toLowerCase().trim(),
        resetCode: formData.resetCode.trim(),
        newPassword: formData.newPassword,
        resetToken: resetToken
      });

      setSuccess('Password reset successful! You can now sign in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Password reset successful! Please sign in with your new password.',
            email: formData.email
          }
        });
      }, 3000);

    } catch (err) {
      console.error('Password reset error:', err);
      
      if (err.response?.status === 400) {
        setError('Invalid or expired reset code. Please start over.');
        setTimeout(() => {
          setCurrentStep(1);
          setFormData(prev => ({ 
            ...prev, 
            resetCode: '', 
            newPassword: '', 
            confirmPassword: '' 
          }));
        }, 3000);
      } else {
        setError(err.response?.data?.message || 'Password reset failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await authService.requestPasswordReset({
        email: formData.email.toLowerCase().trim(),
        userType: formData.userType
      });

      setResetToken(response.data.resetToken);
      setSuccess('New verification code sent to your email.');
      setResendTimer(60);
      setAttempts(0);

    } catch (err) {
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          <div className="step-number">
            {currentStep > step ? '✓' : step}
          </div>
          <div className="step-label">
            {step === 1 && 'Email'}
            {step === 2 && 'Verify'}
            {step === 3 && 'Reset'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmailStep = () => (
    <div className="reset-step">
      <div className="step-icon">📧</div>
      <h3>Reset Your Password</h3>
      <p>Enter your email address and we'll send you a verification code to reset your password.</p>

      <form onSubmit={handleEmailSubmit} className="reset-form">
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
              autoComplete="email"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="reset-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Sending Code...
            </>
          ) : (
            <>
              <span>Send Reset Code</span>
              <span className="btn-icon">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="reset-step">
      <div className="step-icon">🔐</div>
      <h3>Enter Verification Code</h3>
      <p>We've sent a 6-digit verification code to <strong>{formData.email}</strong></p>

      <form onSubmit={handleCodeVerification} className="reset-form">
        <div className="form-group">
          <label htmlFor="resetCode">Verification Code</label>
          <div className="input-wrapper">
            <span className="input-icon">🔑</span>
            <input
              type="text"
              id="resetCode"
              name="resetCode"
              value={formData.resetCode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit code"
              maxLength="6"
              pattern="[0-9]{6}"
              required
              autoComplete="one-time-code"
            />
          </div>
          {attempts > 0 && (
            <small className="attempts-warning">
              {attempts}/3 attempts used
            </small>
          )}
        </div>

        <button 
          type="submit" 
          className="reset-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Verifying...
            </>
          ) : (
            <>
              <span>Verify Code</span>
              <span className="btn-icon">→</span>
            </>
          )}
        </button>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            className={`resend-btn ${resendTimer > 0 ? 'disabled' : ''}`}
            onClick={handleResendCode}
            disabled={resendTimer > 0 || loading}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPasswordResetStep = () => (
    <div className="reset-step">
      <div className="step-icon">🔒</div>
      <h3>Create New Password</h3>
      <p>Create a strong password for your account</p>

      <form onSubmit={handlePasswordReset} className="reset-form">
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <div className="password-input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {formData.newPassword && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className={`strength-fill strength-${passwordStrength}`}
                  style={{ width: `${(passwordStrength / 6) * 100}%` }}
                ></div>
              </div>
              <span className={`strength-label strength-${passwordStrength}`}>
                {getPasswordStrengthLabel(passwordStrength)}
              </span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div className="password-input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
            <span className="password-match">✅ Passwords match</span>
          )}
        </div>

        <div className="password-requirements">
          <h4>Password Requirements:</h4>
          <ul>
            <li className={formData.newPassword.length >= 8 ? 'met' : ''}>
              At least 8 characters
            </li>
            <li className={/[a-z]/.test(formData.newPassword) ? 'met' : ''}>
              One lowercase letter
            </li>
            <li className={/[A-Z]/.test(formData.newPassword) ? 'met' : ''}>
              One uppercase letter
            </li>
            <li className={/[0-9]/.test(formData.newPassword) ? 'met' : ''}>
              One number
            </li>
            <li className={/[^A-Za-z0-9]/.test(formData.newPassword) ? 'met' : ''}>
              One special character
            </li>
          </ul>
        </div>

        <button 
          type="submit" 
          className="reset-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Resetting Password...
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <span className="btn-icon">✓</span>
            </>
          )}
        </button>
      </form>
    </div>
  );

  if (loading && !formData.email) return <LoadingSpinner />;

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <h1>Medi-Link</h1>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

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

        {/* Step Content */}
        {currentStep === 1 && renderEmailStep()}
        {currentStep === 2 && renderVerificationStep()}
        {currentStep === 3 && renderPasswordResetStep()}

        {/* Back to Login */}
        <div className="back-to-login">
          <Link to="/login" className="back-link">
            ← Back to Sign In
          </Link>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-item">
            <span className="security-icon">🔒</span>
            <span>Password reset links expire in 15 minutes</span>
          </div>
          <div className="security-item">
            <span className="security-icon">🛡️</span>
            <span>Your account security is our priority</span>
          </div>
        </div>

        {/* Help Links */}
        <div className="help-links">
          <Link to="/help" className="help-link">Help Center</Link>
          <span className="separator">•</span>
          <Link to="/contact" className="help-link">Contact Support</Link>
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
      <div className="forgot-password-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;