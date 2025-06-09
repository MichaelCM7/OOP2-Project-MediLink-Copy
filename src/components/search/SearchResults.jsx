import React, { useState, useEffect } from 'react';

const SearchResults = ({
  searchQuery = '',
  filters = {},
  results = [],
  isLoading = false,
  totalResults = 0,
  currentPage = 1,
  resultsPerPage = 10,
  onResultSelect,
  onBookAppointment,
  onViewProfile,
  onCallNow,
  onPageChange,
  onSortChange,
  showMap = false,
  userLocation = null,
  variant = 'list' // list, grid, compact
}) => {
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedResult, setSelectedResult] = useState(null);
  const [viewMode, setViewMode] = useState(variant);

  useEffect(() => {
    if (onSortChange) {
      onSortChange(sortBy);
    }
  }, [sortBy]);

  // Format result based on type
  const formatResult = (result) => {
    const baseFormat = {
      id: result.id,
      name: result.name,
      type: result.type,
      image: result.image || result.avatar,
      rating: result.rating || 0,
      reviewCount: result.reviewCount || 0,
      isVerified: result.isVerified || false,
      isAvailable: result.isAvailable || false
    };

    switch (result.type) {
      case 'doctor':
        return {
          ...baseFormat,
          title: result.title || 'Dr.',
          specialty: result.specialty,
          hospital: result.hospital,
          experience: result.experience,
          consultationFee: result.consultationFee,
          nextAvailable: result.nextAvailable,
          languages: result.languages || [],
          acceptsInsurance: result.acceptsInsurance || []
        };
      case 'hospital':
        return {
          ...baseFormat,
          address: result.address,
          distance: result.distance,
          emergencyServices: result.emergencyServices || false,
          specialties: result.specialties || [],
          availableBeds: result.availableBeds,
          totalBeds: result.totalBeds,
          phone: result.phone
        };
      case 'service':
        return {
          ...baseFormat,
          description: result.description,
          provider: result.provider,
          duration: result.duration,
          price: result.price
        };
      default:
        return baseFormat;
    }
  };

  // Get result card component based on type
  const ResultCard = ({ result, index }) => {
    const formattedResult = formatResult(result);
    
    const cardStyle = {
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: viewMode === 'compact' ? '12px' : '16px',
      marginBottom: '12px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: viewMode === 'grid' ? 'block' : 'flex',
      gap: viewMode === 'grid' ? '0' : '16px'
    };

    const handleCardClick = () => {
      setSelectedResult(formattedResult);
      if (onResultSelect) {
        onResultSelect(formattedResult);
      }
    };

    return (
      <div
        style={cardStyle}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Image/Avatar */}
        <div style={{
          width: viewMode === 'compact' ? '60px' : viewMode === 'grid' ? '100%' : '80px',
          height: viewMode === 'compact' ? '60px' : viewMode === 'grid' ? '120px' : '80px',
          flexShrink: 0,
          marginBottom: viewMode === 'grid' ? '12px' : '0'
        }}>
          {formattedResult.image ? (
            <img
              src={formattedResult.image}
              alt={formattedResult.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: viewMode === 'grid' ? '6px 6px 0 0' : '6px',
                border: '1px solid #e9ecef'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: viewMode === 'compact' ? '24px' : '32px',
              color: '#95a5a6'
            }}>
              {formattedResult.type === 'doctor' ? '👨‍⚕️' : 
               formattedResult.type === 'hospital' ? '🏥' : '🔬'}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '8px'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: '0 0 4px 0',
                fontSize: viewMode === 'compact' ? '16px' : '18px',
                color: '#2c3e50',
                fontWeight: '600'
              }}>
                {formattedResult.type === 'doctor' && formattedResult.title}
                {formattedResult.name}
                {formattedResult.isVerified && (
                  <span style={{
                    marginLeft: '8px',
                    color: '#27ae60',
                    fontSize: '14px'
                  }}>
                    ✓
                  </span>
                )}
              </h3>

              {/* Subtitle based on type */}
              {formattedResult.type === 'doctor' && (
                <p style={{ margin: '0 0 4px 0', color: '#7f8c8d', fontSize: '14px' }}>
                  {formattedResult.specialty}
                  {formattedResult.hospital && ` • ${formattedResult.hospital}`}
                </p>
              )}
              
              {formattedResult.type === 'hospital' && (
                <p style={{ margin: '0 0 4px 0', color: '#7f8c8d', fontSize: '14px' }}>
                  {formattedResult.address}
                  {formattedResult.distance && ` • ${formattedResult.distance}`}
                </p>
              )}

              {formattedResult.type === 'service' && (
                <p style={{ margin: '0 0 4px 0', color: '#7f8c8d', fontSize: '14px' }}>
                  {formattedResult.description}
                  {formattedResult.provider && ` • ${formattedResult.provider}`}
                </p>
              )}
            </div>

            {/* Status indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              {formattedResult.isAvailable && (
                <span style={{
                  backgroundColor: '#e8f5e8',
                  color: '#27ae60',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  Available
                </span>
              )}
              
              {formattedResult.type === 'hospital' && formattedResult.emergencyServices && (
                <span style={{
                  backgroundColor: '#ffebee',
                  color: '#e74c3c',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  Emergency
                </span>
              )}
            </div>
          </div>

          {/* Rating */}
          {formattedResult.rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    style={{
                      color: star <= formattedResult.rating ? '#f39c12' : '#ddd',
                      fontSize: '14px'
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {formattedResult.rating.toFixed(1)} ({formattedResult.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Specific content based on type */}
          {formattedResult.type === 'doctor' && (
            <div style={{ marginBottom: '12px' }}>
              {formattedResult.experience && (
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>
                  📈 {formattedResult.experience} years experience
                </p>
              )}
              {formattedResult.consultationFee && (
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>
                  💰 Consultation: KES {formattedResult.consultationFee.toLocaleString()}
                </p>
              )}
              {formattedResult.nextAvailable && (
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#27ae60' }}>
                  📅 Next available: {formattedResult.nextAvailable}
                </p>
              )}
            </div>
          )}

          {formattedResult.type === 'hospital' && (
            <div style={{ marginBottom: '12px' }}>
              {formattedResult.specialties && formattedResult.specialties.length > 0 && (
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>
                  🏥 Specialties: {formattedResult.specialties.slice(0, 3).join(', ')}
                  {formattedResult.specialties.length > 3 && ` +${formattedResult.specialties.length - 3} more`}
                </p>
              )}
              {formattedResult.availableBeds !== undefined && (
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666' }}>
                  🛏️ Beds: {formattedResult.availableBeds}/{formattedResult.totalBeds} available
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {viewMode !== 'compact' && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {formattedResult.type === 'doctor' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onBookAppointment) onBookAppointment(formattedResult);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Book Appointment
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewProfile) onViewProfile(formattedResult);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#3498db',
                      border: '1px solid #3498db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    View Profile
                  </button>
                </>
              )}

              {formattedResult.type === 'hospital' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCallNow && formattedResult.phone) {
                        window.open(`tel:${formattedResult.phone}`);
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Call Now
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewProfile) onViewProfile(formattedResult);
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#27ae60',
                      border: '1px solid #27ae60',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  // No results state
  if (!isLoading && results.length === 0 && searchQuery) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
        <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>No results found</h3>
        <p style={{ margin: '0 0 20px 0', color: '#7f8c8d' }}>
          We couldn't find any results for "{searchQuery}". Try adjusting your search terms or filters.
        </p>
        <div style={{ color: '#95a5a6', fontSize: '14px' }}>
          <p>Suggestions:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0' }}>
            <li>• Check spelling and try different keywords</li>
            <li>• Use broader search terms</li>
            <li>• Remove or adjust filters</li>
            <li>• Try searching for a specialty or location</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      {totalResults > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
              {totalResults.toLocaleString()} results found
            </p>
            {searchQuery && (
              <p style={{ margin: 0, fontSize: '14px', color: '#7f8c8d' }}>
                for "{searchQuery}" • Showing {startResult}-{endResult}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['list', 'grid', 'compact'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '6px 8px',
                    backgroundColor: viewMode === mode ? '#3498db' : 'transparent',
                    color: viewMode === mode ? 'white' : '#666',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title={`${mode} view`}
                >
                  {mode === 'list' ? '☰' : mode === 'grid' ? '⊞' : '⚏'}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="relevance">Most Relevant</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Nearest</option>
              <option value="availability">Available Now</option>
              <option value="price">Price: Low to High</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#666' }}>Searching...</p>
        </div>
      )}

      {/* Results Grid/List */}
      {!isLoading && results.length > 0 && (
        <div style={{
          display: viewMode === 'grid' ? 'grid' : 'block',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
          gap: viewMode === 'grid' ? '16px' : '0'
        }}>
          {results.map((result, index) => (
            <ResultCard key={result.id || index} result={result} index={index} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '30px',
          padding: '20px'
        }}>
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === 1 ? '#f8f9fa' : '#3498db',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange && onPageChange(pageNum)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === pageNum ? '#3498db' : 'white',
                  color: currentPage === pageNum ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#3498db',
              color: currentPage === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SearchResults;