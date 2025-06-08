import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { searchService } from '../../services/searchService';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularPages, setPopularPages] = useState([]);
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Extract search terms from the current URL
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    if (pathSegments.length > 0) {
      setSearchQuery(pathSegments[pathSegments.length - 1].replace(/[-_]/g, ' '));
    }

    fetchSuggestions();
    loadRecentPages();
  }, [location.pathname]);

  const fetchSuggestions = async () => {
    try {
      const response = await searchService.getPopularPages();
      setPopularPages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      // Fallback to hardcoded popular pages
      setPopularPages([
        { title: 'Find Doctors', path: '/search', description: 'Search for healthcare providers' },
        { title: 'Book Appointment', path: '/appointments', description: 'Schedule your next appointment' },
        { title: 'Emergency Alert', path: '/emergency', description: 'Get immediate medical help' },
        { title: 'Help Center', path: '/help', description: 'Browse our knowledge base' },
        { title: 'Contact Support', path: '/contact', description: 'Get in touch with our team' }
      ]);
    }
  };

  const loadRecentPages = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentPages') || '[]');
      setRecentPages(recent.slice(0, 5));
    } catch (error) {
      console.error('Failed to load recent pages:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Redirect to search with the query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      const response = await searchService.searchSuggestions(query);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    if (!user) {
      return [
        { title: 'Sign Up', path: '/signup', icon: '👤', description: 'Create your account' },
        { title: 'Sign In', path: '/login', icon: '🔐', description: 'Access your account' },
        { title: 'Find Doctors', path: '/search', icon: '👨‍⚕️', description: 'Browse healthcare providers' },
        { title: 'Emergency Help', path: '/emergency', icon: '🚨', description: 'Get immediate assistance' }
      ];
    }

    switch (user.role) {
      case 'PATIENT':
        return [
          { title: 'My Dashboard', path: '/user/dashboard', icon: '📊', description: 'View your overview' },
          { title: 'Find Doctors', path: '/search', icon: '🔍', description: 'Search for providers' },
          { title: 'My Appointments', path: '/user/appointments', icon: '📅', description: 'Manage appointments' },
          { title: 'Medical History', path: '/user/history', icon: '📋', description: 'View your records' }
        ];
      case 'DOCTOR':
        return [
          { title: 'Doctor Dashboard', path: '/doctor/dashboard', icon: '👨‍⚕️', description: 'Your practice overview' },
          { title: 'Patient Records', path: '/doctor/patients', icon: '👥', description: 'Manage patients' },
          { title: 'My Schedule', path: '/doctor/schedule', icon: '📅', description: 'View your calendar' },
          { title: 'Emergency Alerts', path: '/doctor/emergency', icon: '🚨', description: 'Respond to emergencies' }
        ];
      case 'ADMIN':
        return [
          { title: 'Admin Dashboard', path: '/admin/dashboard', icon: '⚙️', description: 'System overview' },
          { title: 'Manage Users', path: '/admin/users', icon: '👥', description: 'User management' },
          { title: 'System Reports', path: '/admin/reports', icon: '📊', description: 'View analytics' },
          { title: 'Settings', path: '/admin/settings', icon: '🔧', description: 'System configuration' }
        ];
      default:
        return [
          { title: 'Home', path: '/', icon: '🏠', description: 'Return to homepage' },
          { title: 'Help Center', path: '/help', icon: '❓', description: 'Get assistance' },
          { title: 'Contact Us', path: '/contact', icon: '📧', description: 'Reach out to support' }
        ];
    }
  };

  const reportBrokenLink = () => {
    const brokenUrl = window.location.href;
    const subject = `Broken Link Report: ${brokenUrl}`;
    const body = `I found a broken link at: ${brokenUrl}\n\nAdditional details:\n- What I was trying to find:\n- How I got to this page:\n- Browser: ${navigator.userAgent}`;
    
    window.location.href = `mailto:support@medilink.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const quickActions = getQuickActions();

  return (
    <div className="not-found">
      <div className="not-found-container">
        {/* Main Error Display */}
        <div className="error-display">
          <div className="error-graphic">
            <div className="error-number">404</div>
            <div className="error-icon">🔍</div>
          </div>
          
          <div className="error-content">
            <h1>Oops! Page Not Found</h1>
            <p className="error-message">
              The page you're looking for seems to have gone missing. 
              Don't worry, we'll help you find what you need!
            </p>
            
            <div className="error-details">
              <span className="current-url">
                <strong>Current URL:</strong> {window.location.pathname}
              </span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <h2>Search for What You Need</h2>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search doctors, appointments, help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button 
                type="submit" 
                className="search-btn"
                disabled={loading}
              >
                {loading ? '🔄' : '🔍'} Search
              </button>
            </div>
          </form>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="search-suggestions">
              <h3>Search Suggestions</h3>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => navigate(suggestion.path)}
                  >
                    <span className="suggestion-title">{suggestion.title}</span>
                    <span className="suggestion-description">{suggestion.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="action-card"
                onClick={() => navigate(action.path)}
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Pages */}
        <div className="popular-pages">
          <h2>Popular Pages</h2>
          <div className="pages-grid">
            {popularPages.map((page, index) => (
              <button
                key={index}
                className="page-card"
                onClick={() => navigate(page.path)}
              >
                <h3>{page.title}</h3>
                <p>{page.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Pages */}
        {recentPages.length > 0 && (
          <div className="recent-pages">
            <h2>Recently Visited</h2>
            <div className="recent-list">
              {recentPages.map((page, index) => (
                <button
                  key={index}
                  className="recent-item"
                  onClick={() => navigate(page.path)}
                >
                  <span className="recent-title">{page.title}</span>
                  <span className="recent-time">{page.timestamp}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="help-section">
          <h2>Need More Help?</h2>
          <div className="help-options">
            <button 
              className="help-option"
              onClick={() => navigate('/contact')}
            >
              <span className="help-icon">💬</span>
              <div className="help-content">
                <h3>Contact Support</h3>
                <p>Get help from our support team</p>
              </div>
            </button>

            <button 
              className="help-option"
              onClick={() => navigate('/help')}
            >
              <span className="help-icon">📚</span>
              <div className="help-content">
                <h3>Help Center</h3>
                <p>Browse our knowledge base</p>
              </div>
            </button>

            <button 
              className="help-option"
              onClick={reportBrokenLink}
            >
              <span className="help-icon">🐛</span>
              <div className="help-content">
                <h3>Report Issue</h3>
                <p>Let us know about this broken link</p>
              </div>
            </button>

            <button 
              className="help-option"
              onClick={() => navigate('/')}
            >
              <span className="help-icon">🏠</span>
              <div className="help-content">
                <h3>Go Home</h3>
                <p>Return to the homepage</p>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="navigation-helper">
          <h3>Try These Navigation Options:</h3>
          <div className="nav-options">
            <button 
              className="nav-option"
              onClick={() => window.history.back()}
            >
              ← Go Back
            </button>
            
            <button 
              className="nav-option"
              onClick={() => navigate('/')}
            >
              🏠 Home
            </button>
            
            {user && (
              <button 
                className="nav-option"
                onClick={() => {
                  if (user.role === 'PATIENT') navigate('/user/dashboard');
                  else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
                  else if (user.role === 'ADMIN') navigate('/admin/dashboard');
                }}
              >
                📊 Dashboard
              </button>
            )}
            
            <button 
              className="nav-option"
              onClick={() => navigate('/search')}
            >
              🔍 Search
            </button>
          </div>
        </div>

        {/* Emergency Section */}
        <div className="emergency-section">
          <div className="emergency-card">
            <div className="emergency-header">
              <span className="emergency-icon">🚨</span>
              <h3>Medical Emergency?</h3>
            </div>
            <p>If you're experiencing a medical emergency, don't waste time searching!</p>
            <div className="emergency-actions">
              <button 
                className="emergency-btn primary"
                onClick={() => navigate('/emergency')}
              >
                Emergency Alert System
              </button>
              <button 
                className="emergency-btn secondary"
                onClick={() => window.open('tel:911')}
              >
                Call 911
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="feedback-section">
          <h3>Help Us Improve</h3>
          <p>
            We're sorry you encountered this error. Your feedback helps us improve the platform.
          </p>
          <div className="feedback-actions">
            <button 
              className="feedback-btn"
              onClick={reportBrokenLink}
            >
              📧 Report This Issue
            </button>
            <button 
              className="feedback-btn"
              onClick={() => navigate('/contact?category=feedback')}
            >
              💭 Send Feedback
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="error-footer">
          <div className="footer-content">
            <div className="error-code-info">
              <h4>Error Details</h4>
              <div className="error-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Error Code:</span>
                  <span className="detail-value">404 - Page Not Found</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Timestamp:</span>
                  <span className="detail-value">{new Date().toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Requested URL:</span>
                  <span className="detail-value">{window.location.pathname}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User Agent:</span>
                  <span className="detail-value">
                    {navigator.userAgent.split(' ').slice(0, 3).join(' ')}...
                  </span>
                </div>
              </div>
            </div>

            <div className="tips-section">
              <h4>💡 Tips to Avoid This Error</h4>
              <ul>
                <li>Check the URL for typos</li>
                <li>Use our search function to find what you need</li>
                <li>Navigate using the menu or breadcrumbs</li>
                <li>Bookmark frequently visited pages</li>
                <li>Contact support if you think this is a mistake</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status Check */}
        <div className="status-check">
          <p>
            <strong>Platform Status:</strong> 
            <span className="status-indicator online">🟢 All systems operational</span>
          </p>
          <small>
            If you're experiencing widespread issues, check our 
            <a href="/status" target="_blank"> status page</a> for updates.
          </small>
        </div>
      </div>
    </div>
  );
};

export default NotFound;