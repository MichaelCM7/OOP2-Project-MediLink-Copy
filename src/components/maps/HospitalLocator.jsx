import React, { useState, useEffect } from 'react';
import LocationMap from './LocationMap';

const HospitalLocator = ({ 
  userLocation, 
  onHospitalSelect, 
  searchRadius = 10, // km
  showEmergencyOnly = false,
  filterByInsurance = null,
  filterBySpecialty = null 
}) => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // distance, rating, availability
  const [showFilters, setShowFilters] = useState(false);
  const [availableInsurances, setAvailableInsurances] = useState([]);
  const [availableSpecialties, setAvailableSpecialties] = useState([]);

  // Search filters state
  const [filters, setFilters] = useState({
    maxDistance: searchRadius,
    minRating: 0,
    emergencyServices: showEmergencyOnly,
    insurance: filterByInsurance,
    specialty: filterBySpecialty,
    availability: 'all' // all, available, urgent
  });

  useEffect(() => {
    if (userLocation) {
      fetchNearbyHospitals();
    }
  }, [userLocation, searchRadius]);

  useEffect(() => {
    applyFilters();
  }, [hospitals, filters, searchQuery, sortBy]);

  // Fetch nearby hospitals
  const fetchNearbyHospitals = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/hospitals/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          radius: searchRadius,
          emergencyOnly: showEmergencyOnly
        })
      });

      const data = await response.json();
      setHospitals(data.hospitals || []);
      setAvailableInsurances(data.insuranceProviders || []);
      setAvailableSpecialties(data.specialties || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      // Fallback to mock data
      setMockHospitalData();
    } finally {
      setLoading(false);
    }
  };

  // Mock hospital data for development
  const setMockHospitalData = () => {
    const mockHospitals = [
      {
        id: 1,
        name: 'Nairobi Hospital',
        address: 'Argwings Kodhek Rd, Nairobi',
        lat: -1.2841,
        lng: 36.8155,
        phone: '+254-20-2845000',
        rating: 4.5,
        distance: '2.1 km',
        emergencyServices: true,
        availability: 'available',
        insuranceAccepted: ['NHIF', 'AAR', 'Jubilee'],
        specialties: ['Cardiology', 'Emergency Medicine', 'Surgery'],
        totalBeds: 320,
        availableBeds: 45,
        waitTime: '15-30 mins',
        image: '/api/placeholder/300/200'
      },
      {
        id: 2,
        name: 'Kenyatta National Hospital',
        address: 'Hospital Rd, Nairobi',
        lat: -1.3013,
        lng: 36.8073,
        phone: '+254-20-2726300',
        rating: 4.2,
        distance: '3.5 km',
        emergencyServices: true,
        availability: 'busy',
        insuranceAccepted: ['NHIF', 'Cash'],
        specialties: ['All Specialties'],
        totalBeds: 1800,
        availableBeds: 120,
        waitTime: '45-60 mins',
        image: '/api/placeholder/300/200'
      },
      {
        id: 3,
        name: 'Aga Khan University Hospital',
        address: '3rd Parklands Ave, Nairobi',
        lat: -1.2626,
        lng: 36.8017,
        phone: '+254-20-3662000',
        rating: 4.8,
        distance: '4.2 km',
        emergencyServices: true,
        availability: 'available',
        insuranceAccepted: ['AAR', 'Jubilee', 'Madison', 'Cash'],
        specialties: ['Cardiology', 'Oncology', 'Neurology', 'Emergency Medicine'],
        totalBeds: 254,
        availableBeds: 28,
        waitTime: '10-20 mins',
        image: '/api/placeholder/300/200'
      },
      {
        id: 4,
        name: 'MP Shah Hospital',
        address: 'Shivachi Rd, Nairobi',
        lat: -1.2741,
        lng: 36.8047,
        phone: '+254-20-4282000',
        rating: 4.3,
        distance: '1.8 km',
        emergencyServices: true,
        availability: 'urgent',
        insuranceAccepted: ['NHIF', 'AAR', 'Jubilee'],
        specialties: ['Emergency Medicine', 'Surgery', 'Pediatrics'],
        totalBeds: 180,
        availableBeds: 12,
        waitTime: '30-45 mins',
        image: '/api/placeholder/300/200'
      }
    ];

    setHospitals(mockHospitals);
    setAvailableInsurances(['NHIF', 'AAR', 'Jubilee', 'Madison', 'Cash']);
    setAvailableSpecialties(['Emergency Medicine', 'Cardiology', 'Surgery', 'Pediatrics', 'Oncology', 'Neurology']);
  };

  // Apply filters and search
  const applyFilters = () => {
    let filtered = [...hospitals];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(query) ||
        hospital.address.toLowerCase().includes(query) ||
        hospital.specialties.some(specialty => 
          specialty.toLowerCase().includes(query)
        )
      );
    }

    // Distance filter
    if (filters.maxDistance < searchRadius) {
      filtered = filtered.filter(hospital => 
        parseFloat(hospital.distance) <= filters.maxDistance
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(hospital => hospital.rating >= filters.minRating);
    }

    // Emergency services filter
    if (filters.emergencyServices) {
      filtered = filtered.filter(hospital => hospital.emergencyServices);
    }

    // Insurance filter
    if (filters.insurance && filters.insurance !== 'all') {
      filtered = filtered.filter(hospital =>
        hospital.insuranceAccepted.includes(filters.insurance)
      );
    }

    // Specialty filter
    if (filters.specialty && filters.specialty !== 'all') {
      filtered = filtered.filter(hospital =>
        hospital.specialties.includes(filters.specialty)
      );
    }

    // Availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter(hospital => {
        if (filters.availability === 'available') {
          return hospital.availability === 'available';
        } else if (filters.availability === 'urgent') {
          return hospital.availability === 'urgent' || hospital.availability === 'available';
        }
        return true;
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          const priority = { available: 3, urgent: 2, busy: 1 };
          return priority[b.availability] - priority[a.availability];
        default:
          return 0;
      }
    });

    setFilteredHospitals(filtered);
  };

  // Handle hospital selection
  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    if (onHospitalSelect) {
      onHospitalSelect(hospital);
    }
  };

  // Get availability color
  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available':
        return '#27ae60';
      case 'busy':
        return '#f39c12';
      case 'urgent':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  // Prepare map destinations
  const mapDestinations = filteredHospitals.map(hospital => ({
    ...hospital,
    type: 'hospital'
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search and Filters */}
      <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search hospitals, specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="distance">Sort by Distance</option>
            <option value="rating">Sort by Rating</option>
            <option value="availability">Sort by Availability</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '10px 15px',
              backgroundColor: showFilters ? '#3498db' : '#ecf0f1',
              color: showFilters ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Max Distance: {filters.maxDistance}km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.maxDistance}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Min Rating: {filters.minRating}⭐
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Insurance</label>
              <select
                value={filters.insurance || 'all'}
                onChange={(e) => setFilters(prev => ({ ...prev, insurance: e.target.value === 'all' ? null : e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="all">All Insurance</option>
                {availableInsurances.map(insurance => (
                  <option key={insurance} value={insurance}>{insurance}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Specialty</label>
              <select
                value={filters.specialty || 'all'}
                onChange={(e) => setFilters(prev => ({ ...prev, specialty: e.target.value === 'all' ? null : e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="all">All Specialties</option>
                {availableSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={filters.emergencyServices}
                  onChange={(e) => setFilters(prev => ({ ...prev, emergencyServices: e.target.checked }))}
                />
                Emergency Services Only
              </label>
            </div>
          </div>
        )}

        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Found {filteredHospitals.length} hospitals within {filters.maxDistance}km
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, minHeight: '500px' }}>
        {/* Hospital List */}
        <div style={{ width: '400px', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div>Loading hospitals...</div>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <h4>No hospitals found</h4>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            filteredHospitals.map(hospital => (
              <div
                key={hospital.id}
                onClick={() => handleHospitalSelect(hospital)}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor: selectedHospital?.id === hospital.id ? '#e3f2fd' : 'white',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedHospital?.id !== hospital.id) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedHospital?.id !== hospital.id) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>{hospital.name}</h4>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getAvailabilityColor(hospital.availability),
                      flexShrink: 0,
                      marginLeft: '10px'
                    }}
                    title={`Status: ${hospital.availability}`}
                  />
                </div>

                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#7f8c8d' }}>
                  📍 {hospital.address}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#3498db', fontWeight: '600' }}>
                    {hospital.distance}
                  </span>
                  <span style={{ fontSize: '13px', color: '#f39c12' }}>
                    ⭐ {hospital.rating}/5
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                  🏥 {hospital.availableBeds}/{hospital.totalBeds} beds available
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  ⏱️ Wait time: {hospital.waitTime}
                </div>

                {hospital.emergencyServices && (
                  <span style={{
                    fontSize: '11px',
                    color: '#e74c3c',
                    backgroundColor: '#ffebee',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    marginRight: '5px'
                  }}>
                    Emergency
                  </span>
                )}

                <div style={{ fontSize: '11px', color: '#95a5a6', marginTop: '5px' }}>
                  📞 {hospital.phone}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1 }}>
          <LocationMap
            userLocation={userLocation}
            destinations={mapDestinations}
            showUserLocation={true}
            mapHeight="100%"
            zoom={12}
            onLocationSelect={(location) => {
              console.log('Location selected:', location);
            }}
          />
        </div>
      </div>

      {/* Selected Hospital Details */}
      {selectedHospital && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '2px solid #3498db',
          padding: '20px',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{selectedHospital.name}</h3>
              <p style={{ margin: '0', color: '#7f8c8d' }}>{selectedHospital.address}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.open(`tel:${selectedHospital.phone}`)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📞 Call Hospital
              </button>
              <button
                onClick={() => setSelectedHospital(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalLocator;