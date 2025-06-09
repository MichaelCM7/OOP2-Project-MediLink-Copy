import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCw, Shield, Bell, Mail, Database, 
  Server, Users, Clock, Globe, Lock, Eye, EyeOff, AlertTriangle,
  CheckCircle, XCircle, Info, Upload, Download
} from 'lucide-react';

const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const [settings, setSettings] = useState({
    general: {
      hospitalName: 'Medi-Link General Hospital',
      hospitalAddress: '123 Healthcare Avenue, Medical City',
      hospitalPhone: '+1-234-567-8900',
      hospitalEmail: 'admin@medilink-hospital.com',
      timezone: 'America/New_York',
      language: 'en',
      currency: 'USD'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      emergencyAlerts: true,
      appointmentReminders: true,
      systemMaintenance: true,
      notificationFrequency: 'immediate'
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: true,
      encryptionLevel: 'AES-256'
    },
    database: {
      backupFrequency: 'daily',
      backupRetention: 30,
      autoBackup: true,
      compressionEnabled: true,
      lastBackup: '2025-06-09 02:00:00'
    },
    integration: {
      apiRateLimit: 1000,
      webhookUrl: 'https://api.medilink.com/webhooks',
      thirdPartyIntegrations: {
        googleMaps: true,
        twilioSMS: true,
        stripePayment: true,
        awsStorage: true
      }
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'System is under maintenance. Please try again later.',
      scheduledMaintenance: '',
      systemVersion: '2.1.4',
      lastUpdate: '2025-06-01'
    }
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const handleNestedInputChange = (section, parentField, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value
        }
      }
    }));
    setUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUnsavedChanges(false);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset logic here
      setUnsavedChanges(false);
      alert('Settings reset to default values.');
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newBackupTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      handleInputChange('database', 'lastBackup', newBackupTime);
      alert('Backup completed successfully!');
    } catch (error) {
      alert('Backup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'integration', label: 'Integrations', icon: Globe },
    { id: 'maintenance', label: 'Maintenance', icon: Server }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
            <p className="text-gray-600">Configure and manage system preferences</p>
          </div>
          <div className="flex space-x-3">
            {unsavedChanges && (
              <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Unsaved changes
              </div>
            )}
            <button
              onClick={handleResetSettings}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={loading || !unsavedChanges}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <div className="bg-white rounded-lg shadow p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                    <input
                      type="text"
                      value={settings.general.hospitalName}
                      onChange={(e) => handleInputChange('general', 'hospitalName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={settings.general.hospitalPhone}
                      onChange={(e) => handleInputChange('general', 'hospitalPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={settings.general.hospitalAddress}
                      onChange={(e) => handleInputChange('general', 'hospitalAddress', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.general.hospitalEmail}
                      onChange={(e) => handleInputChange('general', 'hospitalEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="America/New_York">Eastern Time (UTC-5)</option>
                      <option value="America/Chicago">Central Time (UTC-6)</option>
                      <option value="America/Denver">Mountain Time (UTC-7)</option>
                      <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
                      <option value="Africa/Nairobi">East Africa Time (UTC+3)</option>
                      <option value="Europe/London">Greenwich Mean Time (UTC+0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={settings.general.language}
                      onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="sw">Swahili</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
                        { key: 'smsNotifications', label: 'SMS Notifications', icon: Bell, description: 'Receive text message notifications' },
                        { key: 'pushNotifications', label: 'Push Notifications', icon: Bell, description: 'Browser and mobile push notifications' },
                        { key: 'emergencyAlerts', label: 'Emergency Alerts', icon: AlertTriangle, description: 'Critical emergency system alerts' },
                        { key: 'appointmentReminders', label: 'Appointment Reminders', icon: Clock, description: 'Automated appointment reminders' },
                        { key: 'systemMaintenance', label: 'System Maintenance Alerts', icon: Server, description: 'Maintenance and downtime notifications' }
                      ].map(({ key, label, icon: Icon, description }) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <span className="text-sm font-medium text-gray-700">{label}</span>
                              <p className="text-xs text-gray-500">{description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[key]}
                              onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
                    <select
                      value={settings.notifications.notificationFrequency}
                      onChange={(e) => handleInputChange('notifications', 'notificationFrequency', e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly Digest</option>
                      <option value="daily">Daily Digest</option>
                      <option value="weekly">Weekly Digest</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Choose how often you want to receive notification summaries</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Password Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                        <input
                          type="number"
                          min="6"
                          max="20"
                          value={settings.security.passwordMinLength}
                          onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                        <input
                          type="number"
                          min="5"
                          max="120"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                        <input
                          type="number"
                          min="3"
                          max="10"
                          value={settings.security.maxLoginAttempts}
                          onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Level</label>
                        <select
                          value={settings.security.encryptionLevel}
                          onChange={(e) => handleInputChange('security', 'encryptionLevel', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="AES-128">AES-128</option>
                          <option value="AES-256">AES-256</option>
                          <option value="RSA-2048">RSA-2048</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Security Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Require Special Characters</span>
                          <p className="text-xs text-gray-500">Passwords must contain special characters (!@#$%^&*)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.security.requireSpecialChars}
                            onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Require Numbers</span>
                          <p className="text-xs text-gray-500">Passwords must contain at least one number</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.security.requireNumbers}
                            onChange={(e) => handleInputChange('security', 'requireNumbers', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                          <p className="text-xs text-gray-500">Require SMS or app verification for login</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.security.twoFactorAuth}
                            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeTab === 'database' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Database Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Backup Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                        <select
                          value={settings.database.backupFrequency}
                          onChange={(e) => handleInputChange('database', 'backupFrequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention (days)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={settings.database.backupRetention}
                          onChange={(e) => handleInputChange('database', 'backupRetention', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Backup Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Auto Backup</span>
                          <p className="text-xs text-gray-500">Automatically backup database based on schedule</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.database.autoBackup}
                            onChange={(e) => handleInputChange('database', 'autoBackup', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Compression Enabled</span>
                          <p className="text-xs text-gray-500">Compress backup files to save storage space</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.database.compressionEnabled}
                            onChange={(e) => handleInputChange('database', 'compressionEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Last Backup</p>
                        <p className="text-sm text-gray-500">{settings.database.lastBackup}</p>
                        <p className="text-xs text-gray-400 mt-1">Next backup scheduled for: Tomorrow at 2:00 AM</p>
                      </div>
                      <button
                        onClick={handleBackupNow}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {loading ? 'Backing up...' : 'Backup Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integration Settings */}
            {activeTab === 'integration' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Integration Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">API Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (requests/hour)</label>
                        <input
                          type="number"
                          min="100"
                          max="10000"
                          value={settings.integration.apiRateLimit}
                          onChange={(e) => handleInputChange('integration', 'apiRateLimit', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                        <div className="relative">
                          <input
                            type={showPassword.apiKey ? "text" : "password"}
                            value="mk_live_51H7z2jGzXh8..."
                            readOnly
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('apiKey')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword.apiKey ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                      <input
                        type="url"
                        value={settings.integration.webhookUrl}
                        onChange={(e) => handleInputChange('integration', 'webhookUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://your-webhook-url.com/hook"
                      />
                      <p className="text-sm text-gray-500 mt-1">URL to receive webhook notifications</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Third-Party Integrations</h3>
                    <div className="space-y-4">
                      {[
                        { 
                          key: 'googleMaps', 
                          label: 'Google Maps API', 
                          description: 'Location services and mapping functionality',
                          status: 'Connected'
                        },
                        { 
                          key: 'twilioSMS', 
                          label: 'Twilio SMS', 
                          description: 'SMS notifications and emergency alerts',
                          status: 'Connected'
                        },
                        { 
                          key: 'stripePayment', 
                          label: 'Stripe Payment', 
                          description: 'Payment processing for appointments',
                          status: 'Connected'
                        },
                        { 
                          key: 'awsStorage', 
                          label: 'AWS Storage', 
                          description: 'Cloud storage for medical records and files',
                          status: 'Connected'
                        }
                      ].map(({ key, label, description, status }) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="text-sm font-medium text-gray-700">{label}</h4>
                                <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                  settings.integration.thirdPartyIntegrations[key] 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {settings.integration.thirdPartyIntegrations[key] ? 'Connected' : 'Disconnected'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.integration.thirdPartyIntegrations[key]}
                              onChange={(e) => handleNestedInputChange('integration', 'thirdPartyIntegrations', key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Integration Health</h4>
                        <p className="text-sm text-blue-700 mt-1">All integrations are functioning normally. Last health check: 5 minutes ago.</p>
                        <button className="text-sm text-blue-600 hover:text-blue-800 mt-2 underline">
                          Run Health Check
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Settings */}
            {activeTab === 'maintenance' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Maintenance Settings</h2>
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-red-800">Maintenance Mode</h3>
                          <p className="text-sm text-red-600">Enable to put the system in maintenance mode and restrict user access</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenance.maintenanceMode}
                          onChange={(e) => handleInputChange('maintenance', 'maintenanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                    <textarea
                      value={settings.maintenance.maintenanceMessage}
                      onChange={(e) => handleInputChange('maintenance', 'maintenanceMessage', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Message to display during maintenance..."
                    />
                    <p className="text-sm text-gray-500 mt-1">This message will be shown to users when the system is in maintenance mode</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Maintenance</label>
                    <input
                      type="datetime-local"
                      value={settings.maintenance.scheduledMaintenance}
                      onChange={(e) => handleInputChange('maintenance', 'scheduledMaintenance', e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Schedule maintenance mode to automatically activate at a specific time</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Current Version</p>
                            <p className="text-lg font-semibold text-gray-900">{settings.maintenance.systemVersion}</p>
                          </div>
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Last Update</p>
                            <p className="text-lg font-semibold text-gray-900">{settings.maintenance.lastUpdate}</p>
                          </div>
                          <Clock className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">System Status</p>
                            <p className="text-lg font-semibold text-green-600">Operational</p>
                          </div>
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Uptime</p>
                            <p className="text-lg font-semibold text-gray-900">99.9%</p>
                          </div>
                          <Activity className="h-6 w-6 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Actions</h3>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => alert('Checking for updates...')}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Check for Updates
                      </button>
                      <button 
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={() => alert('Downloading system logs...')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Logs
                      </button>
                      <button 
                        className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        onClick={() => alert('Restarting system services...')}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Restart Services
                      </button>
                      <button 
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to clear all cache? This may temporarily slow down the system.')) {
                            alert('Cache cleared successfully!');
                          }
                        }}
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Clear Cache
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Maintenance Warning</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Enabling maintenance mode will prevent users from accessing the system. 
                          Emergency services will still be available through the emergency hotline.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;