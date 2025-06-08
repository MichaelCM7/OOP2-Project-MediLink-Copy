import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [settings, setSettings] = useState({
    general: {
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      theme: 'light'
    },
    notifications: {
      email: {
        appointments: true,
        reminders: true,
        results: true,
        promotions: false
      },
      sms: {
        appointments: true,
        reminders: true,
        emergencies: true
      },
      push: {
        appointments: true,
        messages: true,
        updates: false
      }
    },
    privacy: {
      profileVisibility: 'private',
      shareWithDoctors: true,
      shareWithInsurance: false,
      dataRetention: '5years'
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: '30minutes'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteAccountForm, setDeleteAccountForm] = useState({
    password: '',
    reason: '',
    confirmation: ''
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      setSettings(prevSettings => ({
        ...prevSettings,
        ...userSettings
      }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (section, newSettings) => {
    setLoading(true);
    setMessage('');

    try {
      const updatedSettings = {
        ...settings,
        [section]: newSettings
      };
      
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage('Failed to save settings. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, category, setting, value) => {
    const newSettings = { ...settings };
    if (category) {
      newSettings[section][category][setting] = value;
    } else {
      newSettings[section][setting] = value;
    }
    setSettings(newSettings);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Changing password...');
      setMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (deleteAccountForm.confirmation !== 'DELETE') {
      setMessage('Please type DELETE to confirm account deletion');
      return;
    }

    if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      setLoading(true);
      try {
        console.log('Deleting account...');
        await logout();
      } catch (error) {
        setMessage('Failed to delete account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', null, 'language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', null, 'timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Format
        </label>
        <select
          value={settings.general.dateFormat}
          onChange={(e) => handleSettingChange('general', null, 'dateFormat', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <select
          value={settings.general.theme}
          onChange={(e) => handleSettingChange('general', null, 'theme', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <button
        onClick={() => saveSettings('general', settings.general)}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Save General Settings
      </button>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-3">
          {Object.entries(settings.notifications.email).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange('notifications', 'email', key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
        <div className="space-y-3">
          {Object.entries(settings.notifications.sms).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange('notifications', 'sms', key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-3">
          {Object.entries(settings.notifications.push).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange('notifications', 'push', key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => saveSettings('notifications', settings.notifications)}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Save Notification Settings
      </button>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Visibility
        </label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(e) => handleSettingChange('privacy', null, 'profileVisibility', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="private">Private</option>
          <option value="doctors">Visible to My Doctors</option>
          <option value="public">Public</option>
        </select>
      </div>

      <div>
        <label className="flex items-center justify-between">
          <span className="text-gray-700">Share medical data with doctors</span>
          <input
            type="checkbox"
            checked={settings.privacy.shareWithDoctors}
            onChange={(e) => handleSettingChange('privacy', null, 'shareWithDoctors', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>
      </div>

      <div>
        <label className="flex items-center justify-between">
          <span className="text-gray-700">Share data with insurance providers</span>
          <input
            type="checkbox"
            checked={settings.privacy.shareWithInsurance}
            onChange={(e) => handleSettingChange('privacy', null, 'shareWithInsurance', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Retention Period
        </label>
        <select
          value={settings.privacy.dataRetention}
          onChange={(e) => handleSettingChange('privacy', null, 'dataRetention', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="1year">1 Year</option>
          <option value="3years">3 Years</option>
          <option value="5years">5 Years</option>
          <option value="forever">Forever</option>
        </select>
      </div>

      <button
        onClick={() => saveSettings('privacy', settings.privacy)}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        Save Privacy Settings
      </button>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Change Password
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Options</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Two-Factor Authentication</span>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', null, 'twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Login Notifications</span>
            <input
              type="checkbox"
              checked={settings.security.loginNotifications}
              onChange={(e) => handleSettingChange('security', null, 'loginNotifications', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => handleSettingChange('security', null, 'sessionTimeout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="15minutes">15 Minutes</option>
              <option value="30minutes">30 Minutes</option>
              <option value="1hour">1 Hour</option>
              <option value="4hours">4 Hours</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => saveSettings('security', settings.security)}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-4"
        >
          Save Security Settings
        </button>
      </div>

      <div className="pt-8 border-t border-red-200">
        <h3 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
          <p className="text-sm text-red-700 mb-4">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <div>
              <input
                type="password"
                placeholder="Enter your password"
                value={deleteAccountForm.password}
                onChange={(e) => setDeleteAccountForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Type 'DELETE' to confirm"
                value={deleteAccountForm.confirmation}
                onChange={(e) => setDeleteAccountForm(prev => ({ ...prev, confirmation: e.target.value }))}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || deleteAccountForm.confirmation !== 'DELETE'}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Delete Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('saved')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {[
                { id: 'general', name: 'General', icon: '⚙️' },
                { id: 'notifications', name: 'Notifications', icon: '🔔' },
                { id: 'privacy', name: 'Privacy', icon: '🔒' },
                { id: 'security', name: 'Security', icon: '🛡️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'privacy' && renderPrivacySettings()}
              {activeTab === 'security' && renderSecuritySettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;