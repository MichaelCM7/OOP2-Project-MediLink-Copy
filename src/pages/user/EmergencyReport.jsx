import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const EmergencyReport = () => {
  const { user, sendEmergencyAlert } = useAuth();
  const [location, setLocation] = useState(null);
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const emergencyTypes = [
    { id: 'medical', name: '🚑 Medical Emergency', color: 'red' },
    { id: 'accident', name: '🚗 Accident', color: 'orange' },
    { id: 'cardiac', name: '💓 Cardiac Event', color: 'red' },
    { id: 'breathing', name: '🫁 Breathing Difficulty', color: 'blue' },
    { id: 'injury', name: '🩹 Serious Injury', color: 'yellow' },
    { id: 'poisoning', name: '☠️ Poisoning', color: 'purple' },
    { id: 'mental', name: '🧠 Mental Health Crisis', color: 'green' },
    { id: 'other', name: '⚠️ Other Emergency', color: 'gray' }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const handleQuickEmergency = async () => {
    setIsSubmitting(true);
    try {
      const alertData = {
        type: 'immediate',
        location: location,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        userInfo: user ? {
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          bloodType: user.bloodType,
          allergies: user.allergies,
          medications: user.medications
        } : null
      };

      const result = await sendEmergencyAlert(alertData);
      if (result.success) {
        setAlertSent(true);
        setTrackingId(result.alertId || 'EMG-' + Math.random().toString(36).substr(2, 9));
      }
    } catch (error) {
      console.error('Emergency alert failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const alertData = {
        type: 'detailed',
        emergencyType,
        description,
        location,
        timestamp: new Date().toISOString(),
        userId: user?.id,
        userInfo: user ? {
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          bloodType: user.bloodType,
          allergies: user.allergies
        } : null
      };

      const result = await sendEmergencyAlert(alertData);
      if (result.success) {
        setAlertSent(true);
        setTrackingId(result.alertId || 'EMG-' + Math.random().toString(36).substr(2, 9));
      }
    } catch (error) {
      console.error('Emergency alert failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alertSent) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">Emergency Alert Sent!</h1>
          <p className="text-gray-600 mb-6">
            Your emergency alert has been successfully sent to nearby hospitals and emergency services.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700">Tracking ID:</p>
            <p className="text-lg font-mono text-blue-600">{trackingId}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <p>• Emergency services have been notified</p>
            <p>• Your location has been shared</p>
            <p>• Medical information has been provided</p>
            <p>• Help is on the way</p>
          </div>

          <button
            onClick={() => {
              setAlertSent(false);
              setEmergencyType('');
              setDescription('');
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Another Alert
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚨</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Emergency Alert</h1>
          <p className="text-gray-700">Get immediate help from nearby medical facilities</p>
        </div>

        {/* Quick Emergency Button */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-red-600 mb-4">🚨 IMMEDIATE EMERGENCY</h2>
          <p className="text-gray-700 mb-6">
            If this is a life-threatening emergency, click the button below to immediately alert nearby hospitals with your location.
          </p>
          <button
            onClick={handleQuickEmergency}
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors font-bold text-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Sending Alert...' : 'SEND EMERGENCY ALERT NOW'}
          </button>
          <p className="text-sm text-gray-500 mt-2 text-center">
            This will share your location and medical information with emergency services
          </p>
        </div>

        {/* Detailed Emergency Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Detailed Emergency Report</h2>
          
          <form onSubmit={handleDetailedSubmit} className="space-y-6">
            {/* Emergency Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type of Emergency *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {emergencyTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEmergencyType(type.id)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      emergencyType === type.id
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description of Emergency *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Please describe what happened, symptoms, or situation..."
                required
              />
            </div>

            {/* Location Status */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">📍 Location Status</h3>
              {location ? (
                <div className="text-sm text-blue-700">
                  <p>✅ Location detected (Accuracy: ~{Math.round(location.accuracy)}m)</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-orange-700">
                  <p>⚠️ Location not available</p>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Try to get location again
                  </button>
                </div>
              )}
            </div>

            {/* User Information Display */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Your Information (will be shared)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {user.firstName} {user.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {user.phone || 'Not provided'}
                  </div>
                  <div>
                    <span className="font-medium">Blood Type:</span> {user.bloodType || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Allergies:</span> {user.allergies || 'None listed'}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!emergencyType || !description || isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending Alert...' : 'Send Detailed Emergency Alert'}
            </button>
          </form>

          {/* Emergency Contacts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl mb-2">🚑</div>
                <p className="font-medium">Emergency Services</p>
                <p className="text-lg font-bold text-red-600">911</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">☠️</div>
                <p className="font-medium">Poison Control</p>
                <p className="text-lg font-bold text-blue-600">1-800-222-1222</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🧠</div>
                <p className="font-medium">Crisis Hotline</p>
                <p className="text-lg font-bold text-green-600">988</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyReport;