import { useState, useEffect, useCallback } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';

// Enhanced useAuth hook with additional utilities
export const useAuth = () => {
  return useAuthContext();
};

// Hook for handling login form state and validation
export const useLogin = () => {
  const { login, isLoading, error } = useAuthContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate login form
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return { success: false, errors: formErrors };
    }
    
    setIsSubmitting(true);
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      if (result.success) {
        setFormData({ email: '', password: '', rememberMe: false });
        setFormErrors({});
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, login, validateForm, formErrors]);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  return {
    formData,
    formErrors,
    isSubmitting: isSubmitting || isLoading,
    updateField,
    handleSubmit,
    validateForm,
    error
  };
};

// Hook for handling registration form state and validation  
export const useRegister = () => {
  const { register, isLoading, error } = useAuthContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient', // patient, doctor
    acceptTerms: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate registration form
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return { success: false, errors: formErrors };
    }
    
    setIsSubmitting(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      });
      
      if (result.success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: 'patient',
          acceptTerms: false
        });
        setFormErrors({});
      }
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, register, validateForm, formErrors]);

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  return {
    formData,
    formErrors,
    isSubmitting: isSubmitting || isLoading,
    updateField,
    handleSubmit,
    validateForm,
    error
  };
};

// Hook for password reset functionality
export const usePasswordReset = () => {
  const { resetPassword } = useAuthContext();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
        setMessage('Password reset link sent to your email');
        setEmail('');
      } else {
        setError(result.message || 'Failed to send reset email');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, resetPassword]);

  return {
    email,
    setEmail,
    isLoading,
    message,
    error,
    handleResetPassword,
    clearMessages: () => {
      setMessage('');
      setError('');
    }
  };
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  return {
    isAuthenticated,
    isLoading,
    authChecked,
    user
  };
};

// Hook for role-based access control
export const useRoleAccess = (allowedRoles = [], allowedPermissions = []) => {
  const { userRole, permissions, hasRole, hasPermission, hasAnyRole } = useAuthContext();

  const hasAccess = useCallback(() => {
    if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
      return false;
    }
    
    if (allowedPermissions.length > 0) {
      return allowedPermissions.some(permission => hasPermission(permission));
    }
    
    return allowedRoles.length === 0 || hasAnyRole(allowedRoles);
  }, [allowedRoles, allowedPermissions, hasAnyRole, hasPermission]);

  return {
    hasAccess: hasAccess(),
    userRole,
    permissions,
    hasRole,
    hasPermission
  };
};

// Hook for session management
export const useSession = () => {
  const { 
    sessionExpiry, 
    lastLoginTime, 
    refreshToken, 
    logout,
    isAuthenticated 
  } = useAuthContext();
  
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  // Calculate time until session expiry
  useEffect(() => {
    if (!sessionExpiry || !isAuthenticated) {
      setTimeUntilExpiry(null);
      return;
    }

    const updateTimeUntilExpiry = () => {
      const now = new Date();
      const expiry = new Date(sessionExpiry);
      const timeLeft = expiry - now;
      
      if (timeLeft <= 0) {
        logout();
        return;
      }
      
      setTimeUntilExpiry(timeLeft);
      
      // Show warning 5 minutes before expiry
      if (timeLeft <= 5 * 60 * 1000 && !showExpiryWarning) {
        setShowExpiryWarning(true);
      }
    };

    updateTimeUntilExpiry();
    const interval = setInterval(updateTimeUntilExpiry, 1000);
    
    return () => clearInterval(interval);
  }, [sessionExpiry, isAuthenticated, logout, showExpiryWarning]);

  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    if (!timeUntilExpiry) return null;
    
    const minutes = Math.floor(timeUntilExpiry / (1000 * 60));
    const seconds = Math.floor((timeUntilExpiry % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeUntilExpiry]);

  // Extend session
  const extendSession = useCallback(async () => {
    const success = await refreshToken();
    if (success) {
      setShowExpiryWarning(false);
    }
    return success;
  }, [refreshToken]);

  return {
    timeUntilExpiry,
    formattedTimeRemaining: formatTimeRemaining(),
    showExpiryWarning,
    lastLoginTime,
    extendSession,
    dismissWarning: () => setShowExpiryWarning(false)
  };
};

// Hook for user profile management
export const useUserProfile = () => {
  const { user, updateUser } = useAuthContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const updateProfile = useCallback(async (profileData) => {
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const result = await updateUser(profileData);
      
      if (result.success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
        return { success: true };
      } else {
        setUpdateError(result.error || 'Failed to update profile');
        return { success: false, error: result.error };
      }
    } finally {
      setIsUpdating(false);
    }
  }, [updateUser]);

  return {
    user,
    isUpdating,
    updateError,
    updateSuccess,
    updateProfile,
    clearMessages: () => {
      setUpdateError('');
      setUpdateSuccess(false);
    }
  };
};

export default useAuth;