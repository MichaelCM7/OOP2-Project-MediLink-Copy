import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification as useNotificationContext } from '../context/NotificationContext';

// Main notification hook (re-export context hook)
export const useNotification = () => {
  return useNotificationContext();
};

// Hook for toast notifications with queue management
export const useToast = (maxToasts = 5) => {
  const { addNotification, removeNotification, NOTIFICATION_TYPES } = useNotificationContext();
  const [toastQueue, setToastQueue] = useState([]);
  const toastTimeouts = useRef(new Map());

  // Add toast to queue
  const showToast = useCallback((message, type = NOTIFICATION_TYPES.INFO, options = {}) => {
    const toastId = Date.now() + Math.random();
    const duration = options.duration || 4000;
    const persistent = options.persistent || false;

    const toast = {
      id: toastId,
      message,
      type,
      persistent,
      duration,
      timestamp: Date.now(),
      ...options
    };

    // Add to notification context
    addNotification({
      id: toastId,
      title: options.title || '',
      message,
      type,
      autoHide: !persistent,
      hideDelay: duration,
      persistent
    });

    // Add to local queue
    setToastQueue(prev => {
      const newQueue = [toast, ...prev].slice(0, maxToasts);
      return newQueue;
    });

    // Auto-remove non-persistent toasts
    if (!persistent) {
      const timeoutId = setTimeout(() => {
        removeToast(toastId);
      }, duration);
      toastTimeouts.current.set(toastId, timeoutId);
    }

    return toastId;
  }, [addNotification, maxToasts]);

  // Remove toast
  const removeToast = useCallback((toastId) => {
    setToastQueue(prev => prev.filter(toast => toast.id !== toastId));
    removeNotification(toastId);
    
    // Clear timeout if exists
    const timeoutId = toastTimeouts.current.get(toastId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      toastTimeouts.current.delete(toastId);
    }
  }, [removeNotification]);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    toastQueue.forEach(toast => {
      const timeoutId = toastTimeouts.current.get(toast.id);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
    toastTimeouts.current.clear();
    setToastQueue([]);
  }, [toastQueue]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      toastTimeouts.current.clear();
    };
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return showToast(message, NOTIFICATION_TYPES.SUCCESS, options);
  }, [showToast, NOTIFICATION_TYPES.SUCCESS]);

  const error = useCallback((message, options = {}) => {
    return showToast(message, NOTIFICATION_TYPES.ERROR, { persistent: true, ...options });
  }, [showToast, NOTIFICATION_TYPES.ERROR]);

  const warning = useCallback((message, options = {}) => {
    return showToast(message, NOTIFICATION_TYPES.WARNING, options);
  }, [showToast, NOTIFICATION_TYPES.WARNING]);

  const info = useCallback((message, options = {}) => {
    return showToast(message, NOTIFICATION_TYPES.INFO, options);
  }, [showToast, NOTIFICATION_TYPES.INFO]);

  return {
    toastQueue,
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };
};

// Hook for managing notification badge counts
export const useNotificationBadge = () => {
  const { unreadCount, notifications, emergencyAlerts } = useNotificationContext();
  const [badgeCount, setBadgeCount] = useState(0);
  const [hasCritical, setHasCritical] = useState(false);

  useEffect(() => {
    const criticalCount = notifications.filter(n => 
      !n.read && (n.priority === 'critical' || n.type === 'emergency')
    ).length;
    
    const emergencyCount = emergencyAlerts.length;
    const totalCritical = criticalCount + emergencyCount;
    
    setBadgeCount(unreadCount);
    setHasCritical(totalCritical > 0);
  }, [notifications, emergencyAlerts, unreadCount]);

  return {
    badgeCount,
    hasCritical,
    displayCount: badgeCount > 99 ? '99+' : badgeCount.toString()
  };
};

// Hook for desktop notification management
export const useDesktopNotifications = () => {
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [isSupported, setIsSupported] = useState('Notification' in window);

  // Request permission for desktop notifications
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Show desktop notification
  const showDesktopNotification = useCallback((title, options = {}) => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        ...options
      });

      // Handle notification clicks
      notification.onclick = () => {
        window.focus();
        if (options.onClick) {
          options.onClick();
        }
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing desktop notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    isGranted: permission === 'granted',
    requestPermission,
    showDesktopNotification
  };
};

// Hook for notification sound management
export const useNotificationSounds = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  // Load sound settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('medi-link-sound-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setSoundEnabled(settings.enabled ?? true);
        setVolume(settings.volume ?? 0.5);
      }
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  }, []);

  // Save sound settings
  useEffect(() => {
    try {
      localStorage.setItem('medi-link-sound-settings', JSON.stringify({
        enabled: soundEnabled,
        volume
      }));
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  }, [soundEnabled, volume]);

  // Play notification sound
  const playSound = useCallback((soundType = 'default') => {
    if (!soundEnabled) return;

    const soundFiles = {
      default: '/sounds/notification.mp3',
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3',
      emergency: '/sounds/emergency.mp3',
      appointment: '/sounds/appointment.mp3'
    };

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current = new Audio(soundFiles[soundType] || soundFiles.default);
      audioRef.current.volume = volume;
      audioRef.current.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }, [soundEnabled, volume]);

  // Test sound
  const testSound = useCallback((soundType = 'default') => {
    playSound(soundType);
  }, [playSound]);

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playSound,
    testSound
  };
};

// Hook for emergency notifications
export const useEmergencyNotifications = () => {
  const { 
    addEmergencyAlert, 
    removeEmergencyAlert, 
    emergencyAlerts 
  } = useNotificationContext();
  const { showDesktopNotification } = useDesktopNotifications();
  const { playSound } = useNotificationSounds();

  // Trigger emergency alert
  const triggerEmergencyAlert = useCallback((alertData) => {
    const emergencyId = Date.now() + Math.random();
    
    const alert = {
      id: emergencyId,
      type: 'emergency',
      title: alertData.title || 'Emergency Alert',
      message: alertData.message,
      location: alertData.location,
      priority: 'critical',
      timestamp: new Date().toISOString(),
      data: alertData.data || {}
    };

    // Add to emergency alerts
    addEmergencyAlert(alert);

    // Play emergency sound
    playSound('emergency');

    // Show desktop notification
    showDesktopNotification(alert.title, {
      body: alert.message,
      requireInteraction: true,
      tag: 'emergency',
      icon: '/icons/emergency-icon.png'
    });

    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    return emergencyId;
  }, [addEmergencyAlert, playSound, showDesktopNotification]);

  // Dismiss emergency alert
  const dismissEmergencyAlert = useCallback((alertId) => {
    removeEmergencyAlert(alertId);
  }, [removeEmergencyAlert]);

  // Get active emergency alerts
  const getActiveEmergencyAlerts = useCallback(() => {
    return emergencyAlerts.filter(alert => !alert.dismissed);
  }, [emergencyAlerts]);

  return {
    triggerEmergencyAlert,
    dismissEmergencyAlert,
    getActiveEmergencyAlerts,
    emergencyAlerts,
    hasActiveEmergencies: emergencyAlerts.length > 0
  };
};

// Hook for appointment notifications
export const useAppointmentNotifications = () => {
  const { showAppointmentReminder } = useNotificationContext();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  // Schedule appointment reminder
  const scheduleReminder = useCallback((appointment, reminderTime = 30) => {
    const appointmentDate = new Date(appointment.dateTime);
    const reminderDate = new Date(appointmentDate.getTime() - (reminderTime * 60 * 1000));
    const now = new Date();

    if (reminderDate > now) {
      const timeUntilReminder = reminderDate.getTime() - now.getTime();
      
      setTimeout(() => {
        showAppointmentReminder(appointment, {
          title: 'Appointment Reminder',
          persistent: true,
          actions: [
            { label: 'View Details', action: 'view_appointment' },
            { label: 'Reschedule', action: 'reschedule_appointment' },
            { label: 'Cancel', action: 'cancel_appointment' }
          ]
        });
      }, timeUntilReminder);

      return true;
    }

    return false;
  }, [showAppointmentReminder]);

  // Check for upcoming appointments
  const checkUpcomingAppointments = useCallback(async () => {
    try {
      const response = await fetch('/api/appointments/upcoming');
      const data = await response.json();
      
      if (response.ok) {
        setUpcomingAppointments(data.appointments || []);
        
        // Schedule reminders for upcoming appointments
        data.appointments?.forEach(appointment => {
          scheduleReminder(appointment, 30); // 30 minutes before
          scheduleReminder(appointment, 15); // 15 minutes before
        });
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    }
  }, [scheduleReminder]);

  // Format time until appointment
  const getTimeUntilAppointment = useCallback((appointmentDate) => {
    const now = new Date();
    const appointment = new Date(appointmentDate);
    const diffMs = appointment.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Past due';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    } else {
      return `${diffMins}m`;
    }
  }, []);

  return {
    upcomingAppointments,
    scheduleReminder,
    checkUpcomingAppointments,
    getTimeUntilAppointment
  };
};

// Hook for notification preferences
export const useNotificationPreferences = () => {
  const { settings, updateSettings } = useNotificationContext();
  const [preferences, setPreferences] = useState(settings);

  // Update preferences
  const updatePreferences = useCallback((newPreferences) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    updateSettings(updatedPreferences);
  }, [preferences, updateSettings]);

  // Toggle specific preference
  const togglePreference = useCallback((key) => {
    updatePreferences({ [key]: !preferences[key] });
  }, [preferences, updatePreferences]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    const defaultSettings = {
      enabled: true,
      sound: true,
      desktop: true,
      email: true,
      sms: false,
      emergencyOnly: false,
      maxNotifications: 10,
      autoHide: true,
      autoHideDelay: 5000,
      position: 'top-right'
    };
    updateSettings(defaultSettings);
    setPreferences(defaultSettings);
  }, [updateSettings]);

  return {
    preferences,
    updatePreferences,
    togglePreference,
    resetToDefaults
  };
};

// Hook for notification analytics
export const useNotificationAnalytics = () => {
  const { notifications } = useNotificationContext();
  const [analytics, setAnalytics] = useState({
    totalNotifications: 0,
    readNotifications: 0,
    unreadNotifications: 0,
    notificationsByType: {},
    notificationsByPriority: {},
    averageResponseTime: 0
  });

  useEffect(() => {
    const totalNotifications = notifications.length;
    const readNotifications = notifications.filter(n => n.read).length;
    const unreadNotifications = totalNotifications - readNotifications;

    const notificationsByType = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    const notificationsByPriority = notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {});

    // Calculate average response time for read notifications
    const readNotificationsWithResponseTime = notifications.filter(n => n.read && n.readAt);
    const totalResponseTime = readNotificationsWithResponseTime.reduce((total, notification) => {
      const responseTime = new Date(notification.readAt) - new Date(notification.timestamp);
      return total + responseTime;
    }, 0);
    
    const averageResponseTime = readNotificationsWithResponseTime.length > 0 
      ? totalResponseTime / readNotificationsWithResponseTime.length 
      : 0;

    setAnalytics({
      totalNotifications,
      readNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByPriority,
      averageResponseTime: Math.round(averageResponseTime / 1000) // Convert to seconds
    });
  }, [notifications]);

  return analytics;
};

export default useNotification;