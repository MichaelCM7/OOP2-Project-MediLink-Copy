import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';
import { emergencyService } from '../../services/emergencyService';
import './EmergencyButton.css';

const EmergencyButton = ({ 
  size = 'large', 
  variant = 'primary', 
  showText = true, 
  className = '',
  onEmergencyTriggered 
}) => {
  const { user } = useAuth();
  const { getCurrentLocation } = useLocation();
  
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            triggerEmergencyAlert();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleEmergencyPress = async () => {
    if (isLoading) return;

    // If not authenticated, show guest emergency form
    if (!user) {
      setShowConfirmation(true);
      return;
    }

    // Start countdown for authenticated users
    setIsPressed(true);
    setCountdown(5);
    setError('');

    try {
      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (err) {
      console.warn('Could not get location:', err);
      // Continue without location
    }
  };

  const handleCancel = () => {
    setIsPressed(false);
    setCountdown(0);
    setShowConfirmation(false);
    setError('');
  };

  const triggerEmergencyAlert = async () => {
    setIsLoading(true);
    setCountdown(0);

    try {
      const emergencyData = {
        userId: user?.id || null,
        location: location || null,
        timestamp: new Date().toISOString(),
        type: 'GENERAL_EMERGENCY',
        priority: 'CRITICAL'
      };

      const response = await emergencyService.triggerEmergencyAlert(emergencyData);
      
      // Call callback if provided
      if (onEmergencyTriggered) {
        onEmergencyTriggered(response.data);
      }

      // Reset state
      setIsPressed(false);
      setShowConfirmation(false);

    } catch (err) {
      setError('Failed to send emergency alert. Please try again or call 911.');
      console.error('Emergency alert failed:', err);
      setIsPressed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestEmergency = () => {
    // For guest users, redirect to emergency form or call 911
    setShowConfirmation(false);
    if (onEmergencyTriggered) {
      onEmergencyTriggered({ isGuest: true });
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 'emergency-btn-small';
      case 'medium':
        return 'emergency-btn-medium';
      case 'large':
        return 'emergency-btn-large';
      case 'extra-large':
        return 'emergency-btn-xl';
      default:
        return 'emergency-btn-large';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'primary':
        return 'emergency-primary';
      case 'secondary':
        return 'emergency-secondary';
      case 'minimal':
        return 'emergency-minimal';
      default:
        return 'emergency-primary';
    }
  };

  return (
    <>
      <div className={`emergency-button-container ${className}`}>
        <button
          className={`emergency-btn ${getButtonSize()} ${getButtonVariant()} ${
            isPressed ? 'pressed' : ''
          } ${isLoading ? 'loading' : ''}`}
          onClick={handleEmergencyPress}
          disabled={isLoading}
          aria-label="Emergency Alert Button"
        >
          <div className="emergency-btn-content">
            {/* Pulse Animation Ring */}
            <div className={`pulse-ring ${isPressed || isLoading ? 'active' : ''}`}></div>
            
            {/* Emergency Icon */}
            <div className="emergency-icon">
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <span className="icon">🚨</span>
              )}
            </div>

            {/* Text Content */}
            {showText && (
              <div className="emergency-text">
                {isPressed && countdown > 0 ? (
                  <div className="countdown-text">
                    <span className="countdown-number">{countdown}</span>
                    <span className="countdown-label">Sending Alert...</span>
                  </div>
                ) : isLoading ? (
                  <span className="loading-text">Alerting Emergency Services...</span>
                ) : (
                  <>
                    <span className="primary-text">EMERGENCY</span>
                    <span className="secondary-text">
                      {size === 'small' ? 'Alert' : 'Press for immediate help'}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Countdown Progress */}
            {isPressed && countdown > 0 && (
              <div className="countdown-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${((5 - countdown) / 5) * 100}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        </button>

        {/* Cancel Button during countdown */}
        {isPressed && countdown > 0 && (
          <button 
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="emergency-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button 
              className="retry-btn"
              onClick={() => window.open('tel:911')}
            >
              Call 911
            </button>
          </div>
        )}

        {/* Location Status */}
        {isPressed && (
          <div className="location-status">
            {location ? (
              <span className="location-found">
                📍 Location detected
              </span>
            ) : (
              <span className="location-searching">
                📍 Detecting location...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Guest Confirmation Modal */}
      {showConfirmation && !user && (
        <div className="emergency-modal-overlay">
          <div className="emergency-modal">
            <div className="modal-header">
              <h2>Emergency Alert</h2>
              <span className="emergency-icon-large">🚨</span>
            </div>
            
            <div className="modal-content">
              <p className="modal-message">
                You're not signed in. For immediate emergency assistance:
              </p>
              
              <div className="emergency-options">
                <button 
                  className="emergency-option call-911"
                  onClick={() => window.open('tel:911')}
                >
                  <span className="option-icon">📞</span>
                  <div className="option-content">
                    <h3>Call 911</h3>
                    <p>For immediate emergency services</p>
                  </div>
                </button>

                <button 
                  className="emergency-option guest-alert"
                  onClick={handleGuestEmergency}
                >
                  <span className="option-icon">🚨</span>
                  <div className="option-content">
                    <h3>Send Alert</h3>
                    <p>Alert nearby healthcare providers</p>
                  </div>
                </button>
              </div>

              <div className="modal-footer">
                <p className="disclaimer">
                  <strong>Note:</strong> For life-threatening emergencies, 
                  always call 911 first.
                </p>
              </div>
            </div>

            <button 
              className="modal-close"
              onClick={handleCancel}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isLoading && (
        <div className="emergency-modal-overlay">
          <div className="emergency-modal success">
            <div className="modal-header">
              <h2>Emergency Alert Sent</h2>
              <span className="success-icon">✅</span>
            </div>
            
            <div className="modal-content">
              <p>Your emergency alert has been sent to nearby healthcare providers.</p>
              
              <div className="alert-details">
                <div className="detail-item">
                  <span className="detail-icon">🕒</span>
                  <span>Sent: {new Date().toLocaleTimeString()}</span>
                </div>
                {location && (
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span>Location: Included</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-icon">👨‍⚕️</span>
                  <span>Nearby providers notified</span>
                </div>
              </div>

              <div className="next-steps">
                <h4>What happens next:</h4>
                <ul>
                  <li>Nearby healthcare providers have been alerted</li>
                  <li>Emergency services may contact you</li>
                  <li>Stay calm and follow any instructions given</li>
                  <li>Keep your phone accessible</li>
                </ul>
              </div>

              <div className="emergency-contacts">
                <h4>Emergency Contacts:</h4>
                <button 
                  className="contact-btn"
                  onClick={() => window.open('tel:911')}
                >
                  📞 Call 911
                </button>
                <button 
                  className="contact-btn"
                  onClick={() => window.open('tel:+15551234567')}
                >
                  🏥 Emergency Hotline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyButton;