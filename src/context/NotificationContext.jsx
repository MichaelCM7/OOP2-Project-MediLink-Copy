import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// Create Notification Context
const NotificationContext = createContext();

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  EMERGENCY: 'emergency',
  APPOINTMENT: 'appointment',
  SYSTEM: 'system'
};

// Notification priorities
const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  emergencyAlerts: [],
  systemNotifications: [],
  settings: {
    enabled: true,
    sound: true,
    desktop: true,
    email: true,
    sms: false,
    emergencyOnly: false,
    maxNotifications: 10,
    autoHide: true,
    autoHideDelay: 5000, // 5 seconds
    position: 'top-right' // top-right, top-left, bottom-right, bottom-left
  },
  lastSeen: new Date().toISOString()
};

// Action types
const NOTIFICATION_ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  ADD_EMERGENCY_ALERT: 'ADD_EMERGENCY_ALERT',
  REMOVE_EMERGENCY_ALERT: 'REMOVE_EMERGENCY_ALERT',
  ADD_SYSTEM_NOTIFICATION: 'ADD_SYSTEM_NOTIFICATION',
  UPDATE_LAST_SEEN: 'UPDATE_LAST_SEEN',
  LOAD_NOTIFICATIONS: 'LOAD_NOTIFICATIONS'
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      const newNotification = {
        id: action.payload.id || Date.now() + Math.random(),
        type: action.payload.type || NOTIFICATION_TYPES.INFO,
        title: action.payload.title,
        message: action.payload.message,
        priority: action.payload.priority || NOTIFICATION_PRIORITIES.MEDIUM,
        timestamp: new Date().toISOString(),
        read: false,
        persistent: action.payload.persistent || false,
        actions: action.payload.actions || [],
        data: action.payload.data || {},
        autoHide: action.payload.autoHide !== undefined ? action.payload.autoHide : state.settings.autoHide,
        hideDelay: action.payload.hideDelay || state.settings.autoHideDelay
      };

      const updatedNotifications = [newNotification, ...state.notifications]
        .slice(0, state.settings.maxNotifications);

      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: state.unreadCount + 1
      };

    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case NOTIFICATION_ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
        lastSeen: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case NOTIFICATION_ACTIONS.ADD_EMERGENCY_ALERT:
      return {
        ...state,
        emergencyAlerts: [action.payload, ...state.emergencyAlerts]
      };

    case NOTIFICATION_ACTIONS.REMOVE_EMERGENCY_ALERT:
      return {
        ...state,
        emergencyAlerts: state.emergencyAlerts.filter(alert => alert.id !== action.payload)
      };

    case NOTIFICATION_ACTIONS.ADD_SYSTEM_NOTIFICATION:
      return {
        ...state,
        systemNotifications: [action.payload, ...state.systemNotifications].slice(0, 5)
      };

    case NOTIFICATION_ACTIONS.UPDATE_LAST_SEEN:
      return {
        ...state,
        lastSeen: new Date().toISOString()
      };

    case NOTIFICATION_ACTIONS.LOAD_NOTIFICATIONS:
      return {
        ...state,
        ...action.payload
      };

    default:
      return state;
  }
};

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Load saved settings and notifications on mount
  useEffect(() => {
    loadNotificationSettings();
    requestNotificationPermission();
    setupEventListeners();
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    const autoHideNotifications = state.notifications.filter(
      n => n.autoHide && !n.read && !n.persistent
    );

    autoHideNotifications.forEach(notification => {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.hideDelay);
    });
  }, [state.notifications]);

  // Load notification settings
  const loadNotificationSettings = () => {
    try {
      const savedSettings = localStorage.getItem('medi-link-notification-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({
          type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
          payload: settings
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  // Save notification settings
  const saveNotificationSettings = useCallback(() => {
    try {
      localStorage.setItem('medi-link-notification-settings', JSON.stringify(state.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, [state.settings]);

  // Save settings whenever they change
  useEffect(() => {
    saveNotificationSettings();
  }, [state.settings, saveNotificationSettings]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && state.settings.desktop) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  // Setup event listeners for real-time notifications
  const setupEventListeners = () => {
    // Listen for server-sent events
    if (typeof EventSource !== 'undefined') {
      const eventSource = new EventSource('/api/notifications/stream');
      
      eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          addNotification(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      return () => eventSource.close();
    }
  };

  // Add notification
  const addNotification = (notification) => {
    if (!state.settings.enabled) return;

    // Skip non-emergency notifications if emergencyOnly mode is on
    if (state.settings.emergencyOnly && notification.type !== NOTIFICATION_TYPES.EMERGENCY) {
      return;
    }

    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION,
      payload: notification
    });

    // Play sound if enabled
    if (state.settings.sound) {
      playNotificationSound(notification.type);
    }

    // Show desktop notification if enabled and permission granted
    if (state.settings.desktop && Notification.permission === 'granted') {
      showDesktopNotification(notification);
    }

    // Send to backend for persistence
    persistNotification(notification);
  };

  // Remove notification
  const removeNotification = (id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.CLEAR_ALL });
  };

  // Mark notification as read
  const markAsRead = (id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.MARK_AS_READ,
      payload: id
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
  };

  // Update settings
  const updateSettings = (newSettings) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.UPDATE_SETTINGS,
      payload: newSettings
    });
  };

  // Add emergency alert
  const addEmergencyAlert = (alert) => {
    const emergencyAlert = {
      id: Date.now() + Math.random(),
      type: 'emergency',
      title: alert.title,
      message: alert.message,
      location: alert.location,
      timestamp: new Date().toISOString(),
      priority: NOTIFICATION_PRIORITIES.CRITICAL,
      actions: alert.actions || []
    };

    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_EMERGENCY_ALERT,
      payload: emergencyAlert
    });

    // Always show emergency alerts regardless of settings
    addNotification({
      ...emergencyAlert,
      type: NOTIFICATION_TYPES.EMERGENCY,
      persistent: true,
      autoHide: false
    });
  };

  // Remove emergency alert
  const removeEmergencyAlert = (id) => {
    dispatch({
      type: NOTIFICATION_ACTIONS.REMOVE_EMERGENCY_ALERT,
      payload: id
    });
  };

  // Add system notification
  const addSystemNotification = (notification) => {
    const systemNotification = {
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date().toISOString()
    };

    dispatch({
      type: NOTIFICATION_ACTIONS.ADD_SYSTEM_NOTIFICATION,
      payload: systemNotification
    });
  };

  // Convenience methods for different notification types
  const showSuccess = (title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      ...options
    });
  };

  const showError = (title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      persistent: true,
      autoHide: false,
      ...options
    });
  };

  const showWarning = (title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      ...options
    });
  };

  const showInfo = (title, message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      ...options
    });
  };

  const showAppointmentReminder = (appointment, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.APPOINTMENT,
      title: 'Appointment Reminder',
      message: `Your appointment with ${appointment.doctor} is in ${appointment.timeUntil}`,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      data: { appointment },
      actions: [
        { label: 'View Details', action: 'view_appointment' },
        { label: 'Reschedule', action: 'reschedule_appointment' }
      ],
      ...options
    });
  };

  // Play notification sound
  const playNotificationSound = (type) => {
    try {
      const audio = new Audio();
      
      switch (type) {
        case NOTIFICATION_TYPES.EMERGENCY:
          audio.src = '/sounds/emergency-alert.mp3';
          break;
        case NOTIFICATION_TYPES.ERROR:
          audio.src = '/sounds/error.mp3';
          break;
        case NOTIFICATION_TYPES.SUCCESS:
          audio.src = '/sounds/success.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Show desktop notification
  const showDesktopNotification = (notification) => {
    try {
      const options = {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === NOTIFICATION_PRIORITIES.CRITICAL,
        silent: !state.settings.sound
      };

      const desktopNotification = new Notification(notification.title, options);
      
      desktopNotification.onclick = () => {
        window.focus();
        markAsRead(notification.id);
        desktopNotification.close();
      };

      // Auto-close after delay if not critical
      if (notification.priority !== NOTIFICATION_PRIORITIES.CRITICAL) {
        setTimeout(() => {
          desktopNotification.close();
        }, notification.hideDelay || 5000);
      }
    } catch (error) {
      console.error('Error showing desktop notification:', error);
    }
  };

  // Persist notification to backend
  const persistNotification = async (notification) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('Error persisting notification:', error);
    }
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return state.notifications.filter(n => n.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return state.notifications.filter(n => !n.read);
  };

  // Get notifications by priority
  const getNotificationsByPriority = (priority) => {
    return state.notifications.filter(n => n.priority === priority);
  };

  // Check if there are critical notifications
  const hasCriticalNotifications = () => {
    return state.notifications.some(n => 
      n.priority === NOTIFICATION_PRIORITIES.CRITICAL && !n.read
    );
  };

  // Get notification component props based on type
  const getNotificationProps = (notification) => {
    const typeConfig = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        icon: '✅',
        color: '#27ae60',
        backgroundColor: '#e8f5e8'
      },
      [NOTIFICATION_TYPES.ERROR]: {
        icon: '❌',
        color: '#e74c3c',
        backgroundColor: '#ffebee'
      },
      [NOTIFICATION_TYPES.WARNING]: {
        icon: '⚠️',
        color: '#f39c12',
        backgroundColor: '#fff3cd'
      },
      [NOTIFICATION_TYPES.INFO]: {
        icon: 'ℹ️',
        color: '#3498db',
        backgroundColor: '#e3f2fd'
      },
      [NOTIFICATION_TYPES.EMERGENCY]: {
        icon: '🚨',
        color: '#e74c3c',
        backgroundColor: '#ffebee'
      },
      [NOTIFICATION_TYPES.APPOINTMENT]: {
        icon: '📅',
        color: '#9b59b6',
        backgroundColor: '#f3e5f5'
      }
    };

    return typeConfig[notification.type] || typeConfig[NOTIFICATION_TYPES.INFO];
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    addNotification,
    removeNotification,
    clearAllNotifications,
    markAsRead,
    markAllAsRead,
    updateSettings,
    addEmergencyAlert,
    removeEmergencyAlert,
    addSystemNotification,
    
    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAppointmentReminder,
    
    // Utilities
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByPriority,
    hasCriticalNotifications,
    getNotificationProps,
    
    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// HOC for notification-aware components
export const withNotification = (Component) => {
  return function NotificationAwareComponent(props) {
    const notification = useNotification();
    return <Component {...props} notification={notification} />;
  };
};

export default NotificationContext;