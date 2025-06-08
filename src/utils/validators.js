/**
 * Validate required field
 */
export const validateRequired = (value) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return null;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return null;
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  
  return null;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  if (!phone) return null;
  
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

/**
 * Comprehensive form validation
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    rules.forEach(rule => {
      if (errors[field]) return; // Skip if already has error
      
      let error = null;
      
      switch (rule.type) {
        case 'required':
          error = validateRequired(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'password':
          error = validatePassword(value);
          break;
        case 'phone':
          error = validatePhone(value);
          break;
        case 'custom':
          error = rule.validator(value, formData);
          break;
        default:
          break;
      }
      
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });
  });
  
  return { isValid, errors };
};