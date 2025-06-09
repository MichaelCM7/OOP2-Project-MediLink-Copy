import React, { useState, useEffect } from 'react';

const FilterPanel = ({
  onFilterChange,
  initialFilters = {},
  filterType = 'all', // all, doctors, hospitals, services
  showLocationFilter = true,
  showAvailabilityFilter = true,
  showRatingFilter = true,
  showInsuranceFilter = true,
  showSpecialtyFilter = true,
  showPriceFilter = false,
  userLocation = null,
  isVisible = true,
  variant = 'sidebar', // sidebar, modal, inline
  onClose
}) => {
  const [filters, setFilters] = useState({
    location: {
      latitude: userLocation?.lat || null,
      longitude: userLocation?.lng || null,
      radius: 10, // km
      useCurrentLocation: true
    },
    availability: {
      emergency: false,
      today: false,
      thisWeek: false,
      acceptingNew: false
    },
    rating: {
      minimum: 0,
      verified: false
    },
    insurance: {
      providers: [],
      cashPayment: false
    },
    specialty: {
      categories: [],
      subcategories: []
    },
    price: {
      min: 0,
      max: 10000,
      range: [0, 10000]
    },
    sortBy: 'relevance', // relevance, rating, distance, price, availability
    ...initialFilters
  });

  const [availableOptions, setAvailableOptions] = useState({
    specialties: [],
    insuranceProviders: [],
    locations: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    availability: true,
    rating: true,
    insurance: false,
    specialty: false,
    price: false
  });

  useEffect(() => {
    fetchFilterOptions();
  }, [filterType]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters]);

  // Fetch available filter options
  const fetchFilterOptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/filter-options?type=${filterType}`);
      const data = await response.json();
      setAvailableOptions(data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      // Fallback to mock data
      setMockFilterOptions();
    } finally {
      setIsLoading(false);
    }
  };

  // Set mock filter options for development
  const setMockFilterOptions = () => {
    setAvailableOptions({
      specialties: [
        { id: '1', name: 'Cardiology', count: 45 },
        { id: '2', name: 'Dermatology', count: 32 },
        { id: '3', name: 'Emergency Medicine', count: 78 },
        { id: '4', name: 'Family Medicine', count: 156 },
        { id: '5', name: 'Internal Medicine', count: 89 },
        { id: '6', name: 'Neurology', count: 23 },
        { id: '7', name: 'Oncology', count: 34 },
        { id: '8', name: 'Pediatrics', count: 67 },
        { id: '9', name: 'Psychiatry', count: 41 },
        { id: '10', name: 'Surgery', count: 52 }
      ],
      insuranceProviders: [
        { id: '1', name: 'NHIF', count: 567 },
        { id: '2', name: 'AAR Insurance', count: 234 },
        { id: '3', name: 'Jubilee Insurance', count: 189 },
        { id: '4', name: 'Madison Insurance', count: 123 },
        { id: '5', name: 'APA Insurance', count: 98 },
        { id: '6', name: 'Cash Payment', count: 789 }
      ],
      locations: [
        { id: '1', name: 'Nairobi CBD', count: 145 },
        { id: '2', name: 'Westlands', count: 89 },
        { id: '3', name: 'Karen', count: 67 },
        { id: '4', name: 'Kilimani', count: 78 },
        { id: '5', name: 'Parklands', count: 56 }
      ]
    });
  };

  // Update filter
  const updateFilter = (category, key, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Update array filter (for multi-select)
  const updateArrayFilter = (category, key, value, isChecked) => {
    setFilters(prev => {
      const currentArray = prev[category][key] || [];
      const updatedArray = isChecked
        ? [...currentArray, value]
        : currentArray.filter(item => item !== value);
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: updatedArray
        }
      };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      location: {
        latitude: userLocation?.lat || null,
        longitude: userLocation?.lng || null,
        radius: 10,
        useCurrentLocation: true
      },
      availability: {
        emergency: false,
        today: false,
        thisWeek: false,
        acceptingNew: false
      },
      rating: {
        minimum: 0,
        verified: false
      },
      insurance: {
        providers: [],
        cashPayment: false
      },
      specialty: {
        categories: [],
        subcategories: []
      },
      price: {
        min: 0,
        max: 10000,
        range: [0, 10000]
      },
      sortBy: 'relevance'
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (filters.availability.emergency || filters.availability.today || 
        filters.availability.thisWeek || filters.availability.acceptingNew) count++;
    if (filters.rating.minimum > 0 || filters.rating.verified) count++;
    if (filters.insurance.providers.length > 0 || filters.insurance.cashPayment) count++;
    if (filters.specialty.categories.length > 0) count++;
    if (filters.price.range[0] > 0 || filters.price.range[1] < 10000) count++;
    
    return count;
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get container styles based on variant
  const getContainerStyles = () => {
    const baseStyles = {
      backgroundColor: '#fff',
      borderRadius: '8px'
    };

    switch (variant) {
      case 'modal':
        return {
          ...baseStyles,
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          padding: '20px'
        };
      case 'inline':
        return {
          ...baseStyles,
          border: '1px solid #e9ecef',
          padding: '20px'
        };
      default: // sidebar
        return {
          ...baseStyles,
          width: '300px',
          height: 'fit-content',
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid #e9ecef',
          padding: '20px'
        };
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Modal Overlay */}
      {variant === 'modal' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }} onClick={onClose} />
      )}

      <div style={getContainerStyles()}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          borderBottom: '1px solid #e9ecef',
          paddingBottom: '15px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>
            Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
          </h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={clearAllFilters}
              style={{
                background: 'none',
                border: '1px solid #ddd',
                color: '#666',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear All
            </button>
            {variant === 'modal' && onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#95a5a6',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Location Filter */}
        {showLocationFilter && (
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => toggleSection('location')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>Location</h4>
              <span style={{ color: '#95a5a6' }}>
                {expandedSections.location ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.location && (
              <div style={{ paddingLeft: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={filters.location.useCurrentLocation}
                    onChange={(e) => updateFilter('location', 'useCurrentLocation', e.target.checked)}
                  />
                  <span style={{ fontSize: '14px' }}>Use current location</span>
                </label>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Search radius: {filters.location.radius}km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.location.radius}
                    onChange={(e) => updateFilter('location', 'radius', parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Availability Filter */}
        {showAvailabilityFilter && (
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => toggleSection('availability')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>Availability</h4>
              <span style={{ color: '#95a5a6' }}>
                {expandedSections.availability ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.availability && (
              <div style={{ paddingLeft: '10px' }}>
                {[
                  { key: 'emergency', label: '24/7 Emergency' },
                  { key: 'today', label: 'Available today' },
                  { key: 'thisWeek', label: 'Available this week' },
                  { key: 'acceptingNew', label: 'Accepting new patients' }
                ].map(option => (
                  <label key={option.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={filters.availability[option.key]}
                      onChange={(e) => updateFilter('availability', option.key, e.target.checked)}
                    />
                    <span style={{ fontSize: '14px' }}>{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rating Filter */}
        {showRatingFilter && (
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => toggleSection('rating')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>Rating</h4>
              <span style={{ color: '#95a5a6' }}>
                {expandedSections.rating ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.rating && (
              <div style={{ paddingLeft: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    Minimum rating: {filters.rating.minimum}★
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.rating.minimum}
                    onChange={(e) => updateFilter('rating', 'minimum', parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={filters.rating.verified}
                    onChange={(e) => updateFilter('rating', 'verified', e.target.checked)}
                  />
                  <span style={{ fontSize: '14px' }}>Verified reviews only</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Insurance Filter */}
        {showInsuranceFilter && (
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => toggleSection('insurance')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>Insurance</h4>
              <span style={{ color: '#95a5a6' }}>
                {expandedSections.insurance ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.insurance && (
              <div style={{ paddingLeft: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                {availableOptions.insuranceProviders.map(provider => (
                  <label key={provider.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={filters.insurance.providers.includes(provider.id)}
                      onChange={(e) => updateArrayFilter('insurance', 'providers', provider.id, e.target.checked)}
                    />
                    <span style={{ fontSize: '14px', flex: 1 }}>{provider.name}</span>
                    <span style={{ fontSize: '12px', color: '#95a5a6' }}>({provider.count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Specialty Filter */}
        {showSpecialtyFilter && (
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => toggleSection('specialty')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>Specialty</h4>
              <span style={{ color: '#95a5a6' }}>
                {expandedSections.specialty ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.specialty && (
              <div style={{ paddingLeft: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {availableOptions.specialties.map(specialty => (
                  <label key={specialty.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={filters.specialty.categories.includes(specialty.id)}
                      onChange={(e) => updateArrayFilter('specialty', 'categories', specialty.id, e.target.checked)}
                    />
                    <span style={{ fontSize: '14px', flex: 1 }}>{specialty.name}</span>
                    <span style={{ fontSize: '12px', color: '#95a5a6' }}>({specialty.count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Filter */}
        {showPriceFilter && (
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => toggleSection('price')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>Price Range</h4>
              <span style={{ color: '#95a5a6' }}>
                {expandedSections.price ? '−' : '+'}
              </span>
            </div>
            
            {expandedSections.price && (
              <div style={{ paddingLeft: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>
                    KES {filters.price.range[0].toLocaleString()} - KES {filters.price.range[1].toLocaleString()}
                  </label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.price.range[0]}
                      onChange={(e) => updateFilter('price', 'range', [parseInt(e.target.value) || 0, filters.price.range[1]])}
                      style={{
                        flex: 1,
                        padding: '6px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.price.range[1]}
                      onChange={(e) => updateFilter('price', 'range', [filters.price.range[0], parseInt(e.target.value) || 10000])}
                      style={{
                        flex: 1,
                        padding: '6px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort By */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#2c3e50' }}>Sort By</h4>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Highest Rated</option>
            <option value="distance">Nearest</option>
            {showPriceFilter && <option value="price">Price: Low to High</option>}
            <option value="availability">Availability</option>
          </select>
        </div>

        {/* Apply Button (for modal variant) */}
        {variant === 'modal' && (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Apply Filters
          </button>
        )}
      </div>
    </>
  );
};

export default FilterPanel;