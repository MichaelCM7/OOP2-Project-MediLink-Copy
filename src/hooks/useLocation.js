import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';

// Geolocation options
const DEFAULT_GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000, // 10 seconds
  maximumAge: 300000 // 5 minutes
};

// Main geolocation hook
export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const watchId = useRef(null);

  const geolocationOptions = {
    ...DEFAULT_GEOLOCATION_OPTIONS,
    ...options
  };

  // Get current position
  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser');
      setError(error);
      return { success: false, error };
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setLocation(locationData);
          setAccuracy(position.coords.accuracy);
          setTimestamp(position.timestamp);
          setIsLoading(false);
          
          resolve({ success: true, location: locationData });
        },
        (error) => {
          setError(error);
          setIsLoading(false);
          resolve({ success: false, error });
        },
        geolocationOptions
      );
    });
  }, [geolocationOptions]);

  // Watch position changes
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported'));
      return;
    }

    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        setLocation(locationData);
        setAccuracy(position.coords.accuracy);
        setTimestamp(position.timestamp);
        setError(null);
      },
      (error) => {
        setError(error);
      },
      geolocationOptions
    );
  }, [geolocationOptions]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location,
    error,
    isLoading,
    accuracy,
    timestamp,
    getCurrentPosition,
    startWatching,
    stopWatching,
    isSupported: !!navigator.geolocation
  };
};

// Hook for distance calculations
export const useDistanceCalculation = () => {
  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((point1, point2, unit = 'km') => {
    if (!point1 || !point2) return null;

    const R = unit === 'miles' ? 3959 : 6371; // Earth's radius in miles or km
    const dLat = toRadians(point2.lat - point1.lat);
    const dLng = toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }, []);

  // Calculate distances to multiple points
  const calculateDistances = useCallback((userLocation, destinations, unit = 'km') => {
    if (!userLocation || !destinations) return [];

    return destinations.map(destination => ({
      ...destination,
      distance: calculateDistance(userLocation, destination, unit),
      distanceText: formatDistance(calculateDistance(userLocation, destination, unit), unit)
    }));
  }, [calculateDistance]);

  // Sort by distance
  const sortByDistance = useCallback((userLocation, destinations, unit = 'km') => {
    const withDistances = calculateDistances(userLocation, destinations, unit);
    return withDistances.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [calculateDistances]);

  // Helper functions
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  
  const formatDistance = (distance, unit) => {
    if (!distance) return 'Unknown distance';
    
    if (unit === 'km') {
      return distance < 1 
        ? `${Math.round(distance * 1000)}m` 
        : `${distance}km`;
    } else {
      return distance < 1 
        ? `${Math.round(distance * 5280)}ft` 
        : `${distance} miles`;
    }
  };

  return {
    calculateDistance,
    calculateDistances,
    sortByDistance,
    formatDistance
  };
};

// Hook for address/location search and geocoding
export const useLocationSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  // Geocode address to coordinates
  const geocodeAddress = useCallback(async (address) => {
    setIsSearching(true);
    setError(null);

    try {
      // Using a geocoding service (you might want to use Google Maps API or similar)
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, location: data.location };
      } else {
        throw new Error(data.message || 'Geocoding failed');
      }
    } catch (error) {
      setError(error);
      return { success: false, error: error.message };
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback(async (lat, lng) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, address: data.address };
      } else {
        throw new Error(data.message || 'Reverse geocoding failed');
      }
    } catch (error) {
      setError(error);
      return { success: false, error: error.message };
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Search for places/addresses
  const searchPlaces = useCallback(async (query, options = {}) => {
    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        ...options
      });

      const response = await fetch(`/api/places/search?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.results || []);
        return { success: true, results: data.results };
      } else {
        throw new Error(data.message || 'Place search failed');
      }
    } catch (error) {
      setError(error);
      setSearchResults([]);
      return { success: false, error: error.message };
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    isSearching,
    searchResults,
    error,
    geocodeAddress,
    reverseGeocode,
    searchPlaces
  };
};

// Hook for nearby places (hospitals, pharmacies, etc.)
export const useNearbyPlaces = () => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { calculateDistances } = useDistanceCalculation();

  const findNearbyPlaces = useCallback(async (location, type = 'hospital', radius = 10) => {
    if (!location) {
      setError(new Error('Location is required'));
      return { success: false, error: 'Location is required' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: location.lat,
        lng: location.lng,
        type,
        radius: radius * 1000 // Convert km to meters
      });

      const response = await fetch(`/api/places/nearby?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        // Add distance information to each place
        const placesWithDistance = calculateDistances(location, data.places || []);
        setPlaces(placesWithDistance);
        return { success: true, places: placesWithDistance };
      } else {
        throw new Error(data.message || 'Failed to find nearby places');
      }
    } catch (error) {
      setError(error);
      setPlaces([]);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [calculateDistances]);

  return {
    places,
    isLoading,
    error,
    findNearbyPlaces
  };
};

// Hook for location permissions and settings
export const useLocationPermissions = () => {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isChecking, setIsChecking] = useState(false);
  const { showWarning, showError } = useNotification();

  // Check current permission status
  const checkPermissions = useCallback(async () => {
    setIsChecking(true);

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        // Listen for permission changes
        permission.onchange = () => {
          setPermissionStatus(permission.state);
        };
      } else {
        // Fallback for browsers that don't support permissions API
        setPermissionStatus('unknown');
      }
    } catch (error) {
      console.error('Error checking location permissions:', error);
      setPermissionStatus('unknown');
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Request location permission
  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      showError('Location Error', 'Geolocation is not supported by this browser');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionStatus('granted');
          resolve(true);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setPermissionStatus('denied');
              showWarning(
                'Location Permission Denied',
                'Please enable location access in your browser settings to use location-based features.'
              );
              break;
            case error.POSITION_UNAVAILABLE:
              showError('Location Error', 'Location information is unavailable.');
              break;
            case error.TIMEOUT:
              showError('Location Error', 'Location request timed out.');
              break;
          }
          resolve(false);
        },
        { timeout: 5000 }
      );
    });
  }, [showError, showWarning]);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissionStatus,
    isChecking,
    checkPermissions,
    requestPermission,
    isGranted: permissionStatus === 'granted',
    isDenied: permissionStatus === 'denied'
  };
};

// Hook for location-based emergency services
export const useEmergencyLocation = () => {
  const { getCurrentPosition } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 5000
  });
  const { findNearbyPlaces } = useNearbyPlaces();
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const findNearestEmergencyServices = useCallback(async () => {
    setIsLoading(true);

    try {
      // Get current location
      const locationResult = await getCurrentPosition();
      
      if (!locationResult.success) {
        throw new Error('Unable to get current location');
      }

      // Find nearby hospitals with emergency services
      const hospitalResult = await findNearbyPlaces(
        locationResult.location,
        'emergency_hospital',
        25 // 25km radius for emergency services
      );

      if (hospitalResult.success) {
        // Sort by distance and filter for 24/7 emergency services
        const emergencyHospitals = hospitalResult.places
          .filter(place => place.emergencyServices && place.isOpen24Hours)
          .slice(0, 5); // Get top 5 nearest

        setEmergencyServices(emergencyHospitals);
        return { success: true, services: emergencyHospitals };
      } else {
        throw new Error('Unable to find emergency services');
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentPosition, findNearbyPlaces]);

  // Send emergency location to services
  const sendEmergencyLocation = useCallback(async (emergencyType = 'medical') => {
    const locationResult = await getCurrentPosition();
    
    if (!locationResult.success) {
      return { success: false, error: 'Unable to get location' };
    }

    try {
      const response = await fetch('/api/emergency/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: locationResult.location,
          emergencyType,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, emergencyId: data.emergencyId };
      } else {
        throw new Error(data.message || 'Failed to send emergency location');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [getCurrentPosition]);

  return {
    emergencyServices,
    isLoading,
    findNearestEmergencyServices,
    sendEmergencyLocation
  };
};

// Hook for saved locations
export const useSavedLocations = () => {
  const [savedLocations, setSavedLocations] = useState([]);

  // Load saved locations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('medi-link-saved-locations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved locations:', error);
    }
  }, []);

  // Save location
  const saveLocation = useCallback((location) => {
    const newLocation = {
      id: Date.now(),
      ...location,
      savedAt: new Date().toISOString()
    };

    const updatedLocations = [...savedLocations, newLocation];
    setSavedLocations(updatedLocations);
    
    try {
      localStorage.setItem('medi-link-saved-locations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error saving location:', error);
    }

    return newLocation;
  }, [savedLocations]);

  // Remove saved location
  const removeLocation = useCallback((locationId) => {
    const updatedLocations = savedLocations.filter(loc => loc.id !== locationId);
    setSavedLocations(updatedLocations);
    
    try {
      localStorage.setItem('medi-link-saved-locations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error removing location:', error);
    }
  }, [savedLocations]);

  // Update saved location
  const updateLocation = useCallback((locationId, updates) => {
    const updatedLocations = savedLocations.map(loc =>
      loc.id === locationId ? { ...loc, ...updates } : loc
    );
    setSavedLocations(updatedLocations);
    
    try {
      localStorage.setItem('medi-link-saved-locations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, [savedLocations]);

  return {
    savedLocations,
    saveLocation,
    removeLocation,
    updateLocation
  };
};

export default useGeolocation;