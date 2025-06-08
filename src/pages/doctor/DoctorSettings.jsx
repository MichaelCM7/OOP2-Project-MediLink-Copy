import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doctorService } from '../../services/doctorService';
import { notificationService } from '../../services/notificationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import './DoctorSettings.css';

const DoctorSettings = () => {
  const { user, logout } = useAuth();
  
  const [settings, setSettings] = useState({
    // Account Settings
    twoFactorAuth: false,
    emailVerified: false,
    phoneVerified: false,
    
    // Notification Preferences
    emailNotifications: {
      newAppointments: true,
      appointmentReminders: true,
      appointmentCancellations: true,
      emergencyAlerts: true,
      patientMessages: true,
      systemUpdates: false,
      marketingEmails: false
    },
    
    smsNotifications: {
      emergencyAlerts: true,
      appointmentReminders: true,
      appointmentChanges: true,
      systemAlerts: false
    },
    
    pushNotifications: {
      enabled: true,
      newAppointments: true,
      emergencyAlerts: true,
      patientMessages: true,
      reminders: true
    },
    
    // Appointment Settings
    appointmentSettings: {
      autoAcceptBookings: false,
      requireApproval: true,
      advanceBookingDays: 30,
      cancellationHours: 24,
      defaultDuration: 30,
      bufferTime: 15,
      maxDailyAppointments: 20,
      allowEmergencyBookings: true
    },
    
    // Privacy Settings
    privacySettings: {
      showOnlineStatus: true,
      allowPatientReviews: true,
      shareProfilePublicly: true,
      showRatingsPublicly: true,
      allowDirectMessages: true,
      showAvailabilityPublicly: true
    },
    
    // Professional Settings
    professionalSettings: {
      consultationTypes: ['In-Person', 'Video Call', 'Phone Call'],
      specialties: [],
      languages: [],
      acceptedPaymentMethods: ['Insurance', 'Cash', 'Credit Card'],
      telemedicineEnabled: false,
      homeVisitsEnabled: false
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchSettings();
    requestNotificationPermission();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getSettings();
      setSettings(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (err) {
      setError('Failed to load settings');
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleArrayToggle = (category, setting, item) => {
    setSettings(prev => {
      const currentArray = prev[category][setting];
      const updatedArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: updatedArray
        }
      };
    });
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError('');
      
      await doctorService.updateSettings(settings);
      setSuccess('Settings updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/\d/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('one special character');
    return errors;
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      const passwordErrors = validatePassword(passwordData.newPassword);
      if (passwordErrors.length > 0) {
        setError(`Password must contain ${passwordErrors.join(', ')}`);
        return;
      }

      setSaving(true);
      setError('');

      await doctorService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    try {
      setSaving(true);
      await doctorService.deleteAccount();
      logout();
    } catch (err) {
      setError('Failed to delete account');
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await doctorService.exportData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `doctor-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccess('Data exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const handle2FASetup = async () => {
    try {
      if (settings.twoFactorAuth) {
        // Disable 2FA
        await doctorService.disable2FA();
        handleSettingChange('root', 'twoFactorAuth', false);
        setSuccess('Two-factor authentication disabled');
      } else {
        // Enable 2FA
        const response = await doctorService.enable2FA();
        // In a real app, you'd show QR code and verify
        handleSettingChange('root', 'twoFactorAuth', true);
        setSuccess('Two-factor authentication enabled');
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update two-factor authentication');
    }
  };

  const renderAccountSettings = () => (
    <div className="settings-section">
      <h3>Account Security</h3>
      
      <div className="setting-item">
        <div className="setting-info">
          <h4>Password</h4>
          <p>Change your account password</p>
        </div>
        <button 
          className="btn-outline"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Two-Factor Authentication</h4>
          <p>Add an extra layer of security to your account</p>
        </div>
        <div className="setting-controls">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={handle2FASetup}
            />
            <span className="slider"></span>
          </label>
          <span className={`status-badge ${settings.twoFactorAuth ? 'enabled' : 'disabled'}`}>
            {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Email Verification</h4>
          <p>Verify your email address for security</p>
          <span className={`verification-status ${settings.emailVerified ? 'verified' : 'pending'}`}>
            {settings.emailVerified ? '✓ Verified' : '⚠ Pending'}
          </span>
        </div>
        {!settings.emailVerified && (
          <button 
            className="btn-outline"
            onClick={async () => {
              try {
                await doctorService.sendEmailVerification();
                setSuccess('Verification email sent!');
                setTimeout(() => setSuccess(''), 3000);
              } catch (err) {
                setError('Failed to send verification email');
              }
            }}
          >
            Send Verification
          </button>
        )}
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Phone Verification</h4>
          <p>Verify your phone number for SMS notifications</p>
          <span className={`verification-status ${settings.phoneVerified ? 'verified' : 'pending'}`}>
            {settings.phoneVerified ? '✓ Verified' : '⚠ Pending'}
          </span>
        </div>
        {!settings.phoneVerified && (
          <button 
            className="btn-outline"
            onClick={async () => {
              try {
                await doctorService.sendPhoneVerification();
                setSuccess('Verification SMS sent!');
                setTimeout(() => setSuccess(''), 3000);
              } catch (err) {
                setError('Failed to send verification SMS');
              }
            }}
          >
            Verify Phone
          </button>
        )}
      </div>

      <h3>Data & Privacy</h3>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Export Data</h4>
          <p>Download a copy of your account data</p>
        </div>
        <button 
          className="btn-outline"
          onClick={handleExportData}
        >
          Export Data
        </button>
      </div>

      <div className="setting-item danger-zone">
        <div className="setting-info">
          <h4>Delete Account</h4>
          <p>Permanently delete your account and all data</p>
        </div>
        <button 
          className="btn-danger"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Email Notifications</h3>
      {Object.entries(settings.emailNotifications).map(([key, value]) => (
        <div key={key} className="setting-item">
          <div className="setting-info">
            <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
            <p>{getNotificationDescription(key, 'email')}</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('emailNotifications', key, e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      ))}

      <h3>SMS Notifications</h3>
      {Object.entries(settings.smsNotifications).map(([key, value]) => (
        <div key={key} className="setting-item">
          <div className="setting-info">
            <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
            <p>{getNotificationDescription(key, 'sms')}</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('smsNotifications', key, e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      ))}

      <h3>Push Notifications</h3>
      <div className="notification-permission">
        {Notification.permission === 'denied' && (
          <div className="permission-warning">
            ⚠️ Browser notifications are blocked. Enable them in your browser settings.
          </div>
        )}
      </div>
      
      {Object.entries(settings.pushNotifications).map(([key, value]) => (
        <div key={key} className="setting-item">
          <div className="setting-info">
            <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
            <p>{getNotificationDescription(key, 'push')}</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('pushNotifications', key, e.target.checked)}
              disabled={Notification.permission === 'denied'}
            />
            <span className="slider"></span>
          </label>
        </div>
      ))}
    </div>
  );

  const renderAppointmentSettings = () => (
    <div className="settings-section">
      <h3>Booking Preferences</h3>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Auto-Accept Bookings</h4>
          <p>Automatically approve appointment requests that fit your schedule</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.appointmentSettings.autoAcceptBookings}
            onChange={(e) => handleSettingChange('appointmentSettings', 'autoAcceptBookings', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Advance Booking Days</h4>
          <p>How far in advance patients can book appointments</p>
        </div>
        <select
          value={settings.appointmentSettings.advanceBookingDays}
          onChange={(e) => handleSettingChange('appointmentSettings', 'advanceBookingDays', parseInt(e.target.value))}
          className="setting-select"
        >
          <option value={7}>1 Week</option>
          <option value={14}>2 Weeks</option>
          <option value={30}>1 Month</option>
          <option value={60}>2 Months</option>
          <option value={90}>3 Months</option>
        </select>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Cancellation Notice (Hours)</h4>
          <p>Minimum notice required for appointment cancellations</p>
        </div>
        <select
          value={settings.appointmentSettings.cancellationHours}
          onChange={(e) => handleSettingChange('appointmentSettings', 'cancellationHours', parseInt(e.target.value))}
          className="setting-select"
        >
          <option value={2}>2 Hours</option>
          <option value={4}>4 Hours</option>
          <option value={12}>12 Hours</option>
          <option value={24}>24 Hours</option>
          <option value={48}>48 Hours</option>
        </select>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Default Appointment Duration</h4>
          <p>Standard length for new appointments</p>
        </div>
        <select
          value={settings.appointmentSettings.defaultDuration}
          onChange={(e) => handleSettingChange('appointmentSettings', 'defaultDuration', parseInt(e.target.value))}
          className="setting-select"
        >
          <option value={15}>15 Minutes</option>
          <option value={30}>30 Minutes</option>
          <option value={45}>45 Minutes</option>
          <option value={60}>1 Hour</option>
          <option value={90}>1.5 Hours</option>
        </select>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Buffer Time Between Appointments</h4>
          <p>Break time between consecutive appointments</p>
        </div>
        <select
          value={settings.appointmentSettings.bufferTime}
          onChange={(e) => handleSettingChange('appointmentSettings', 'bufferTime', parseInt(e.target.value))}
          className="setting-select"
        >
          <option value={0}>No Buffer</option>
          <option value={5}>5 Minutes</option>
          <option value={10}>10 Minutes</option>
          <option value={15}>15 Minutes</option>
          <option value={30}>30 Minutes</option>
        </select>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Maximum Daily Appointments</h4>
          <p>Limit the number of appointments you can have per day</p>
        </div>
        <input
          type="number"
          min="1"
          max="50"
          value={settings.appointmentSettings.maxDailyAppointments}
          onChange={(e) => handleSettingChange('appointmentSettings', 'maxDailyAppointments', parseInt(e.target.value))}
          className="setting-input"
        />
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Allow Emergency Bookings</h4>
          <p>Accept urgent appointment requests outside normal hours</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.appointmentSettings.allowEmergencyBookings}
            onChange={(e) => handleSettingChange('appointmentSettings', 'allowEmergencyBookings', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <h3>Profile Visibility</h3>

      {Object.entries(settings.privacySettings).map(([key, value]) => (
        <div key={key} className="setting-item">
          <div className="setting-info">
            <h4>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
            <p>{getPrivacyDescription(key)}</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('privacySettings', key, e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      ))}
    </div>
  );

  const renderProfessionalSettings = () => (
    <div className="settings-section">
      <h3>Services Offered</h3>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Telemedicine</h4>
          <p>Offer video consultations to patients remotely</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.professionalSettings.telemedicineEnabled}
            onChange={(e) => handleSettingChange('professionalSettings', 'telemedicineEnabled', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>Home Visits</h4>
          <p>Provide medical care at patient's home</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={settings.professionalSettings.homeVisitsEnabled}
            onChange={(e) => handleSettingChange('professionalSettings', 'homeVisitsEnabled', e.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <h3>Consultation Types</h3>
      <div className="consultation-types">
        {['In-Person', 'Video Call', 'Phone Call', 'Chat'].map(type => (
          <div key={type} className="setting-item">
            <div className="setting-info">
              <h4>{type}</h4>
              <p>Allow {type.toLowerCase()} consultations</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.professionalSettings.consultationTypes.includes(type)}
                onChange={() => handleArrayToggle('professionalSettings', 'consultationTypes', type)}
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>

      <h3>Payment Methods</h3>
      <div className="payment-methods">
        {['Insurance', 'Cash', 'Credit Card', 'Debit Card', 'Digital Payment', 'Bank Transfer'].map(method => (
          <div key={method} className="setting-item">
            <div className="setting-info">
              <h4>{method}</h4>
              <p>Accept {method.toLowerCase()} payments</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.professionalSettings.acceptedPaymentMethods.includes(method)}
                onChange={() => handleArrayToggle('professionalSettings', 'acceptedPaymentMethods', method)}
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const getNotificationDescription = (key, type) => {
    const descriptions = {
      email: {
        newAppointments: 'Get notified when patients book new appointments',
        appointmentReminders: 'Receive reminders before upcoming appointments',
        appointmentCancellations: 'Get notified when appointments are cancelled',
        emergencyAlerts: 'Receive emergency alerts and urgent requests',
        patientMessages: 'Get notified of new patient messages',
        systemUpdates: 'Receive system updates and maintenance notifications',
        marketingEmails: 'Receive promotional emails and newsletters'
      },
      sms: {
        emergencyAlerts: 'Get SMS for urgent emergency situations',
        appointmentReminders: 'Receive SMS reminders for appointments',
        appointmentChanges: 'Get SMS when appointments are modified',
        systemAlerts: 'Receive SMS for critical system alerts'
      },
      push: {
        enabled: 'Enable push notifications in your browser',
        newAppointments: 'Get instant notifications for new bookings',
        emergencyAlerts: 'Receive immediate emergency alerts',
        patientMessages: 'Get notified of patient messages instantly',
        reminders: 'Receive push notifications for reminders'
      }
    };
    return descriptions[type]?.[key] || '';
  };

  const getPrivacyDescription = (key) => {
    const descriptions = {
      showOnlineStatus: 'Let patients see when you are online and available',
      allowPatientReviews: 'Allow patients to leave reviews and ratings for your services',
      shareProfilePublicly: 'Make your profile visible in public doctor searches',
      showRatingsPublicly: 'Display your ratings and reviews on your public profile',
      allowDirectMessages: 'Allow patients to send you direct messages',
      showAvailabilityPublicly: 'Show your availability calendar in public listings'
    };
    return descriptions[key] || '';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="doctor-settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <button 
          className="btn-primary"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
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

      <div className="settings-container">
        {/* Tab Navigation */}
        <div className="settings-nav">
          <button 
            className={`nav-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            🔐 Account
          </button>
          <button 
            className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button 
            className={`nav-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📅 Appointments
          </button>
          <button 
            className={`nav-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Privacy
          </button>
          <button 
            className={`nav-btn ${activeTab === 'professional' ? 'active' : ''}`}
            onClick={() => setActiveTab('professional')}
          >
            👨‍⚕️ Professional
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'appointments' && renderAppointmentSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}
          {activeTab === 'professional' && renderProfessionalSettings()}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <Modal onClose={() => setShowPasswordModal(false)}>
          <div className="password-modal">
            <h3>Change Password</h3>
            
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                placeholder="Enter new password"
              />
              <small>Must contain at least 8 characters, uppercase, lowercase, number, and special character</small>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                placeholder="Confirm new password"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handlePasswordChange}
                disabled={saving}
              >
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="delete-modal">
            <h3>Delete Account</h3>
            <p className="warning-text">
              ⚠️ This action cannot be undone. All your data, appointments, and patient records will be permanently deleted.
            </p>
            
            <div className="form-group">
              <label>Type "DELETE MY ACCOUNT" to confirm:</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={handleAccountDeletion}
                disabled={saving || deleteConfirmText !== 'DELETE MY ACCOUNT'}
              >
                {saving ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DoctorSettings;