import React, { useState, useEffect, useRef } from 'react';

const EmergencyTracker = ({ emergencyId, onClose }) => {
  const [emergencyData, setEmergencyData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [statusHistory, setStatusHistory] = useState([]);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const intervalRef = useRef(null);

  // Emergency status options
  const STATUS_TYPES = {
    PENDING: 'pending',
    DISPATCHED: 'dispatched',
    EN_ROUTE: 'en_route',
    ARRIVED: 'arrived',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  };

  const STATUS_MESSAGES = {
    pending: 'Emergency request received. Finding nearest ambulance...',
    dispatched: 'Ambulance dispatched. Help is on the way!',
    en_route: 'Ambulance is en route to your location.',
    arrived: 'Ambulance has arrived at your location.',
    completed: 'Emergency response completed.',
    cancelled: 'Emergency request was cancelled.'
  };

  // Initialize emergency tracking
  useEffect(() => {
    if (emergencyId) {
      fetchEmergencyData();
      getCurrentLocation();
      startRealTimeTracking();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [emergencyId]);

  // Fetch initial emergency data
  const fetchEmergencyData = async () => {
    try {
      const response = await fetch(`/api/emergency/${emergencyId}`);
      const data = await response.json();
      
      setEmergencyData(data);
      setStatusHistory(data.statusHistory || []);
      setNearbyHospitals(data.nearbyHospitals || []);
      setSelectedHospital(data.assignedHospital);
      
      if (data.ambulance && data.ambulance.location) {
        setAmbulanceLocation(data.ambulance.location);
      }
    } catch (error) {
      console.error('Error fetching emergency data:', error);
      setMockEmergencyData();
    }
  };

  // Mock data for development/testing
  const setMockEmergencyData = () => {
    const mockData = {
      id: emergencyId,
      status: STATUS_TYPES.EN_ROUTE,
      createdAt: new Date().toISOString(),
      patientName: 'John Doe',
      emergencyType: 'Medical Emergency',
      priority: 'High',
      assignedHospital: {
        id: 1,
        name: 'City General Hospital',
        address: '123 Health Street, Nairobi',
        phone: '+254-700-123456',
        distance: '2.3 km'
      },
      ambulance: {
        id: 'AMB-001',
        driverName: 'Dr. Sarah Johnson',
        phone: '+254-700-789012',
        location: { lat: -1.2921, lng: 36.8219 }
      }
    };

    setEmergencyData(mockData);
    setSelectedHospital(mockData.assignedHospital);
    setAmbulanceLocation(mockData.ambulance.location);
    
    const mockHistory = [
      { status: STATUS_TYPES.PENDING, timestamp: new Date(Date.now() - 300000).toISOString() },
      { status: STATUS_TYPES.DISPATCHED, timestamp: new Date(Date.now() - 240000).toISOString() },
      { status: STATUS_TYPES.EN_ROUTE, timestamp: new Date(Date.now() - 120000).toISOString() }
    ];
    setStatusHistory(mockHistory);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation({ lat: -1.2921, lng: 36.8219 });
        }
      );
    }
  };

  // Start real-time tracking updates
  const startRealTimeTracking = () => {
    intervalRef.current = setInterval(() => {
      updateEmergencyStatus();
      updateAmbulanceLocation();
    }, 30000); // Update every 30 seconds
  };

  // Update emergency status
  const updateEmergencyStatus = async () => {
    try {
      const response = await fetch(`/api/emergency/${emergencyId}/status`);
      const data = await response.json();
      
      if (data.status !== emergencyData?.status) {
        setEmergencyData(prev => ({ ...prev, status: data.status }));
        setStatusHistory(prev => [...prev, {
          status: data.status,
          timestamp: new Date().toISOString()
        }]);
      }
      
      if (data.estimatedArrival) {
        setEstimatedArrival(data.estimatedArrival);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Update ambulance location
  const updateAmbulanceLocation = async () => {
    try {
      const response = await fetch(`/api/emergency/${emergencyId}/ambulance/location`);
      const data = await response.json();
      
      if (data.location) {
        setAmbulanceLocation(data.location);
      }
    } catch (error) {
      console.error('Error updating ambulance location:', error);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Cancel emergency request
  const cancelEmergency = async () => {
    if (window.confirm('Are you sure you want to cancel this emergency request?')) {
      try {
        await fetch(`/api/emergency/${emergencyId}/cancel`, {
          method: 'POST'
        });
        setEmergencyData(prev => ({ ...prev, status: STATUS_TYPES.CANCELLED }));
        setIsTracking(false);
      } catch (error) {
        console.error('Error cancelling emergency:', error);
      }
    }
  };

  // Contact functions
  const contactAmbulance = () => {
    if (emergencyData?.ambulance?.phone) {
      window.open(`tel:${emergencyData.ambulance.phone}`);
    }
  };

  const contactHospital = () => {
    if (selectedHospital?.phone) {
      window.open(`tel:${selectedHospital.phone}`);
    }
  };

  if (!emergencyData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading emergency details...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Emergency Tracking</h2>
          <p>ID: #{emergencyData.id}</p>
        </div>
        <button onClick={onClose}>Close</button>
      </div>

      {/* Current Status */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{emergencyData.status.replace('_', ' ').toUpperCase()}</h3>
        <p>{STATUS_MESSAGES[emergencyData.status]}</p>
        {estimatedArrival && <p>ETA: {estimatedArrival} minutes</p>}
      </div>

      {/* Emergency Details */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
        <h4>Emergency Information</h4>
        <p><strong>Type:</strong> {emergencyData.emergencyType}</p>
        <p><strong>Priority:</strong> {emergencyData.priority}</p>
        <p><strong>Requested:</strong> {formatTime(emergencyData.createdAt)}</p>
      </div>

      {/* Assigned Hospital */}
      {selectedHospital && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
          <h4>Assigned Hospital</h4>
          <p><strong>{selectedHospital.name}</strong></p>
          <p>{selectedHospital.address}</p>
          <p>Distance: {selectedHospital.distance}</p>
          <button onClick={contactHospital}>Call Hospital</button>
        </div>
      )}

      {/* Ambulance Info */}
      {emergencyData.ambulance && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
          <h4>Ambulance Details</h4>
          <p><strong>Unit:</strong> {emergencyData.ambulance.id}</p>
          <p><strong>Paramedic:</strong> {emergencyData.ambulance.driverName}</p>
          {userLocation && ambulanceLocation && (
            <p><strong>Distance:</strong> {
              calculateDistance(
                userLocation.lat, userLocation.lng,
                ambulanceLocation.lat, ambulanceLocation.lng
              )
            } km away</p>
          )}
          <button onClick={contactAmbulance}>Call Ambulance</button>
        </div>
      )}

      {/* Status History */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
        <h4>Status Updates</h4>
        {statusHistory.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <span>{item.status.replace('_', ' ').toUpperCase()}</span>
            <span>{formatTime(item.timestamp)}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {emergencyData.status !== STATUS_TYPES.COMPLETED && 
         emergencyData.status !== STATUS_TYPES.CANCELLED && (
          <button onClick={cancelEmergency} style={{ background: '#e74c3c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}>
            Cancel Emergency
          </button>
        )}
        <button onClick={fetchEmergencyData} style={{ background: '#3498db', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px' }}>
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default EmergencyTracker;