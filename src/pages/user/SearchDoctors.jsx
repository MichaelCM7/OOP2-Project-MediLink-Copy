import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SearchDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    insurance: '',
    rating: '',
    availability: '',
    gender: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const specialties = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology'
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
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterAndSortDoctors();
  }, [doctors, filters, searchTerm, sortBy]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockDoctors = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiology',
          hospital: 'City General Hospital',
          location: 'Downtown',
          rating: 4.8,
          reviewCount: 245,
          experience: 15,
          education: 'Harvard Medical School',
          insurance: ['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare'],
          availability: 'Available Today',
          gender: 'Female',
          languages: ['English', 'Spanish'],
          image: '/api/placeholder/100/100',
          about: 'Specialized in interventional cardiology with focus on heart disease prevention.',
          nextAvailable: '2024-01-16',
          consultationFee: 250
        },
        {
          id: 2,
          name: 'Dr. Michael Chen',
          specialty: 'General Practice',
          hospital: 'Metro Medical Center',
          location: 'Midtown',
          rating: 4.6,
          reviewCount: 189,
          experience: 10,
          education: 'Johns Hopkins University',
          insurance: ['Cigna', 'Humana', 'Medicare'],
          availability: 'Available Tomorrow',
          gender: 'Male',
          languages: ['English', 'Mandarin'],
          image: '/api/placeholder/100/100',
          about: 'Primary care physician with expertise in preventive medicine and chronic disease management.',
          nextAvailable: '2024-01-17',
          consultationFee: 180
        },
        {
          id: 3,
          name: 'Dr. Emily Rodriguez',
          specialty: 'Dermatology',
          hospital: 'Skin Care Clinic',
          location: 'Uptown',
          rating: 4.9,
          reviewCount: 312,
          experience: 12,
          education: 'Stanford Medical School',
          insurance: ['Blue Cross Blue Shield', 'Kaiser Permanente'],
          availability: 'Available Next Week',
          gender: 'Female',
          languages: ['English', 'Spanish', 'Portuguese'],
          image: '/api/placeholder/100/100',
          about: 'Board-certified dermatologist specializing in cosmetic and medical dermatology.',
          nextAvailable: '2024-01-22',
          consultationFee: 200
        },
        {
          id: 4,
          name: 'Dr. David Wilson',
          specialty: 'Orthopedics',
          hospital: 'Sports Medicine Center',
          location: 'Westside',
          rating: 4.7,
          reviewCount: 156,
          experience: 18,
          education: 'UCLA Medical School',
          insurance: ['UnitedHealthcare', 'Aetna', 'Medicaid'],
          availability: 'Available This Week',
          gender: 'Male',
          languages: ['English'],
          image: '/api/placeholder/100/100',
          about: 'Orthopedic surgeon specializing in sports injuries and joint replacement.',
          nextAvailable: '2024-01-18',
          consultationFee: 300
        }
      ];
      setDoctors(mockDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDoctors = () => {
    let filtered = [...doctors];

    // Apply filters
    if (filters.specialty) {
      filtered = filtered.filter(doctor => 
        doctor.specialty.toLowerCase().includes(filters.specialty.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(doctor => 
        doctor.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.insurance) {
      filtered = filtered.filter(doctor => 
        doctor.insurance.includes(filters.insurance)
      );
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(doctor => doctor.rating >= minRating);
    }

    if (filters.gender) {
      filtered = filtered.filter(doctor => 
        doctor.gender.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'fee':
          return a.consultationFee - b.consultationFee;
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      location: '',
      insurance: '',
      rating: '',
      availability: '',
      gender: ''
    });
    setSearchTerm('');
  };

  const getAvailabilityColor = (availability) => {
    if (availability.includes('Today')) return 'text-green-600 bg-green-100';
    if (availability.includes('Tomorrow')) return 'text-blue-600 bg-blue-100';
    if (availability.includes('Week')) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
          <p className="text-gray-600">Search and connect with healthcare professionals</p>
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
                  placeholder="Doctor name, specialty..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Specialty Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={filters.specialty}
                  onChange={(e) => handleFilterChange('specialty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City, area..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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

              {/* Gender Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredDoctors.length} doctors found
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="name">Sort by Name</option>
                <option value="fee">Sort by Fee</option>
              </select>
            </div>

            {/* Doctor Cards */}
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                      {/* Doctor Image */}
                      <div className="flex-shrink-0 mb-4 md:mb-0">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👨‍⚕️</span>
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                            <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                            <p className="text-gray-600">{doctor.hospital}</p>
                            <p className="text-gray-500 text-sm">{doctor.location}</p>

                            <div className="flex items-center mt-2">
                              <div className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                                <span className="ml-1 text-sm text-gray-500">({doctor.reviewCount} reviews)</span>
                              </div>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-sm text-gray-600">{doctor.experience} years experience</span>
                            </div>

                            <p className="text-sm text-gray-600 mt-2">{doctor.about}</p>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {doctor.languages.map((language, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                                >
                                  {language}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Panel */}
                          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(doctor.availability)}`}>
                              {doctor.availability}
                            </span>
                            <p className="text-lg font-bold text-gray-900">${doctor.consultationFee}</p>
                            <p className="text-xs text-gray-500">Consultation fee</p>
                            
                            <div className="flex flex-col space-y-2 w-full">
                              <Link
                                to={`/user/book-appointment?doctor=${doctor.id}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                              >
                                Book Appointment
                              </Link>
                              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                View Profile
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Insurance Info */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Accepts:</span> {doctor.insurance.join(', ')}
                          </p>
                        </div>
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

export default SearchDoctors;