import React, { useState, useEffect, useRef } from 'react';

const LocationMap = ({ 
  userLocation, 
  destinations = [], 
  showUserLocation = true, 
  showDirections = false,
  mapHeight = '400px',
  mapWidth = '100%',
  onLocationSelect,
  onMapLoad,
  zoom = 13,
  mapType = 'roadmap' // roadmap, satellite, hybrid, terrain
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(userLocation);

  // Initialize Google Maps
  useEffect(() => {
    initializeMap();
  }, []);

  // Update map when userLocation changes
  useEffect(() => {
    if (userLocation && map) {
      setCurrentLocation(userLocation);
      updateUserLocationMarker(userLocation);
      if (destinations.length === 0) {
        map.setCenter(userLocation);
      }
    }
  }, [userLocation, map]);

  // Update destinations when they change
  useEffect(() => {
    if (map && destinations) {
      updateDestinationMarkers();
      if (destinations.length > 0) {
        fitMapToBounds();
      }
    }
  }, [destinations, map]);

  // Initialize the map
  const initializeMap = async () => {
    try {
      // Check if Google Maps is loaded
      if (!window.google) {
        await loadGoogleMapsScript();
      }

      const defaultCenter = currentLocation || { lat: -1.2921, lng: 36.8219 }; // Nairobi
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        mapTypeId: mapType,
        styles: getMapStyles(),
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      });

      setMap(mapInstance);
      
      // Initialize directions service
      const dirService = new window.google.maps.DirectionsService();
      const dirRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        draggable: true
      });
      
      setDirectionsService(dirService);
      setDirectionsRenderer(dirRenderer);
      dirRenderer.setMap(mapInstance);

      // Add click listener
      mapInstance.addListener('click', (event) => {
        if (onLocationSelect) {
          onLocationSelect({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          });
        }
      });

      setIsLoading(false);
      
      if (onMapLoad) {
        onMapLoad(mapInstance);
      }

      // Get current location if not provided
      if (!currentLocation && showUserLocation) {
        getCurrentLocation();
      }

    } catch (err) {
      setError('Failed to load map');
      setIsLoading(false);
      console.error('Map initialization error:', err);
    }
  };

  // Load Google Maps script dynamically
  const loadGoogleMapsScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      
      document.head.appendChild(script);
    });
  };

  // Get current user location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          if (map) {
            map.setCenter(location);
            updateUserLocationMarker(location);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  };

  // Update user location marker
  const updateUserLocationMarker = (location) => {
    // Remove existing user marker
    markers.forEach(marker => {
      if (marker.type === 'user') {
        marker.setMap(null);
      }
    });

    if (!showUserLocation) return;

    // Create new user marker
    const userMarker = new window.google.maps.Marker({
      position: location,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      },
      animation: window.google.maps.Animation.DROP
    });

    userMarker.type = 'user';
    setMarkers(prev => [...prev.filter(m => m.type !== 'user'), userMarker]);

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h4 style="margin: 0 0 5px 0; color: #333;">Your Location</h4>
          <p style="margin: 0; color: #666; font-size: 12px;">
            Lat: ${location.lat.toFixed(6)}<br/>
            Lng: ${location.lng.toFixed(6)}
          </p>
        </div>
      `
    });

    userMarker.addListener('click', () => {
      infoWindow.open(map, userMarker);
    });
  };

  // Update destination markers
  const updateDestinationMarkers = () => {
    // Clear existing destination markers
    markers.forEach(marker => {
      if (marker.type === 'destination') {
        marker.setMap(null);
      }
    });

    const newMarkers = destinations.map((dest, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: dest.lat, lng: dest.lng },
        map: map,
        title: dest.name || `Location ${index + 1}`,
        icon: getDestinationIcon(dest.type || 'default'),
        animation: window.google.maps.Animation.DROP
      });

      marker.type = 'destination';

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(dest)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(prev => [...prev.filter(m => m.type !== 'destination'), ...newMarkers]);
  };

  // Get destination icon based on type
  const getDestinationIcon = (type) => {
    const icons = {
      hospital: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
            <path d="M16 2l4 8 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2z" fill="#e74c3c"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">H</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      },
      ambulance: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
            <path d="M16 2l4 8 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2z" fill="#f39c12"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="10">🚑</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      },
      default: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
            <path d="M16 2l4 8 8 2-6 6 2 8-8-4-8 4 2-8-6-6 8-2z" fill="#3498db"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      }
    };

    return icons[type] || icons.default;
  };

  // Create info window content
  const createInfoWindowContent = (destination) => {
    return `
      <div style="padding: 10px; max-width: 250px;">
        <h4 style="margin: 0 0 8px 0; color: #333;">${destination.name || 'Location'}</h4>
        ${destination.address ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">${destination.address}</p>` : ''}
        ${destination.phone ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">📞 ${destination.phone}</p>` : ''}
        ${destination.rating ? `<p style="margin: 0 0 5px 0; color: #666; font-size: 13px;">⭐ ${destination.rating}/5</p>` : ''}
        ${destination.distance ? `<p style="margin: 0 0 5px 0; color: #3498db; font-size: 13px;">📍 ${destination.distance}</p>` : ''}
        <p style="margin: 5px 0 0 0; color: #999; font-size: 11px;">
          ${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}
        </p>
      </div>
    `;
  };

  // Fit map to show all markers
  const fitMapToBounds = () => {
    if (!map || markers.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    
    // Add current location to bounds
    if (currentLocation) {
      bounds.extend(currentLocation);
    }
    
    // Add all destinations to bounds
    destinations.forEach(dest => {
      bounds.extend({ lat: dest.lat, lng: dest.lng });
    });

    map.fitBounds(bounds);
    
    // Ensure minimum zoom level
    const listener = window.google.maps.event.addListener(map, 'idle', () => {
      if (map.getZoom() > 16) map.setZoom(16);
      window.google.maps.event.removeListener(listener);
    });
  };

  // Show directions
  const showDirectionsToDestination = (destination) => {
    if (!currentLocation || !directionsService || !directionsRenderer) return;

    const request = {
      origin: currentLocation,
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidHighways: false,
      avoidTolls: false
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };

  // Clear directions
  const clearDirections = () => {
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
  };

  // Map styling
  const getMapStyles = () => {
    return [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text',
        stylers: [{ visibility: 'off' }]
      }
    ];
  };

  if (error) {
    return (
      <div style={{ 
        height: mapHeight, 
        width: mapWidth, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h4>Map Error</h4>
          <p>{error}</p>
          <button onClick={initializeMap} style={{ padding: '8px 16px', marginTop: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: mapHeight, width: mapWidth }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000
        }}>
          <div>Loading map...</div>
        </div>
      )}
      
      <div
        ref={mapRef}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '8px'
        }}
      />

      {/* Map Controls */}
      {map && !isLoading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <button
            onClick={getCurrentLocation}
            style={{
              padding: '8px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            title="Get Current Location"
          >
            📍
          </button>
          
          {showDirections && destinations.length > 0 && (
            <button
              onClick={clearDirections}
              style={{
                padding: '8px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Clear Directions"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationMap;