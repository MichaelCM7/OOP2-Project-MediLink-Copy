import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';
import './Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [activeItem, setActiveItem] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [notifications, setNotifications] = useState({
    unreadCount: 0,
    emergencyAlerts: 0,
    appointmentRequests: 0,
    messages: 0
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Set active item based on current path
    const path = location.pathname;
    setActiveItem(path);

    // Fetch notification counts
    fetchNotifications();

    // Set up real-time notification updates
    const interval = setInterval(fetchNotifications, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotificationCounts();
      setNotifications(response.data || notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleItemClick = (path, hasSubItems = false) => {
    if (hasSubItems) {
      toggleGroup(path);
    } else {
      setActiveItem(path);
      navigate(path);
    }
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        path: `/${user.role.toLowerCase()}/dashboard`,
        notification: null
      }
    ];

    switch (user.role) {
      case 'PATIENT':
        return [
          ...baseItems,
          {
            key: 'appointments',
            label: 'Appointments',
            icon: '📅',
            path: '/user/appointments',
            notification: notifications.appointmentRequests > 0 ? notifications.appointmentRequests : null,
            subItems: [
              { key: 'book-appointment', label: 'Book New', path: '/user/appointments/book' },
              { key: 'upcoming', label: 'Upcoming', path: '/user/appointments/upcoming' },
              { key: 'history', label: 'History', path: '/user/appointments/history' }
            ]
          },
          {
            key: 'find-doctors',
            label: 'Find Doctors',
            icon: '👨‍⚕️',
            path: '/search',
            notification: null
          },
          {
            key: 'medical-records',
            label: 'Medical Records',
            icon: '📋',
            path: '/user/medical-records',
            notification: null,
            subItems: [
              { key: 'history', label: 'Medical History', path: '/user/medical-records/history' },
              { key: 'prescriptions', label: 'Prescriptions', path: '/user/medical-records/prescriptions' },
              { key: 'lab-results', label: 'Lab Results', path: '/user/medical-records/lab-results' },
              { key: 'documents', label: 'Documents', path: '/user/medical-records/documents' }
            ]
          },
          {
            key: 'messages',
            label: 'Messages',
            icon: '💬',
            path: '/user/messages',
            notification: notifications.messages > 0 ? notifications.messages : null
          },
          {
            key: 'insurance',
            label: 'Insurance',
            icon: '🛡️',
            path: '/user/insurance',
            notification: null
          },
          {
            key: 'emergency',
            label: 'Emergency Alert',
            icon: '🚨',
            path: '/emergency',
            notification: null,
            className: 'emergency-item'
          }
        ];

      case 'DOCTOR':
        return [
          ...baseItems,
          {
            key: 'appointments',
            label: 'Appointments',
            icon: '📅',
            path: '/doctor/appointments',
            notification: notifications.appointmentRequests > 0 ? notifications.appointmentRequests : null,
            subItems: [
              { key: 'today', label: 'Today', path: '/doctor/appointments/today' },
              { key: 'upcoming', label: 'Upcoming', path: '/doctor/appointments/upcoming' },
              { key: 'requests', label: 'Requests', path: '/doctor/appointments/requests' }
            ]
          },
          {
            key: 'patients',
            label: 'Patients',
            icon: '👥',
            path: '/doctor/patients',
            notification: null,
            subItems: [
              { key: 'all-patients', label: 'All Patients', path: '/doctor/patients' },
              { key: 'add-patient', label: 'Add Patient', path: '/doctor/patients/add' },
              { key: 'patient-requests', label: 'Patient Requests', path: '/doctor/patient-requests' }
            ]
          },
          {
            key: 'schedule',
            label: 'My Schedule',
            icon: '🗓️',
            path: '/doctor/schedule',
            notification: null
          },
          {
            key: 'emergency-alerts',
            label: 'Emergency Alerts',
            icon: '🚨',
            path: '/doctor/emergency-alerts',
            notification: notifications.emergencyAlerts > 0 ? notifications.emergencyAlerts : null,
            className: 'emergency-item'
          },
          {
            key: 'ratings',
            label: 'My Ratings',
            icon: '⭐',
            path: '/doctor/ratings',
            notification: null
          },
          {
            key: 'earnings',
            label: 'Earnings',
            icon: '💰',
            path: '/doctor/earnings',
            notification: null
          }
        ];

      case 'ADMIN':
        return [
          ...baseItems,
          {
            key: 'users',
            label: 'User Management',
            icon: '👥',
            path: '/admin/users',
            notification: null,
            subItems: [
              { key: 'patients', label: 'Patients', path: '/admin/users/patients' },
              { key: 'doctors', label: 'Doctors', path: '/admin/users/doctors' },
              { key: 'admins', label: 'Administrators', path: '/admin/users/admins' },
              { key: 'pending', label: 'Pending Approval', path: '/admin/users/pending' }
            ]
          },
          {
            key: 'hospitals',
            label: 'Hospitals',
            icon: '🏥',
            path: '/admin/hospitals',
            notification: null
          },
          {
            key: 'appointments',
            label: 'Appointments',
            icon: '📅',
            path: '/admin/appointments',
            notification: null
          },
          {
            key: 'emergency-system',
            label: 'Emergency System',
            icon: '🚨',
            path: '/admin/emergency',
            notification: notifications.emergencyAlerts > 0 ? notifications.emergencyAlerts : null,
            className: 'emergency-item'
          },
          {
            key: 'analytics',
            label: 'Analytics',
            icon: '📈',
            path: '/admin/analytics',
            notification: null,
            subItems: [
              { key: 'overview', label: 'Overview', path: '/admin/analytics/overview' },
              { key: 'users', label: 'User Analytics', path: '/admin/analytics/users' },
              { key: 'appointments', label: 'Appointments', path: '/admin/analytics/appointments' },
              { key: 'revenue', label: 'Revenue', path: '/admin/analytics/revenue' }
            ]
          },
          {
            key: 'system-settings',
            label: 'System Settings',
            icon: '⚙️',
            path: '/admin/settings',
            notification: null
          }
        ];

      default:
        return baseItems;
    }
  };

  const renderNavigationItem = (item, isSubItem = false) => {
    const isActive = activeItem === item.path || (item.subItems && item.subItems.some(sub => activeItem === sub.path));
    const isExpanded = expandedGroups[item.key];
    const hasSubItems = item.subItems && item.subItems.length > 0;

    return (
      <div key={item.key} className={`nav-item-container ${isSubItem ? 'sub-item-container' : ''}`}>
        <div
          className={`nav-item ${isActive ? 'active' : ''} ${item.className || ''} ${isSubItem ? 'sub-item' : ''}`}
          onClick={() => handleItemClick(item.path, hasSubItems)}
        >
          <div className="nav-item-content">
            {!isSubItem && (
              <span className="nav-icon">{item.icon}</span>
            )}
            
            {!isCollapsed && (
              <span className="nav-label">{item.label}</span>
            )}
            
            {item.notification && (
              <span className="notification-badge">
                {item.notification > 99 ? '99+' : item.notification}
              </span>
            )}
            
            {hasSubItems && !isCollapsed && (
              <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                ▼
              </span>
            )}
          </div>
        </div>

        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="sub-items">
            {item.subItems.map(subItem => renderNavigationItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🏥</div>
            {!isCollapsed && (
              <div className="logo-text">
                <h2>Medi-Link</h2>
                <span className="version">v2.0</span>
              </div>
            )}
          </div>
          
          <button 
            className="collapse-btn"
            onClick={onToggle}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '▶️' : '◀️'}
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="user-profile">
            <div className="user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              )}
              {notifications.unreadCount > 0 && (
                <div className="profile-notification">
                  {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                </div>
              )}
            </div>
            
            {!isCollapsed && (
              <div className="user-info">
                <h3>{user.firstName} {user.lastName}</h3>
                <p className="user-role">
                  {user.role === 'PATIENT' && '👤 Patient'}
                  {user.role === 'DOCTOR' && '👨‍⚕️ Doctor'}
                  {user.role === 'ADMIN' && '⚙️ Administrator'}
                </p>
                {user.specialization && (
                  <p className="user-specialty">{user.specialization}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-items">
            {navigationItems.map(item => renderNavigationItem(item))}
          </div>
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <div className="quick-action-buttons">
              {user?.role === 'PATIENT' && (
                <>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate('/user/appointments/book')}
                  >
                    📅 Book Appointment
                  </button>
                  <button 
                    className="quick-action-btn emergency"
                    onClick={() => navigate('/emergency')}
                  >
                    🚨 Emergency
                  </button>
                </>
              )}
              
              {user?.role === 'DOCTOR' && (
                <>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate('/doctor/patients/add')}
                  >
                    👤 Add Patient
                  </button>
                  <button 
                    className="quick-action-btn emergency"
                    onClick={() => navigate('/doctor/emergency-alerts')}
                  >
                    🚨 Emergency Alerts
                  </button>
                </>
              )}
              
              {user?.role === 'ADMIN' && (
                <>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate('/admin/users/pending')}
                  >
                    ✅ Approve Users
                  </button>
                  <button 
                    className="quick-action-btn"
                    onClick={() => navigate('/admin/analytics')}
                  >
                    📊 View Reports
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <>
              <div className="footer-links">
                <Link to="/help" className="footer-link">
                  ❓ Help
                </Link>
                <Link to="/contact" className="footer-link">
                  📧 Support
                </Link>
                <Link to={`/${user?.role?.toLowerCase()}/settings`} className="footer-link">
                  ⚙️ Settings
                </Link>
              </div>
              
              <button 
                className="logout-btn"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <span className="logout-icon">🔓</span>
                <span>Sign Out</span>
              </button>
            </>
          )}
          
          {isCollapsed && (
            <div className="collapsed-footer">
              <button 
                className="icon-btn"
                onClick={() => navigate('/help')}
                title="Help"
              >
                ❓
              </button>
              <button 
                className="icon-btn"
                onClick={() => navigate(`/${user?.role?.toLowerCase()}/settings`)}
                title="Settings"
              >
                ⚙️
              </button>
              <button 
                className="icon-btn logout"
                onClick={() => setShowLogoutConfirm(true)}
                title="Sign Out"
              >
                🔓
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="modal-header">
              <h3>Confirm Sign Out</h3>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to sign out of your account?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;