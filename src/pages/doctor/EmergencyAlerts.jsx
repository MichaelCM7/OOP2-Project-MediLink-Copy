import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { emergencyService } from '../../services/emergencyService';
import { locationService } from '../../services/locationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import './EmergencyAlerts.css';

const EmergencyAlerts = () => {
  const { user } = useAuth();
  const audioRef = useRef(null);
  
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  
  // Real-time updates
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'ACTIVE',
    urgency: 'ALL',
    distance: 'ALL',
    timeframe: 'ALL',
    search: ''
  });

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetchEmergencyAlerts();
    initializeAudio();
    requestNotificationPermission();
    
    // Set up real-time updates every 5 seconds for emergency alerts
    const interval = setInterval(fetchEmergencyAlerts, 5000);
    
    // Set up WebSocket connection for real-time alerts
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/emergency-alerts/${user.id}`);
    
    ws.onopen = () => {
      console.log('Emergency alerts WebSocket connected');
    };

    ws.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      handleNewAlert(newAlert);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [user.id]);

  useEffect(() => {
    applyFilters();
  }, [alerts, filters]);

  const initializeAudio = () => {
    audioRef.current = new Audio('/sounds/emergency-alert.mp3');
    audioRef.current.volume = 0.7;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    } else {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const fetchEmergencyAlerts = async () => {
    try {
      if (!loading) setLoading(false); // Only show spinner on initial load
      
      const response = await emergencyService.getEmergencyAlerts();
      const newAlerts = response.data || [];
      
      // Count unread alerts
      const unread = newAlerts.filter(alert => 
        alert.status === 'ACTIVE' && !alert.doctorResponses?.some(res => res.doctorId === user.id)
      ).length;
      
      setAlerts(newAlerts);
      setUnreadCount(unread);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load emergency alerts');
      console.error('Emergency alerts fetch error:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const handleNewAlert = (newAlert) => {
    setAlerts(prev => [newAlert, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Play sound and show notification
    if (soundEnabled) {
      playAlertSound();
    }
    
    if (notificationsEnabled) {
      showNotification(newAlert);
    }
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    // Urgency filter
    if (filters.urgency !== 'ALL') {
      filtered = filtered.filter(alert => alert.urgency === filters.urgency);
    }

    // Distance filter
    if (filters.distance !== 'ALL') {
      const maxDistance = parseInt(filters.distance);
      filtered = filtered.filter(alert => (alert.distance || 0) <= maxDistance);
    }

    // Timeframe filter
    if (filters.timeframe !== 'ALL') {
      const now = new Date();
      const timeLimit = new Date();
      
      switch (filters.timeframe) {
        case 'LAST_HOUR':
          timeLimit.setHours(now.getHours() - 1);
          break;
        case 'LAST_6_HOURS':
          timeLimit.setHours(now.getHours() - 6);
          break;
        case 'TODAY':
          timeLimit.setHours(0, 0, 0, 0);
          break;
        default:
          timeLimit.setTime(0);
      }
      
      filtered = filtered.filter(alert => 
        new Date(alert.createdAt) >= timeLimit
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.description?.toLowerCase().includes(searchTerm) ||
        alert.location?.toLowerCase().includes(searchTerm) ||
        alert.patientName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredAlerts(filtered);
  };

  const playAlertSound = () => {
    if (audioRef.current && soundEnabled) {
      audioRef.current.play().catch(err => {
        console.log('Could not play alert sound:', err);
      });
    }
  };

  const showNotification = (alert) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Emergency Alert', {
        body: `${alert.urgency} - ${alert.description}`,
        icon: '/icons/emergency.png',
        tag: `emergency-${alert.id}`,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        setSelectedAlert(alert);
        setShowDetailsModal(true);
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    }
  };

  const handleRespondToAlert = async (alertId, responseType = 'RESPONDING') => {
    try {
      setResponding(prev => ({ ...prev, [alertId]: true }));
      
      const responseData = {
        doctorId: user.id,
        responseType,
        message: responseMessage,
        estimatedArrival: estimatedArrival || null
      };

      await emergencyService.respondToAlert(alertId, responseData);
      
      setSuccess(`Emergency response ${responseType.toLowerCase()} sent successfully!`);
      setShowResponseModal(false);
      setResponseMessage('');
      setEstimatedArrival('');
      
      // Refresh alerts
      fetchEmergencyAlerts();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to respond to emergency alert');
      console.error('Emergency response error:', err);
    } finally {
      setResponding(prev => ({ ...prev, [alertId]: false }));
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffMinutes = Math.floor((now - alertTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      CRITICAL: '#ff3838',
      HIGH: '#ff6b35',
      MEDIUM: '#f7931e',
      LOW: '#4dabf7'
    };
    return colors[urgency] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: '#28a745',
      RESPONDED: '#ffc107',
      RESOLVED: '#6c757d',
      CANCELLED: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const openResponseModal = (alert) => {
    setSelectedAlert(alert);
    setShowResponseModal(true);
    setResponseMessage('');
    setEstimatedArrival('');
  };

  const markAsRead = async (alertId) => {
    try {
      await emergencyService.markAlertAsRead(alertId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="emergency-alerts">
      <div className="alerts-header">
        <div className="header-info">
          <h1>Emergency Alerts</h1>
          <div className="status-indicators">
            <div className={`online-status ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
            <div className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            {unreadCount > 0 && (
              <div className="unread-badge">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>
        
        <div className="header-controls">
          <button
            className={`sound-toggle ${soundEnabled ? 'enabled' : 'disabled'}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={`${soundEnabled ? 'Disable' : 'Enable'} alert sounds`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          
          <button
            className="refresh-btn"
            onClick={fetchEmergencyAlerts}
            title="Refresh alerts"
          >
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Filters */}
      <div className="alerts-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="RESPONDED">Responded</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Urgency:</label>
          <select
            value={filters.urgency}
            onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
          >
            <option value="ALL">All Urgency</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Distance:</label>
          <select
            value={filters.distance}
            onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
          >
            <option value="ALL">Any Distance</option>
            <option value="1">Within 1km</option>
            <option value="5">Within 5km</option>
            <option value="10">Within 10km</option>
            <option value="20">Within 20km</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Time:</label>
          <select
            value={filters.timeframe}
            onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
          >
            <option value="ALL">All Time</option>
            <option value="LAST_HOUR">Last Hour</option>
            <option value="LAST_6_HOURS">Last 6 Hours</option>
            <option value="TODAY">Today</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <input
            type="text"
            placeholder="Search alerts..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="alerts-stats">
        <div className="stat-card critical">
          <h3>{alerts.filter(a => a.urgency === 'CRITICAL' && a.status === 'ACTIVE').length}</h3>
          <p>Critical Active</p>
        </div>
        <div className="stat-card high">
          <h3>{alerts.filter(a => a.urgency === 'HIGH' && a.status === 'ACTIVE').length}</h3>
          <p>High Priority</p>
        </div>
        <div className="stat-card responded">
          <h3>{alerts.filter(a => a.doctorResponses?.some(r => r.doctorId === user.id)).length}</h3>
          <p>My Responses</p>
        </div>
        <div className="stat-card total">
          <h3>{alerts.length}</h3>
          <p>Total Alerts</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-list">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => {
            const hasResponded = alert.doctorResponses?.some(response => response.doctorId === user.id);
            const isUnread = alert.status === 'ACTIVE' && !hasResponded;
            
            return (
              <div 
                key={alert.id} 
                className={`alert-card ${alert.urgency.toLowerCase()} ${isUnread ? 'unread' : ''}`}
                onClick={() => {
                  setSelectedAlert(alert);
                  setShowDetailsModal(true);
                  if (isUnread) markAsRead(alert.id);
                }}
              >
                <div className="alert-header">
                  <div className="alert-badges">
                    <span 
                      className="urgency-badge"
                      style={{ backgroundColor: getUrgencyColor(alert.urgency) }}
                    >
                      {alert.urgency}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(alert.status) }}
                    >
                      {alert.status}
                    </span>
                    {isUnread && <span className="unread-indicator">NEW</span>}
                  </div>
                  <span className="alert-time">{formatTimeAgo(alert.createdAt)}</span>
                </div>

                <div className="alert-content">
                  <div className="alert-icon">
                    {alert.urgency === 'CRITICAL' && '🚨'}
                    {alert.urgency === 'HIGH' && '⚠️'}
                    {alert.urgency === 'MEDIUM' && '⚡'}
                    {alert.urgency === 'LOW' && 'ℹ️'}
                  </div>
                  
                  <div className="alert-details">
                    <h3>{alert.type || 'Emergency Alert'}</h3>
                    <p className="alert-description">{alert.description}</p>
                    
                    <div className="alert-meta">
                      <span className="location">📍 {alert.location}</span>
                      {alert.distance && (
                        <span className="distance">📏 ~{alert.distance}km away</span>
                      )}
                      {alert.patientName && (
                        <span className="patient">👤 {alert.patientName}</span>
                      )}
                    </div>

                    {hasResponded && (
                      <div className="response-indicator">
                        ✅ You have responded to this alert
                      </div>
                    )}
                  </div>
                </div>

                <div className="alert-actions" onClick={(e) => e.stopPropagation()}>
                  {!hasResponded && alert.status === 'ACTIVE' && (
                    <>
                      <button 
                        className="btn-respond-quick"
                        onClick={() => handleRespondToAlert(alert.id, 'RESPONDING')}
                        disabled={responding[alert.id]}
                      >
                        {responding[alert.id] ? 'Responding...' : 'Quick Respond'}
                      </button>
                      <button 
                        className="btn-respond-detailed"
                        onClick={() => openResponseModal(alert)}
                      >
                        Detailed Response
                      </button>
                    </>
                  )}
                  
                  <button 
                    className="btn-view-details"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowDetailsModal(true);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🆘</div>
            <h3>No emergency alerts</h3>
            <p>
              {filters.status === 'ALL' && filters.urgency === 'ALL' 
                ? 'No emergency alerts at this time' 
                : 'No alerts match your current filters'
              }
            </p>
            {(filters.status !== 'ALL' || filters.urgency !== 'ALL' || filters.search) && (
              <button 
                className="btn-outline"
                onClick={() => setFilters({
                  status: 'ALL',
                  urgency: 'ALL',
                  distance: 'ALL',
                  timeframe: 'ALL',
                  search: ''
                })}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Alert Details Modal */}
      {showDetailsModal && selectedAlert && (
        <Modal onClose={() => setShowDetailsModal(false)} size="large">
          <div className="alert-details-modal">
            <div className="modal-header">
              <h2>Emergency Alert Details</h2>
              <div className="alert-badges">
                <span 
                  className="urgency-badge"
                  style={{ backgroundColor: getUrgencyColor(selectedAlert.urgency) }}
                >
                  {selectedAlert.urgency}
                </span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(selectedAlert.status) }}
                >
                  {selectedAlert.status}
                </span>
              </div>
            </div>

            <div className="modal-content">
              <div className="alert-info">
                <h3>Alert Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Type:</label>
                    <span>{selectedAlert.type || 'Emergency'}</span>
                  </div>
                  <div className="info-item">
                    <label>Description:</label>
                    <span>{selectedAlert.description}</span>
                  </div>
                  <div className="info-item">
                    <label>Location:</label>
                    <span>{selectedAlert.location}</span>
                  </div>
                  <div className="info-item">
                    <label>Time:</label>
                    <span>{new Date(selectedAlert.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedAlert.distance && (
                    <div className="info-item">
                      <label>Distance:</label>
                      <span>~{selectedAlert.distance}km</span>
                    </div>
                  )}
                  {selectedAlert.patientName && (
                    <div className="info-item">
                      <label>Patient:</label>
                      <span>{selectedAlert.patientName}</span>
                    </div>
                  )}
                  {selectedAlert.contactNumber && (
                    <div className="info-item">
                      <label>Contact:</label>
                      <span>{selectedAlert.contactNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedAlert.doctorResponses && selectedAlert.doctorResponses.length > 0 && (
                <div className="responses-section">
                  <h3>Doctor Responses ({selectedAlert.doctorResponses.length})</h3>
                  <div className="responses-list">
                    {selectedAlert.doctorResponses.map((response, index) => (
                      <div key={index} className="response-item">
                        <div className="response-header">
                          <span className="doctor-name">
                            Dr. {response.doctorName}
                            {response.doctorId === user.id && ' (You)'}
                          </span>
                          <span className="response-time">
                            {formatTimeAgo(response.responseTime)}
                          </span>
                        </div>
                        <div className="response-content">
                          <span className="response-type">{response.responseType}</span>
                          {response.message && <p>{response.message}</p>}
                          {response.estimatedArrival && (
                            <span className="eta">ETA: {response.estimatedArrival}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
              
              {selectedAlert.status === 'ACTIVE' && 
               !selectedAlert.doctorResponses?.some(r => r.doctorId === user.id) && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openResponseModal(selectedAlert);
                  }}
                >
                  Respond to Alert
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedAlert && (
        <Modal onClose={() => setShowResponseModal(false)}>
          <div className="response-modal">
            <h3>Respond to Emergency Alert</h3>
            
            <div className="alert-summary">
              <p><strong>Alert:</strong> {selectedAlert.description}</p>
              <p><strong>Location:</strong> {selectedAlert.location}</p>
              <p><strong>Urgency:</strong> {selectedAlert.urgency}</p>
            </div>

            <div className="form-group">
              <label>Response Message</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Provide details about your response..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Estimated Arrival Time (optional)</label>
              <input
                type="text"
                value={estimatedArrival}
                onChange={(e) => setEstimatedArrival(e.target.value)}
                placeholder="e.g., 10 minutes, 30 mins, etc."
              />
            </div>

            <div className="response-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              
              <button 
                className="btn-warning"
                onClick={() => handleRespondToAlert(selectedAlert.id, 'UNABLE')}
                disabled={responding[selectedAlert.id]}
              >
                Unable to Respond
              </button>
              
              <button 
                className="btn-success"
                onClick={() => handleRespondToAlert(selectedAlert.id, 'RESPONDING')}
                disabled={responding[selectedAlert.id]}
              >
                {responding[selectedAlert.id] ? 'Sending...' : 'Confirm Response'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmergencyAlerts;