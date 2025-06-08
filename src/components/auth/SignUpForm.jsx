import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './SignupForm.css';

const SignupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    userType: 'patient',
    
    // Basic Info (Step 1)
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    
    // Account Security (Step 2)
    password: '',
    confirmPassword: '',
    
    // User Type Specific (Step 3)
    // Patient specific
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: ''
    },
    insuranceProvider: '',
    
    // Doctor specific
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    medicalSchool: '',
    
    // Admin specific
    employeeId: '',
    department: '',
    accessLevel: '',
    
    // Terms and Privacy
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const specializations = [
    'Anesthesiology', 'Cardiology', 'Dermatology', 'Emergency Medicine',
    'Family Medicine', 'Gastroenterology', 'General Surgery', 'Internal Medicine',
    'Neurology', 'Obstetrics and Gynecology', 'Oncology', 'Ophthalmology',
    'Orthopedics', 'Otolaryngology', 'Pathology', 'Pediatrics', 'Psychiatry',
    'Pulmonology', 'Radiology', 'Rheumatology', 'Urology', 'Other'
  ];

  const insuranceProviders = [
    'Aetna', 'Anthem', 'Blue Cross Blue Shield', 'Cigna', 'Humana',
    'Kaiser Permanente', 'Medicare', 'Medicaid', 'UnitedHealth',
    'Independence Blue Cross', 'Molina Healthcare', 'Other'
  ];

  useEffect(() => {
    // If user is already logged in, redirect them
    if (user) {
      navigate('/dashboard', { replace: true });
    }

    // Get user type from URL params
    const urlParams = new URLSearchParams(location.search);
    const typeFromUrl = urlParams.get('type');
    if (typeFromUrl && ['patient', 'doctor', 'admin'].includes(typeFromUrl)) {
      setFormData(prev => ({ ...prev, userType: typeFromUrl }));
    }
  }, [user, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like emergencyContact.name
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear field errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear general error
    if (error) {
      setError('');
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

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
          }
        }
        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = 'Phone number is required';
        } else {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
            errors.phoneNumber = 'Please enter a valid phone number';
          }
        }
        if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        break;

      case 2:
        if (!formData.password) {
          errors.password = 'Password is required';
        } else {
          if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
          }
          if (passwordStrength < 3) {
            errors.password = 'Password is too weak. Please use a stronger password.';
          }
        }
        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 3:
        if (formData.userType === 'doctor') {
          if (!formData.licenseNumber.trim()) errors.licenseNumber = 'Medical license number is required';
          if (!formData.specialization) errors.specialization = 'Specialization is required';
          if (!formData.yearsOfExperience) errors.yearsOfExperience = 'Years of experience is required';
          if (!formData.medicalSchool.trim()) errors.medicalSchool = 'Medical school is required';
        } else if (formData.userType === 'admin') {
          if (!formData.employeeId.trim()) errors.employeeId = 'Employee ID is required';
          if (!formData.department.trim()) errors.department = 'Department is required';
          if (!formData.accessLevel) errors.accessLevel = 'Access level is required';
        }
        break;

      case 4:
        if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to the Terms of Service';
        if (!formData.agreeToPrivacy) errors.agreeToPrivacy = 'You must agree to the Privacy Policy';
        break;
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep(currentStep);
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors above to continue');
      return;
    }

    setFieldErrors({});
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix the errors above to continue');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const registrationData = {
        userType: formData.userType,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        password: formData.password,
        emergencyContact: formData.userType === 'patient' ? formData.emergencyContact : undefined,
        insuranceProvider: formData.userType === 'patient' ? formData.insuranceProvider : undefined,
        licenseNumber: formData.userType === 'doctor' ? formData.licenseNumber : undefined,
        specialization: formData.userType === 'doctor' ? formData.specialization : undefined,
        yearsOfExperience: formData.userType === 'doctor' ? formData.yearsOfExperience : undefined,
        medicalSchool: formData.userType === 'doctor' ? formData.medicalSchool : undefined,
        employeeId: formData.userType === 'admin' ? formData.employeeId : undefined,
        department: formData.userType === 'admin' ? formData.department : undefined,
        accessLevel: formData.userType === 'admin' ? formData.accessLevel : undefined,
        agreeToMarketing: formData.agreeToMarketing
      };

      const response = await authService.register(registrationData);
      
      setSuccess('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login with success message
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please check your email to verify your account before signing in.'
          }
        });
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      
      if (err.response?.status === 409) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.response?.data?.field) {
        setFieldErrors({ [err.response.data.field]: err.response.data.message });
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    try {
      setLoading(true);
      setError('');

      // Redirect to social auth provider
      window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}/register?userType=${formData.userType}`;
    } catch (err) {
      setError(`${provider} signup failed. Please try again.`);
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          <div className="step-number">
            {currentStep > step ? '✓' : step}
          </div>
          <div className="step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Security'}
            {step === 3 && 'Details'}
            {step === 4 && 'Terms'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="form-step">
      <h3>Basic Information</h3>
      <p>Let's start with your basic details</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            className={fieldErrors.firstName ? 'error' : ''}
          />
          {fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            className={fieldErrors.lastName ? 'error' : ''}
          />
          {fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          className={fieldErrors.email ? 'error' : ''}
        />
        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number *</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="Enter your phone number"
          className={fieldErrors.phoneNumber ? 'error' : ''}
        />
        {fieldErrors.phoneNumber && <span className="field-error">{fieldErrors.phoneNumber}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth *</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            className={fieldErrors.dateOfBirth ? 'error' : ''}
          />
          {fieldErrors.dateOfBirth && <span className="field-error">{fieldErrors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender *</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={fieldErrors.gender ? 'error' : ''}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="PreferNotToSay">Prefer not to say</option>
          </select>
          {fieldErrors.gender && <span className="field-error">{fieldErrors.gender}</span>}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="form-step">
      <h3>Account Security</h3>
      <p>Create a secure password for your account</p>

      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            className={fieldErrors.password ? 'error' : ''}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        
        {formData.password && (
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
        
        <div className="password-requirements">
          <h4>Password Requirements:</h4>
          <ul>
            <li className={formData.password.length >= 8 ? 'met' : ''}>
              At least 8 characters
            </li>
            <li className={/[a-z]/.test(formData.password) ? 'met' : ''}>
              One lowercase letter
            </li>
            <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>
              One uppercase letter
            </li>
            <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>
              One number
            </li>
            <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'met' : ''}>
              One special character
            </li>
          </ul>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className={fieldErrors.confirmPassword ? 'error' : ''}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
        
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <span className="password-match">✅ Passwords match</span>
        )}
      </div>
    </div>
  );

  const renderUserTypeDetails = () => (
    <div className="form-step">
      <h3>
        {formData.userType === 'patient' && 'Patient Information'}
        {formData.userType === 'doctor' && 'Professional Information'}
        {formData.userType === 'admin' && 'Administrative Information'}
      </h3>
      <p>
        {formData.userType === 'patient' && 'Additional details to help us serve you better'}
        {formData.userType === 'doctor' && 'Professional credentials and experience'}
        {formData.userType === 'admin' && 'Administrative access and department details'}
      </p>

      {formData.userType === 'patient' && (
        <>
          <div className="form-group">
            <label htmlFor="insuranceProvider">Insurance Provider</label>
            <select
              id="insuranceProvider"
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={handleInputChange}
            >
              <option value="">Select Insurance Provider</option>
              {insuranceProviders.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>

          <h4>Emergency Contact</h4>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergencyContact.name">Contact Name</label>
              <input
                type="text"
                id="emergencyContact.name"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                placeholder="Emergency contact name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="emergencyContact.relationship">Relationship</label>
              <input
                type="text"
                id="emergencyContact.relationship"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emergencyContact.phoneNumber">Contact Phone</label>
            <input
              type="tel"
              id="emergencyContact.phoneNumber"
              name="emergencyContact.phoneNumber"
              value={formData.emergencyContact.phoneNumber}
              onChange={handleInputChange}
              placeholder="Emergency contact phone number"
            />
          </div>
        </>
      )}

      {formData.userType === 'doctor' && (
        <>
          <div className="form-group">
            <label htmlFor="licenseNumber">Medical License Number *</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              placeholder="Enter your medical license number"
              className={fieldErrors.licenseNumber ? 'error' : ''}
            />
            {fieldErrors.licenseNumber && <span className="field-error">{fieldErrors.licenseNumber}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialization">Specialization *</label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className={fieldErrors.specialization ? 'error' : ''}
              >
                <option value="">Select Specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {fieldErrors.specialization && <span className="field-error">{fieldErrors.specialization}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="yearsOfExperience">Years of Experience *</label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleInputChange}
                min="0"
                max="50"
                placeholder="Years of practice"
                className={fieldErrors.yearsOfExperience ? 'error' : ''}
              />
              {fieldErrors.yearsOfExperience && <span className="field-error">{fieldErrors.yearsOfExperience}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="medicalSchool">Medical School *</label>
            <input
              type="text"
              id="medicalSchool"
              name="medicalSchool"
              value={formData.medicalSchool}
              onChange={handleInputChange}
              placeholder="Name of medical school"
              className={fieldErrors.medicalSchool ? 'error' : ''}
            />
            {fieldErrors.medicalSchool && <span className="field-error">{fieldErrors.medicalSchool}</span>}
          </div>
        </>
      )}

      {formData.userType === 'admin' && (
        <>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeId">Employee ID *</label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                placeholder="Enter employee ID"
                className={fieldErrors.employeeId ? 'error' : ''}
              />
              {fieldErrors.employeeId && <span className="field-error">{fieldErrors.employeeId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter department"
                className={fieldErrors.department ? 'error' : ''}
              />
              {fieldErrors.department && <span className="field-error">{fieldErrors.department}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="accessLevel">Access Level *</label>
            <select
              id="accessLevel"
              name="accessLevel"
              value={formData.accessLevel}
              onChange={handleInputChange}
              className={fieldErrors.accessLevel ? 'error' : ''}
            >
              <option value="">Select Access Level</option>
              <option value="standard">Standard</option>
              <option value="supervisor">Supervisor</option>
              <option value="manager">Manager</option>
              <option value="director">Director</option>
            </select>
            {fieldErrors.accessLevel && <span className="field-error">{fieldErrors.accessLevel}</span>}
          </div>
        </>
      )}
    </div>
  );

  const renderTermsAndPrivacy = () => (
    <div className="form-step">
      <h3>Terms & Privacy</h3>
      <p>Please review and accept our terms and privacy policy</p>

      <div className="terms-section">
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className={fieldErrors.agreeToTerms ? 'error' : ''}
            />
            <span className="checkbox-custom"></span>
            <span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="terms-link">
                Terms of Service
              </Link>
              *
            </span>
          </label>
          {fieldErrors.agreeToTerms && <span className="field-error">{fieldErrors.agreeToTerms}</span>}
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeToPrivacy"
              checked={formData.agreeToPrivacy}
              onChange={handleInputChange}
              className={fieldErrors.agreeToPrivacy ? 'error' : ''}
            />
            <span className="checkbox-custom"></span>
            <span>
              I agree to the{' '}
              <Link to="/privacy" target="_blank" className="terms-link">
                Privacy Policy
              </Link>
              *
            </span>
          </label>
          {fieldErrors.agreeToPrivacy && <span className="field-error">{fieldErrors.agreeToPrivacy}</span>}
        </div>

        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeToMarketing"
              checked={formData.agreeToMarketing}
              onChange={handleInputChange}
            />
            <span className="checkbox-custom"></span>
            <span>
              I would like to receive marketing communications and health tips (optional)
            </span>
          </label>
        </div>
      </div>

      <div className="privacy-notice">
        <h4>🔒 Your Privacy Matters</h4>
        <ul>
          <li>Your personal information is encrypted and secure</li>
          <li>We follow HIPAA compliance for all medical data</li>
          <li>You can update your privacy preferences anytime</li>
          <li>We never sell your data to third parties</li>
        </ul>
      </div>
    </div>
  );

  if (loading && !formData.email) return <LoadingSpinner />;

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            <h1>Medi-Link</h1>
          </div>
          <h2>Create Your Account</h2>
          <p>Join our healthcare platform and start your journey to better health</p>
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

        <form onSubmit={handleSubmit} className="signup-form">
          {currentStep === 1 && renderBasicInfo()}
          {currentStep === 2 && renderSecurity()}
          {currentStep === 3 && renderUserTypeDetails()}
          {currentStep === 4 && renderTermsAndPrivacy()}

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevStep}
                disabled={loading}
              >
                ← Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNextStep}
                disabled={loading}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !formData.agreeToTerms || !formData.agreeToPrivacy}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Social Signup - Only show on first step */}
        {currentStep === 1 && (
          <div className="social-signup">
            <div className="divider">
              <span>Or sign up with</span>
            </div>

            <div className="social-buttons">
              <button
                type="button"
                className="social-btn google"
                onClick={() => handleSocialSignup('google')}
                disabled={loading}
              >
                <span className="social-icon">🔵</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="social-btn facebook"
                onClick={() => handleSocialSignup('facebook')}
                disabled={loading}
              >
                <span className="social-icon">📘</span>
                <span>Facebook</span>
              </button>
            </div>
          </div>
        )}

        {/* Login Link */}
        <div className="login-link">
          <p>
            Already have an account?{' '}
            <Link 
              to={`/login?type=${formData.userType}`}
              className="login-btn"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Help Links */}
        <div className="help-links">
          <Link to="/help" className="help-link">Help Center</Link>
          <span className="separator">•</span>
          <Link to="/contact" className="help-link">Contact Support</Link>
        </div>
      </div>

      {/* Background Elements */}
      <div className="signup-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
};

export default SignupForm;