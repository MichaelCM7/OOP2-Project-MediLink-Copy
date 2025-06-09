import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Theme configurations
const THEMES = {
  light: {
    name: 'light',
    colors: {
      primary: '#3498db',
      secondary: '#2ecc71',
      danger: '#e74c3c',
      warning: '#f39c12',
      success: '#27ae60',
      info: '#17a2b8',
      background: '#ffffff',
      surface: '#f8f9fa',
      card: '#ffffff',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      textMuted: '#95a5a6',
      border: '#e9ecef',
      borderLight: '#f1f3f4',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowHover: 'rgba(0, 0, 0, 0.15)',
      overlay: 'rgba(0, 0, 0, 0.5)',
      emergency: '#e74c3c',
      emergencyLight: '#ffebee'
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
      large: '0 8px 16px rgba(0, 0, 0, 0.15)',
      xl: '0 12px 24px rgba(0, 0, 0, 0.18)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #3498db, #2980b9)',
      secondary: 'linear-gradient(135deg, #2ecc71, #27ae60)',
      danger: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
      hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#4fa8d8',
      secondary: '#52c878',
      danger: '#ff6b6b',
      warning: '#ffd93d',
      success: '#6bcf7e',
      info: '#4ecdc4',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      card: '#383838',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      textMuted: '#888888',
      border: '#444444',
      borderLight: '#555555',
      shadow: 'rgba(0, 0, 0, 0.3)',
      shadowHover: 'rgba(0, 0, 0, 0.4)',
      overlay: 'rgba(0, 0, 0, 0.7)',
      emergency: '#ff6b6b',
      emergencyLight: '#4a1a1a'
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.35)',
      large: '0 8px 16px rgba(0, 0, 0, 0.4)',
      xl: '0 12px 24px rgba(0, 0, 0, 0.45)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #4fa8d8, #3a7bd5)',
      secondary: 'linear-gradient(135deg, #52c878, #41a85f)',
      danger: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
      warning: 'linear-gradient(135deg, #ffd93d, #f4ca64)',
      hero: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  }
};

// Breakpoints for responsive design
const BREAKPOINTS = {
  xs: '480px',
  sm: '768px',
  md: '1024px',
  lg: '1200px',
  xl: '1440px'
};

// Component sizes
const COMPONENT_SIZES = {
  small: {
    padding: '8px 12px',
    fontSize: '14px',
    height: '32px',
    borderRadius: '4px'
  },
  medium: {
    padding: '12px 16px',
    fontSize: '16px',
    height: '40px',
    borderRadius: '6px'
  },
  large: {
    padding: '16px 24px',
    fontSize: '18px',
    height: '48px',
    borderRadius: '8px'
  }
};

// Initial state
const initialState = {
  currentTheme: 'light',
  isDarkMode: false,
  primaryColor: '#3498db',
  fontSize: 'medium', // small, medium, large
  reduceMotion: false,
  highContrast: false,
  compactMode: false,
  sidebarCollapsed: false,
  customColors: {},
  userPreferences: {
    autoTheme: true, // Auto switch based on system preference
    preferredTheme: 'light',
    colorBlindMode: false,
    largeText: false
  }
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_PRIMARY_COLOR: 'SET_PRIMARY_COLOR',
  SET_FONT_SIZE: 'SET_FONT_SIZE',
  TOGGLE_REDUCE_MOTION: 'TOGGLE_REDUCE_MOTION',
  TOGGLE_HIGH_CONTRAST: 'TOGGLE_HIGH_CONTRAST',
  TOGGLE_COMPACT_MODE: 'TOGGLE_COMPACT_MODE',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CUSTOM_COLORS: 'SET_CUSTOM_COLORS',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  RESET_THEME: 'RESET_THEME',
  LOAD_PREFERENCES: 'LOAD_PREFERENCES'
};

// Theme reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        currentTheme: action.payload,
        isDarkMode: action.payload === 'dark'
      };

    case THEME_ACTIONS.TOGGLE_THEME:
      const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        currentTheme: newTheme,
        isDarkMode: newTheme === 'dark'
      };

    case THEME_ACTIONS.SET_PRIMARY_COLOR:
      return {
        ...state,
        primaryColor: action.payload
      };

    case THEME_ACTIONS.SET_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload
      };

    case THEME_ACTIONS.TOGGLE_REDUCE_MOTION:
      return {
        ...state,
        reduceMotion: !state.reduceMotion
      };

    case THEME_ACTIONS.TOGGLE_HIGH_CONTRAST:
      return {
        ...state,
        highContrast: !state.highContrast
      };

    case THEME_ACTIONS.TOGGLE_COMPACT_MODE:
      return {
        ...state,
        compactMode: !state.compactMode
      };

    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };

    case THEME_ACTIONS.SET_CUSTOM_COLORS:
      return {
        ...state,
        customColors: { ...state.customColors, ...action.payload }
      };

    case THEME_ACTIONS.UPDATE_PREFERENCES:
      return {
        ...state,
        userPreferences: { ...state.userPreferences, ...action.payload }
      };

    case THEME_ACTIONS.RESET_THEME:
      return {
        ...initialState,
        userPreferences: state.userPreferences
      };

    case THEME_ACTIONS.LOAD_PREFERENCES:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load theme preferences on mount
  useEffect(() => {
    loadThemePreferences();
    setupSystemThemeListener();
  }, []);

  // Save preferences whenever state changes
  useEffect(() => {
    saveThemePreferences();
    applyThemeToDOM();
  }, [state]);

  // Load theme preferences from localStorage
  const loadThemePreferences = () => {
    try {
      const savedPreferences = localStorage.getItem('medi-link-theme-preferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        dispatch({
          type: THEME_ACTIONS.LOAD_PREFERENCES,
          payload: preferences
        });
      }

      // Check system theme preference if auto theme is enabled
      if (state.userPreferences.autoTheme) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = systemPrefersDark ? 'dark' : 'light';
        if (systemTheme !== state.currentTheme) {
          dispatch({
            type: THEME_ACTIONS.SET_THEME,
            payload: systemTheme
          });
        }
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
  };

  // Save theme preferences to localStorage
  const saveThemePreferences = () => {
    try {
      localStorage.setItem('medi-link-theme-preferences', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  // Setup system theme change listener
  const setupSystemThemeListener = () => {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (state.userPreferences.autoTheme) {
          dispatch({
            type: THEME_ACTIONS.SET_THEME,
            payload: e.matches ? 'dark' : 'light'
          });
        }
      };

      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  };

  // Apply theme to DOM
  const applyThemeToDOM = () => {
    const root = document.documentElement;
    const theme = getTheme();

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    Object.entries(theme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    // Apply breakpoints
    Object.entries(BREAKPOINTS).forEach(([key, value]) => {
      root.style.setProperty(`--breakpoint-${key}`, value);
    });

    // Apply accessibility preferences
    if (state.reduceMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[state.fontSize]);

    // Apply compact mode
    if (state.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Apply high contrast
    if (state.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply theme class
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${state.currentTheme}`);
  };

  // Get current theme object
  const getTheme = () => {
    const baseTheme = THEMES[state.currentTheme];
    
    // Apply custom colors if any
    if (Object.keys(state.customColors).length > 0) {
      return {
        ...baseTheme,
        colors: {
          ...baseTheme.colors,
          ...state.customColors
        }
      };
    }
    
    return baseTheme;
  };

  // Theme actions
  const setTheme = (themeName) => {
    dispatch({
      type: THEME_ACTIONS.SET_THEME,
      payload: themeName
    });
  };

  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME });
  };

  const setPrimaryColor = (color) => {
    dispatch({
      type: THEME_ACTIONS.SET_PRIMARY_COLOR,
      payload: color
    });
  };

  const setFontSize = (size) => {
    dispatch({
      type: THEME_ACTIONS.SET_FONT_SIZE,
      payload: size
    });
  };

  const toggleReduceMotion = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_REDUCE_MOTION });
  };

  const toggleHighContrast = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_HIGH_CONTRAST });
  };

  const toggleCompactMode = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_COMPACT_MODE });
  };

  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setCustomColors = (colors) => {
    dispatch({
      type: THEME_ACTIONS.SET_CUSTOM_COLORS,
      payload: colors
    });
  };

  const updatePreferences = (preferences) => {
    dispatch({
      type: THEME_ACTIONS.UPDATE_PREFERENCES,
      payload: preferences
    });
  };

  const resetTheme = () => {
    dispatch({ type: THEME_ACTIONS.RESET_THEME });
  };

  // Utility functions
  const getColor = (colorName) => {
    const theme = getTheme();
    return theme.colors[colorName] || colorName;
  };

  const getShadow = (shadowName) => {
    const theme = getTheme();
    return theme.shadows[shadowName] || shadowName;
  };

  const getGradient = (gradientName) => {
    const theme = getTheme();
    return theme.gradients[gradientName] || gradientName;
  };

  const getBreakpoint = (breakpointName) => {
    return BREAKPOINTS[breakpointName];
  };

  const getComponentSize = (sizeName) => {
    return COMPONENT_SIZES[sizeName] || COMPONENT_SIZES.medium;
  };

  // Responsive helpers
  const isSmallScreen = () => {
    return window.innerWidth < parseInt(BREAKPOINTS.sm);
  };

  const isMediumScreen = () => {
    return window.innerWidth >= parseInt(BREAKPOINTS.sm) && 
           window.innerWidth < parseInt(BREAKPOINTS.lg);
  };

  const isLargeScreen = () => {
    return window.innerWidth >= parseInt(BREAKPOINTS.lg);
  };

  // Generate CSS string for component styling
  const getComponentStyles = (componentType, variant = 'primary', size = 'medium') => {
    const theme = getTheme();
    const componentSize = getComponentSize(size);
    
    const baseStyles = {
      padding: componentSize.padding,
      fontSize: componentSize.fontSize,
      borderRadius: componentSize.borderRadius,
      border: 'none',
      cursor: 'pointer',
      transition: state.reduceMotion ? 'none' : 'all 0.3s ease',
      fontFamily: 'inherit'
    };

    switch (componentType) {
      case 'button':
        return {
          ...baseStyles,
          backgroundColor: theme.colors[variant] || theme.colors.primary,
          color: variant === 'light' ? theme.colors.text : '#ffffff',
          '&:hover': {
            transform: state.reduceMotion ? 'none' : 'translateY(-2px)',
            boxShadow: theme.shadows.medium
          }
        };
      
      case 'card':
        return {
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderRadius: '8px',
          boxShadow: theme.shadows.small,
          border: `1px solid ${theme.colors.border}`,
          padding: '16px'
        };
      
      default:
        return baseStyles;
    }
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Current theme object
    theme: getTheme(),
    breakpoints: BREAKPOINTS,
    componentSizes: COMPONENT_SIZES,
    
    // Actions
    setTheme,
    toggleTheme,
    setPrimaryColor,
    setFontSize,
    toggleReduceMotion,
    toggleHighContrast,
    toggleCompactMode,
    toggleSidebar,
    setCustomColors,
    updatePreferences,
    resetTheme,
    
    // Utilities
    getColor,
    getShadow,
    getGradient,
    getBreakpoint,
    getComponentSize,
    getComponentStyles,
    
    // Responsive helpers
    isSmallScreen,
    isMediumScreen,
    isLargeScreen
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// HOC for theme-aware components
export const withTheme = (Component) => {
  return function ThemedComponent(props) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
};

export default ThemeContext;