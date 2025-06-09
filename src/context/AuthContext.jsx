import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  userRole: null, // 'patient', 'doctor', 'admin'
  permissions: [],
  loginAttempts: 0,
  lastLoginTime: null,
  sessionExpiry: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING',
  CHECK_AUTH: 'CHECK_AUTH',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  RESET_PASSWORD: 'RESET_PASSWORD',
  CLEAR_ERRORS: 'CLEAR_ERRORS'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        userRole: action.payload.user.role,
        permissions: action.payload.user.permissions || [],
        lastLoginTime: new Date().toISOString(),
        sessionExpiry: action.payload.sessionExpiry,
        loginAttempts: 0,
        error: null
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        userRole: action.payload.user.role,
        permissions: action.payload.user.permissions || [],
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        loginAttempts: state.loginAttempts + 1,
        user: null,
        token: null,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        user: null,
        token: null,
        isAuthenticated: false
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.CHECK_AUTH:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: action.payload.isAuthenticated,
        userRole: action.payload.user?.role || null,
        permissions: action.payload.user?.permissions || [],
        isLoading: false
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        sessionExpiry: action.payload.sessionExpiry
      };

    case AUTH_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Auto-logout on session expiry
  useEffect(() => {
    if (state.sessionExpiry) {
      const timeUntilExpiry = new Date(state.sessionExpiry) - new Date();
      if (timeUntilExpiry > 0) {
        const timeoutId = setTimeout(() => {
          logout();
        }, timeUntilExpiry);
        return () => clearTimeout(timeoutId);
      } else {
        logout();
      }
    }
  }, [state.sessionExpiry]);

  // Check if user is authenticated on app start
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Verify token with backend
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          dispatch({
            type: AUTH_ACTIONS.CHECK_AUTH,
            payload: {
              user: data.user || user,
              token,
              isAuthenticated: true
            }
          });
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          dispatch({
            type: AUTH_ACTIONS.CHECK_AUTH,
            payload: {
              user: null,
              token: null,
              isAuthenticated: false
            }
          });
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.CHECK_AUTH,
          payload: {
            user: null,
            token: null,
            isAuthenticated: false
          }
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({
        type: AUTH_ACTIONS.CHECK_AUTH,
        payload: {
          user: null,
          token: null,
          isAuthenticated: false
        }
      });
    }
  };

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: data.user,
            token: data.token,
            sessionExpiry: data.sessionExpiry
          }
        });

        return { success: true, user: data.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: {
            error: data.message || 'Login failed'
          }
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: {
          error: 'Network error. Please try again.'
        }
      });
      return { success: false, error: 'Network error' };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));

        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: {
            user: data.user,
            token: data.token
          }
        });

        return { success: true, user: data.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: {
            error: data.message || 'Registration failed'
          }
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: {
          error: 'Network error. Please try again.'
        }
      });
      return { success: false, error: 'Network error' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Notify backend about logout
      if (state.token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Update state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateUser = async (updatedData) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update local storage
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: data.user
        });

        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        
        dispatch({
          type: AUTH_ACTIONS.REFRESH_TOKEN,
          payload: {
            token: data.token,
            sessionExpiry: data.sessionExpiry
          }
        });

        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      logout();
      return false;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return { success: response.ok, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERRORS });
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.userRole === role;
  };

  // Check if user is any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.userRole);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!state.user?.name) return '?';
    return state.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    resetPassword,
    clearErrors,
    
    // Utilities
    hasPermission,
    hasRole,
    hasAnyRole,
    getUserInitials,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (Component, allowedRoles = []) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, userRole, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

export default AuthContext;