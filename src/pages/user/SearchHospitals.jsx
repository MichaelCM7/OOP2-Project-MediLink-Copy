import React, { useState, useEffect } from 'react';

const SearchHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    services: '',
    insurance: '',
    rating: '',
    emergency: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const hospitalTypes = [
    'General Hospital',
    'Specialty Hospital',
    'Teaching Hospital',
    'Children\'s Hospital',
    'Psychiatric Hospital',
    'Rehabilitation Center',
    'Urgent Care',
    'Clinic'
  ];

  const services = [
    'Emergency Room',
    'ICU',
    'Surgery',
    'Maternity',
    'Cardiology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Radiology',
    'Laboratory',
    'Pharmacy'
  ];

  const insuranceProviders = [
    'Blue Cross Blue Shield',
    'Aetna',
    'Cigna',
    'UnitedHealthcare',
    'Humana',
    'Kaiser Permanente',
    'Medicare',
    'Medicaid'
  ];

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    filterAndSortHospitals();
  }, [hospitals, filters, searchTerm, sortBy]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockHospitals = [
        {
          id: 1,
          name: 'City General Hospital',
          type: 'General Hospital',
          location: 'Downtown',
          address: '123 Main St, Downtown',
          distance: 2.5,
          rating: 4.6,
          reviewCount: 1245,
          phone: '(555) 123-4567',
          website: 'www.citygeneral.com',
          emergencyRoom: true,
          services: ['Emergency Room', 'ICU', 'Surgery', 'Maternity', 'Cardiology'],
          insurance: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare'],
          hours: '24/7',
          beds: 450,
          established: 1952,
          accreditation: 'Joint Commission',
          description: 'Full-service hospital providing comprehensive healthcare services to the community.',
          parking: 'Available - $5/day',
          publicTransport: 'Metro Station 0.2 miles'
        },
        {
          id: 2,
          name: 'Metro Medical Center',
          type: 'Teaching Hospital',
          location: 'Midtown',
          address: '456 Health Ave, Midtown',
          distance: 4.1,
          rating: 4.8,
          reviewCount: 892,
          phone: '(555) 234-5678',
          website: 'www.metromedical.com',
          emergencyRoom: true,
          services: ['Emergency Room', 'ICU', 'Surgery', 'Neurology', 'Oncology', 'Research'],
          insurance: ['Cigna', 'Humana', 'Blue Cross Blue Shield', 'Medicaid'],
          hours: '24/7',
          beds: 320,
          established: 1975,
          accreditation: 'Joint Commission, Magnet',
          description: 'Premier teaching hospital affiliated with medical school, offering advanced treatments.',
          parking: 'Available - $8/day',
          publicTransport: 'Bus stop adjacent'
        },
        {
          id: 3,
          name: 'Children\'s Medical Center',
          type: 'Children\'s Hospital',
          location: 'Uptown',
          address: '789 Kids Blvd, Uptown',
          distance: 6.8,
          rating: 4.9,
          reviewCount: 567,
          phone: '(555) 345-6789',
          website: 'www.childrensmedical.com',
          emergencyRoom: true,
          services: ['Pediatric Emergency', 'NICU', 'Pediatric Surgery', 'Child Psychology'],
          insurance: ['Kaiser Permanente', 'Blue Cross Blue Shield', 'Medicaid'],
          hours: '24/7',
          beds: 200,
          established: 1985,
          accreditation: 'Joint Commission, Pediatric Specialty',
          description: 'Specialized pediatric care for children from newborn to 18 years old.',
          parking: 'Free for patients',
          publicTransport: 'Metro Station 0.5 miles'
        },
        {
          id: 4,
          name: 'Quick Care Urgent Center',
          type: 'Urgent Care',
          location: 'Westside',
          address: '321 Quick St, Westside',
          distance: 1.2,
          rating: 4.3,
          reviewCount: 234,
          phone: '(555) 456-7890',
          website: 'www.quickcare.com',
          emergencyRoom: false,
          services: ['Urgent Care', 'X-Ray', 'Laboratory', 'Minor Surgery'],
          insurance: ['UnitedHealthcare', 'Aetna', 'Cigna'],
          hours: '8 AM - 10 PM',
          beds: 15,
          established: 2010,
          accreditation: 'Urgent Care Association',
          description: 'Fast, convenient care for non-life-threatening conditions.',
          parking: 'Free parking available',
          publicTransport: 'Bus routes 15, 22'
        }
      ];
      setHospitals(mockHospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHospitals = () => {
    let filtered = [...hospitals];

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(hospital => 
        hospital.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(hospital => 
        hospital.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.services) {
      filtered = filtered.filter(hospital => 
        hospital.services.includes(filters.services)
      );
    }

    if (filters.insurance) {
      filtered = filtered.filter(hospital => 
        hospital.insurance.includes(filters.insurance)
      );
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(hospital => hospital.rating >= minRating);
    }

    if (filters.emergency === 'true') {
      filtered = filtered.filter(hospital => hospital.emergencyRoom);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.services.some(service => 
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return a.distance - b.distance;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    setFilteredHospitals(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      services: '',
      insurance: '',
      rating: '',
      emergency: ''
    });
    setSearchTerm('');
  };

  const getEmergencyStatus = (hasER) => {
    return hasER ? 
      { text: '24/7 Emergency', color: 'text-green-600 bg-green-100' } :
      { text: 'No Emergency', color: 'text-gray-600 bg-gray-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Find Hospitals</h1>
          <p className="text-gray-600">Locate healthcare facilities near you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Hospital name, service..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Hospital Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  {hospitalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Services Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services
                </label>
                <select
                  value={filters.services}
                  onChange={(e) => handleFilterChange('services', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Services</option>
                  {services.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Emergency Room Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Room
                </label>
                <select
                  value={filters.emergency}
                  onChange={(e) => handleFilterChange('emergency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any</option>
                  <option value="true">Has Emergency Room</option>
                  <option value="false">No Emergency Room</option>
                </select>
              </div>

              {/* Insurance Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance
                </label>
                <select
                  value={filters.insurance}
                  onChange={(e) => handleFilterChange('insurance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Insurance</option>
                  {insuranceProviders.map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredHospitals.length} hospitals found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="distance">Sort by Distance</option>
                <option value="name">Sort by Name</option>
                <option value="reviews">Sort by Reviews</option>
              </select>
            </div>

            {/* Hospital Cards */}
            {filteredHospitals.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredHospitals.map((hospital) => (
                  <div key={hospital.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{hospital.name}</h3>
                            <p className="text-blue-600 font-medium">{hospital.type}</p>
                            <p className="text-gray-600">{hospital.address}</p>
                            <p className="text-gray-500 text-sm">{hospital.distance} miles away</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="ml-1 text-sm font-medium">{hospital.rating}</span>
                              <span className="ml-1 text-sm text-gray-500">({hospital.reviewCount})</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEmergencyStatus(hospital.emergencyRoom).color}`}>
                              {getEmergencyStatus(hospital.emergencyRoom).text}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{hospital.description}</p>

                        {/* Services */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
                          <div className="flex flex-wrap gap-2">
                            {hospital.services.map((service, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Hospital Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Hours:</span>
                            <p>{hospital.hours}</p>
                          </div>
                          <div>
                            <span className="font-medium">Beds:</span>
                            <p>{hospital.beds}</p>
                          </div>
                          <div>
                            <span className="font-medium">Established:</span>
                            <p>{hospital.established}</p>
                          </div>
                          <div>
                            <span className="font-medium">Accreditation:</span>
                            <p>{hospital.accreditation}</p>
                          </div>
                        </div>

                        {/* Contact & Transportation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Phone:</span>
                            <p>{hospital.phone}</p>
                          </div>
                          <div>
                            <span className="font-medium">Parking:</span>
                            <p>{hospital.parking}</p>
                          </div>
                          <div>
                            <span className="font-medium">Public Transport:</span>
                            <p>{hospital.publicTransport}</p>
                          </div>
                        </div>

                        {/* Insurance */}
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">Accepts: </span>
                          <span className="text-sm text-gray-600">{hospital.insurance.join(', ')}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2 lg:w-48">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Get Directions
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          Call Hospital
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          View Details
                        </button>
                        <a
                          href={`http://${hospital.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHospitals;