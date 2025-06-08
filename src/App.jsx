import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, USER_ROLES } from '../../utils/constants';
import { validateForm } from '../../utils/validators';
import { ButtonLoader } from '../../components/common/LoadingSpinner';

const UserSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation rules
  const validationRules = {
    firstName: [{ type: 'required' }],
    lastName: [{ type: 'required' }],
    email: [{ type: 'required' }, { type: 'email' }],
    password: [{ type: 'required' }, { type: 'password' }],
    confirmPassword: [
      { type: 'required' },
      { 
        type: 'custom', 
        validator: (value, formData) => {
          if (value !== formData.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      }
    ],
    phone: [{ type: 'required' }, { type: 'phone' }],
    dateOfBirth: [{ type: 'required' }],
    gender: [{ type: 'required' }],
    agreedToTerms: [
      { 
        type: 'custom', 
        validator: (value) => value ? null : 'You must agree to the terms and conditions'
      }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateForm(formData, validationRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData, USER_ROLES.PATIENT);
      
      if (result.success) {
        // Show success message and redirect to login
        alert('Registration successful! Please check your email to verify your account.');
        navigate(ROUTES.USER_LOGIN);
      } else {
        setErrors({ submit: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-primary-blue rounded-lg p-2">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Medi-Link</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Patient Account</h1>
          <p className="text-gray-600 mt-2">Join thousands of patients getting better healthcare</p>
        </div>

        <div className="card">
          <div className="card-body">
            {errors.submit && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <span className="text-red-700 text-sm">{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <div className="form-error">{errors.firstName}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <div className="form-error">{errors.lastName}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`form-input pr-10 ${errors.password ? 'error' : ''}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`form-input pr-10 ${errors.confirmPassword ? 'error' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input pl-10 ${errors.phone ? 'error' : ''}`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                  />
                  {errors.dateOfBirth && <div className="form-error">{errors.dateOfBirth}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`form-select ${errors.gender ? 'error' : ''}`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  {errors.gender && <div className="form-error">{errors.gender}</div>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreedToTerms"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <label htmlFor="agreedToTerms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-blue hover:underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-blue hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    *
                  </label>
                </div>
                {errors.agreedToTerms && <div className="form-error">{errors.agreedToTerms}</div>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary btn-lg"
              >
                {isLoading && <ButtonLoader />}
                Create Account
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to={ROUTES.USER_LOGIN} className="text-primary-blue hover:underline font-medium">
              Sign in here
            </Link>
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <span>Are you a healthcare provider? </span>
            <Link to={ROUTES.DOCTOR_SIGNUP} className="text-primary-blue hover:underline">
              Register as Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;