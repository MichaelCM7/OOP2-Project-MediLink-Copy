import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';
import { useTheme } from '../../context/ThemeContext';

const AdminProfile = () => {
  const { user, updateUser } = useAuth();
  const { get, put, upload } = useApi();
  const { showSuccess, showError } = useNotification();
  const { theme } = useTheme();

  // State management
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    employeeId: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    bio: '',
    profilePicture: null
  });
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferencesData, setPreferencesData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    emergencyAlerts: true,
    systemUpdates: true,
    appointmentReminders: true,
    language: 'en',
    timezone: 'Africa/Nairobi',
    theme: 'light',
    autoLogout: 30
  });
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileErrors, setProfileErrors] = useState({});
  const [securityErrors, setSecurityErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: '👤' },
    { id: 'security', label: 'Security Settings', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'activity', label: 'Activity Log', icon: '📊' }
  ];

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  // Fetch admin profile data
  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const result = await get('/admin/profile');
      
      if (result.success) {
        setProfileData(result.data.profile || {});
        setPreferencesData(result.data.preferences || preferencesData);
        setActivityData(result.data.activities || []);
      } else {
        setMockProfileData();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMockProfileData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const setMockProfileData = () => {
    const mockProfile = {
      name: user?.name || 'Administrator',
      email: user?.email || 'admin@medilink.com',
      phone: '+254-700-123456',
      role: 'Super Administrator',
      department: 'Administration',
      employeeId: 'ADM-001',
      joiningDate: '2023-01-15',
      address: '123 Admin Street, Nairobi',
      emergencyContact: '+254-700-987654',
      bio: 'Experienced healthcare administrator with over 10 years in hospital management and digital health systems.',
      profilePicture: '/api/placeholder/150/150'
    };

    const mockActivities = [
      {
        id: 1,
        action: 'Approved doctor registration',
        details: 'Dr. Sarah Johnson - Cardiology',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'approval',
        ip: '192.168.1.100'
      },
      {
        id: 2,
        action: 'Updated system settings',
        details: 'Modified emergency alert configuration',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        type: 'configuration',
        ip: '192.168.1.100'
      },
      {
        id: 3,
        action: 'Generated monthly report',
        details: 'Hospital performance report for May 2025',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        type: 'report',
        ip: '192.168.1.100'
      },
      {
        id: 4,
        action: 'User login',
        details: 'Successful login from desktop',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        type: 'authentication',
        ip: '192.168.1.100'
      },
      {
        id: 5,
        action: 'Staff status update',
        details: 'Activated Mary Kiprotich after maternity leave',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        type: 'staff_management',
        ip: '192.168.1.100'
      }
    ];

    setProfileData(mockProfile);
    setActivityData(mockActivities);
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileData.name.trim()) errors.name = 'Name is required';
    if (!profileData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profileData.email)) errors.email = 'Email is invalid';
    if (!profileData.phone.trim()) errors.phone = 'Phone is required';
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate security form
  const validateSecurityForm = () => {
    const errors = {};
    
    if (!securityData.currentPassword) errors.currentPassword = 'Current password is required';
    if (!securityData.newPassword) errors.newPassword = 'New password is required';
    else if (securityData.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (securityData.newPassword !== securityData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setSecurityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    setIsUpdating(true);
    try {
      const result = await put('/admin/profile', profileData);
      
      if (result.success) {
        showSuccess('Profile Updated', 'Your profile has been updated successfully');
        // Update user context if needed
        updateUser(profileData);
      } else {
        showError('Update Failed', result.error || 'Failed to update profile');
      }
    } catch (error) {
      showError('Update Failed', 'Network error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle security update
  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateSecurityForm()) return;

    setIsUpdating(true);
    try {
      const result = await put('/admin/security', {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      });
      
      if (result.success) {
        showSuccess('Password Updated', 'Your password has been changed successfully');
        setSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        showError('Update Failed', result.error || 'Failed to update password');
      }
    } catch (error) {
      showError('Update Failed', 'Network error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle preferences update
  const handlePreferencesUpdate = async () => {
    setIsUpdating(true);
    try {
      const result = await put('/admin/preferences', preferencesData);
      
      if (result.success) {
        showSuccess('Preferences Updated', 'Your preferences have been saved');
      } else {
        showError('Update Failed', result.error || 'Failed to update preferences');
      }
    } catch (error) {
      showError('Update Failed', 'Network error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showError('Invalid File', 'Please select a JPEG, PNG, or GIF image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showError('File Too Large', 'Please select an image under 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await upload('/admin/profile/picture', file);
      
      if (result.success) {
        setProfileData(prev => ({ ...prev, profilePicture: result.data.url }));
        showSuccess('Image Updated', 'Profile picture updated successfully');
      } else {
        showError('Upload Failed', result.error || 'Failed to upload image');
      }
    } catch (error) {
      showError('Upload Failed', 'Network error occurred');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return time.toLocaleDateString();
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    const icons = {
      approval: '✅',
      configuration: '⚙️',
      report: '📊',
      authentication: '🔐',
      staff_management: '👥',
      emergency: '🚨',
      system: '💻'
    };
    return icons[type] || '📝';
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: theme.colors.text }}>
          Admin Profile
        </h1>
        <p style={{ margin: 0, color: theme.colors.textSecondary }}>
          Manage your personal information, security settings, and preferences
        </p>
      </div>

      {/* Profile Summary Card */}
      <div style={{
        backgroundColor: theme.colors.card,
        padding: '30px',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        marginBottom: '30px',
        boxShadow: theme.shadows.small
      }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          {/* Profile Picture */}
          <div style={{ position: 'relative' }}>
            <img
              src={profileData.profilePicture || '/api/placeholder/120/120'}
              alt="Profile"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `4px solid ${theme.colors.primary}`
              }}
            />
            <label
              htmlFor="profile-picture-upload"
              style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid white',
                fontSize: '14px'
              }}
            >
              📷
            </label>
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {isUploadingImage && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px'
              }}>
                Uploading...
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 10px 0', color: theme.colors.text }}>
              {profileData.name}
            </h2>
            <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: theme.colors.textSecondary }}>
              {profileData.role} • {profileData.department}
            </p>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textMuted }}>
              📧 {profileData.email}
            </p>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: theme.colors.textMuted }}>
              📞 {profileData.phone}
            </p>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: `${theme.colors.success}20`,
              color: theme.colors.success,
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Active Administrator
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
                {Math.floor((Date.now() - new Date(profileData.joiningDate)) / (1000 * 60 * 60 * 24))}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Days Active</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: theme.colors.text }}>
                {activityData.length}
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>Recent Actions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `2px solid ${theme.colors.border}`,
        marginBottom: '30px',
        gap: '10px'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? theme.colors.primary : theme.colors.textSecondary,
              borderBottom: `3px solid ${activeTab === tab.id ? theme.colors.primary : 'transparent'}`,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        backgroundColor: theme.colors.card,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        padding: '30px'
      }}>
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
              Personal Information
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${profileErrors.name ? '#e74c3c' : theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {profileErrors.name && (
                  <span style={{ fontSize: '12px', color: '#e74c3c' }}>{profileErrors.name}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${profileErrors.email ? '#e74c3c' : theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {profileErrors.email && (
                  <span style={{ fontSize: '12px', color: '#e74c3c' }}>{profileErrors.email}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${profileErrors.phone ? '#e74c3c' : theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                {profileErrors.phone && (
                  <span style={{ fontSize: '12px', color: '#e74c3c' }}>{profileErrors.phone}</span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Employee ID
                </label>
                <input
                  type="text"
                  value={profileData.employeeId}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textMuted
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={profileData.department}
                  onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Emergency Contact
                </label>
                <input
                  type="tel"
                  value={profileData.emergencyContact}
                  onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                Address
              </label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: isUpdating ? 0.7 : 1
              }}
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
              Change Password
            </h3>
            
            <form onSubmit={handleSecurityUpdate}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${securityErrors.currentPassword ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  {securityErrors.currentPassword && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{securityErrors.currentPassword}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${securityErrors.newPassword ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  {securityErrors.newPassword && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{securityErrors.newPassword}</span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: `1px solid ${securityErrors.confirmPassword ? '#e74c3c' : theme.colors.border}`,
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  {securityErrors.confirmPassword && (
                    <span style={{ fontSize: '12px', color: '#e74c3c' }}>{securityErrors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                style={{
                  padding: '12px 24px',
                  backgroundColor: theme.colors.warning,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: isUpdating ? 0.7 : 1
                }}
              >
                {isUpdating ? 'Updating...' : 'Change Password'}
              </button>
            </form>

            {/* Two-Factor Authentication */}
            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: theme.colors.surface, borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.colors.text }}>
                Two-Factor Authentication
              </h4>
              <p style={{ margin: '0 0 15px 0', color: theme.colors.textSecondary }}>
                Add an extra layer of security to your account
              </p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: theme.colors.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Enable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
              Notification Preferences
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                { key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Receive critical emergency notifications' },
                { key: 'systemUpdates', label: 'System Updates', description: 'Receive system maintenance notifications' },
                { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Receive appointment-related notifications' }
              ].map((pref) => (
                <div key={pref.key} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  backgroundColor: theme.colors.surface,
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{pref.label}</div>
                    <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>{pref.description}</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={preferencesData[pref.key]}
                      onChange={(e) => setPreferencesData(prev => ({ ...prev, [pref.key]: e.target.checked }))}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: preferencesData[pref.key] ? theme.colors.primary : '#ccc',
                      borderRadius: '24px',
                      transition: '0.4s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: preferencesData[pref.key] ? '29px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.4s'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>

            <h4 style={{ margin: '30px 0 20px 0', color: theme.colors.text }}>
              System Preferences
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Language
                </label>
                <select
                  value={preferencesData.language}
                  onChange={(e) => setPreferencesData(prev => ({ ...prev, language: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Timezone
                </label>
                <select
                  value={preferencesData.timezone}
                  onChange={(e) => setPreferencesData(prev => ({ ...prev, timezone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">London Time</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                  Auto Logout (minutes)
                </label>
                <select
                  value={preferencesData.autoLogout}
                  onChange={(e) => setPreferencesData(prev => ({ ...prev, autoLogout: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>
            </div>

            <button
              onClick={handlePreferencesUpdate}
              disabled={isUpdating}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: isUpdating ? 0.7 : 1
              }}
            >
              {isUpdating ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div>
            <h3 style={{ margin: '0 0 20px 0', color: theme.colors.text }}>
              Recent Activity
            </h3>
            
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {activityData.map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    display: 'flex',
                    gap: '15px',
                    padding: '15px',
                    marginBottom: '10px',
                    backgroundColor: theme.colors.surface,
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.borderLight}`
                  }}
                >
                  <div style={{
                    fontSize: '20px',
                    backgroundColor: `${theme.colors.primary}20`,
                    padding: '8px',
                    borderRadius: '8px',
                    height: 'fit-content'
                  }}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 5px 0', color: theme.colors.text }}>
                      {activity.action}
                    </h5>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: theme.colors.textSecondary }}>
                      {activity.details}
                    </p>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: theme.colors.textMuted }}>
                      <span>🕒 {formatTimeAgo(activity.timestamp)}</span>
                      <span>🌐 {activity.ip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;