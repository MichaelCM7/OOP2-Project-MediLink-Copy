import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ratingService } from '../../services/ratingService';
import { doctorService } from '../../services/doctorService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import './MyRatings.css';

const MyRatings = () => {
  const { user } = useAuth();
  
  const [ratingsData, setRatingsData] = useState({
    overview: {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      },
      recentTrend: 'stable'
    },
    reviews: [],
    statistics: {
      totalPatients: 0,
      responseRate: 0,
      recommendationRate: 0,
      averageByCategory: {
        communication: 0,
        professionalism: 0,
        treatmentEffectiveness: 0,
        waitTime: 0,
        facilityQuality: 0
      }
    }
  });

  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  // Filters and sorting
  const [filters, setFilters] = useState({
    rating: 'ALL',
    timeframe: 'ALL',
    hasResponse: 'ALL',
    search: '',
    sortBy: 'newest'
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchRatingsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [ratingsData.reviews, filters]);

  const fetchRatingsData = async () => {
    try {
      setLoading(true);
      const [overviewResponse, reviewsResponse, statsResponse] = await Promise.all([
        ratingService.getRatingOverview(),
        ratingService.getReviews(),
        ratingService.getStatistics()
      ]);

      setRatingsData({
        overview: overviewResponse.data,
        reviews: reviewsResponse.data || [],
        statistics: statsResponse.data
      });
    } catch (err) {
      setError('Failed to load ratings data');
      console.error('Ratings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...ratingsData.reviews];

    // Rating filter
    if (filters.rating !== 'ALL') {
      const ratingValue = parseInt(filters.rating);
      filtered = filtered.filter(review => review.rating === ratingValue);
    }

    // Timeframe filter
    if (filters.timeframe !== 'ALL') {
      const now = new Date();
      const timeLimit = new Date();
      
      switch (filters.timeframe) {
        case 'WEEK':
          timeLimit.setDate(now.getDate() - 7);
          break;
        case 'MONTH':
          timeLimit.setMonth(now.getMonth() - 1);
          break;
        case 'QUARTER':
          timeLimit.setMonth(now.getMonth() - 3);
          break;
        case 'YEAR':
          timeLimit.setFullYear(now.getFullYear() - 1);
          break;
        default:
          timeLimit.setTime(0);
      }
      
      filtered = filtered.filter(review => 
        new Date(review.createdAt) >= timeLimit
      );
    }

    // Response filter
    if (filters.hasResponse !== 'ALL') {
      const hasResponse = filters.hasResponse === 'WITH_RESPONSE';
      filtered = filtered.filter(review => 
        hasResponse ? review.doctorResponse : !review.doctorResponse
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(review =>
        review.comment?.toLowerCase().includes(searchTerm) ||
        review.patientName?.toLowerCase().includes(searchTerm) ||
        review.doctorResponse?.toLowerCase().includes(searchTerm)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest_rating':
          return b.rating - a.rating;
        case 'lowest_rating':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  };

  const handleRespondToReview = async (reviewId) => {
    try {
      setResponding(true);
      setError('');

      await ratingService.respondToReview(reviewId, {
        response: responseText.trim()
      });

      setSuccess('Response posted successfully!');
      setShowResponseModal(false);
      setResponseText('');
      
      // Refresh data
      fetchRatingsData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post response');
    } finally {
      setResponding(false);
    }
  };

  const exportRatings = async () => {
    try {
      const response = await ratingService.exportRatings();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ratings-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setSuccess('Ratings exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to export ratings');
    }
  };

  const renderStars = (rating, size = 'medium') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${size} ${i <= rating ? 'filled' : 'empty'}`}
        >
          ⭐
        </span>
      );
    }
    return <div className="star-rating">{stars}</div>;
  };

  const renderRatingBar = (count, total, rating) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="rating-bar">
        <span className="rating-label">{rating} stars</span>
        <div className="bar-container">
          <div 
            className="bar-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="rating-count">{count}</span>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="overview-content">
      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="summary-card main-rating">
          <div className="rating-display">
            <div className="average-rating">
              {ratingsData.overview.averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(ratingsData.overview.averageRating), 'large')}
          </div>
          <div className="rating-info">
            <p>{ratingsData.overview.totalReviews} reviews</p>
            <span className={`trend ${ratingsData.overview.recentTrend}`}>
              {ratingsData.overview.recentTrend === 'up' && '📈 Improving'}
              {ratingsData.overview.recentTrend === 'down' && '📉 Declining'}
              {ratingsData.overview.recentTrend === 'stable' && '📊 Stable'}
            </span>
          </div>
        </div>

        <div className="summary-card distribution">
          <h3>Rating Distribution</h3>
          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(rating => 
              renderRatingBar(
                ratingsData.overview.ratingDistribution[rating],
                ratingsData.overview.totalReviews,
                rating
              )
            )}
          </div>
        </div>

        <div className="summary-card stats">
          <h3>Key Metrics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{ratingsData.statistics.totalPatients}</span>
              <span className="stat-label">Total Patients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{ratingsData.statistics.responseRate}%</span>
              <span className="stat-label">Response Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{ratingsData.statistics.recommendationRate}%</span>
              <span className="stat-label">Would Recommend</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="category-ratings">
        <h3>Performance by Category</h3>
        <div className="categories-grid">
          {Object.entries(ratingsData.statistics.averageByCategory).map(([category, rating]) => (
            <div key={category} className="category-card">
              <h4>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
              {renderStars(Math.round(rating))}
              <span className="category-rating">{rating.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews Preview */}
      <div className="recent-reviews-preview">
        <div className="section-header">
          <h3>Recent Reviews</h3>
          <button 
            className="btn-outline"
            onClick={() => setActiveTab('reviews')}
          >
            View All Reviews
          </button>
        </div>
        
        <div className="preview-reviews">
          {ratingsData.reviews.slice(0, 3).map(review => (
            <div key={review.id} className="preview-review-card">
              <div className="review-header">
                {renderStars(review.rating, 'small')}
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <span className="review-patient">- {review.patientName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="reviews-content">
      {/* Filters */}
      <div className="reviews-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Rating:</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Timeframe:</label>
            <select
              value={filters.timeframe}
              onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
            >
              <option value="ALL">All Time</option>
              <option value="WEEK">Last Week</option>
              <option value="MONTH">Last Month</option>
              <option value="QUARTER">Last Quarter</option>
              <option value="YEAR">Last Year</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Response:</label>
            <select
              value={filters.hasResponse}
              onChange={(e) => setFilters(prev => ({ ...prev, hasResponse: e.target.value }))}
            >
              <option value="ALL">All Reviews</option>
              <option value="WITH_RESPONSE">With Response</option>
              <option value="WITHOUT_RESPONSE">Without Response</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest_rating">Highest Rating</option>
              <option value="lowest_rating">Lowest Rating</option>
            </select>
          </div>
        </div>

        <div className="search-row">
          <input
            type="text"
            placeholder="Search reviews..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
          
          <button 
            className="btn-outline"
            onClick={exportRatings}
          >
            📊 Export Data
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="patient-info">
                  <div className="patient-avatar">
                    {review.patientAvatar ? (
                      <img src={review.patientAvatar} alt="Patient" />
                    ) : (
                      <div className="avatar-placeholder">
                        {review.patientName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="patient-details">
                    <h4>{review.patientName}</h4>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="review-rating">
                  {renderStars(review.rating)}
                  <span className="rating-number">{review.rating}/5</span>
                </div>
              </div>

              <div className="review-content">
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}

                {review.categories && Object.keys(review.categories).length > 0 && (
                  <div className="category-ratings-detail">
                    <h5>Category Ratings:</h5>
                    <div className="categories-row">
                      {Object.entries(review.categories).map(([category, rating]) => (
                        <div key={category} className="category-item">
                          <span className="category-name">
                            {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                          </span>
                          {renderStars(rating, 'small')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {review.appointmentType && (
                  <div className="appointment-info">
                    <span className="appointment-type">
                      📅 {review.appointmentType} Appointment
                    </span>
                  </div>
                )}
              </div>

              {review.doctorResponse ? (
                <div className="doctor-response">
                  <h5>Your Response:</h5>
                  <p>{review.doctorResponse}</p>
                  <span className="response-date">
                    Responded on {new Date(review.responseDate).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="response-actions">
                  <button 
                    className="btn-outline btn-sm"
                    onClick={() => {
                      setSelectedReview(review);
                      setShowResponseModal(true);
                    }}
                  >
                    💬 Respond
                  </button>
                </div>
              )}

              <div className="review-actions">
                <button 
                  className="btn-text"
                  onClick={() => {
                    setSelectedReview(review);
                    setShowReviewModal(true);
                  }}
                >
                  View Details
                </button>
                
                {review.helpful !== undefined && (
                  <span className="helpful-indicator">
                    👍 {review.helpful} found helpful
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>No reviews found</h3>
            <p>
              {filters.rating === 'ALL' && filters.timeframe === 'ALL' && !filters.search
                ? 'No patient reviews yet'
                : 'No reviews match your current filters'
              }
            </p>
            {(filters.rating !== 'ALL' || filters.timeframe !== 'ALL' || filters.search) && (
              <button 
                className="btn-outline"
                onClick={() => setFilters({
                  rating: 'ALL',
                  timeframe: 'ALL',
                  hasResponse: 'ALL',
                  search: '',
                  sortBy: 'newest'
                })}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="my-ratings">
      <div className="ratings-header">
        <h1>My Ratings & Reviews</h1>
        <div className="header-stats">
          <div className="quick-stat">
            <span className="stat-value">{ratingsData.overview.averageRating.toFixed(1)}</span>
            <span className="stat-label">Average Rating</span>
          </div>
          <div className="quick-stat">
            <span className="stat-value">{ratingsData.overview.totalReviews}</span>
            <span className="stat-label">Total Reviews</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="success-message">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          💬 Reviews ({ratingsData.reviews.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'reviews' && renderReviews()}
      </div>

      {/* Review Details Modal */}
      {showReviewModal && selectedReview && (
        <Modal onClose={() => setShowReviewModal(false)} size="medium">
          <div className="review-details-modal">
            <h3>Review Details</h3>
            
            <div className="review-full">
              <div className="review-header">
                <div className="patient-info">
                  <h4>{selectedReview.patientName}</h4>
                  <span className="review-date">
                    {new Date(selectedReview.createdAt).toLocaleString()}
                  </span>
                </div>
                {renderStars(selectedReview.rating)}
              </div>

              {selectedReview.comment && (
                <div className="review-comment">
                  <h5>Comment:</h5>
                  <p>{selectedReview.comment}</p>
                </div>
              )}

              {selectedReview.categories && (
                <div className="category-details">
                  <h5>Category Ratings:</h5>
                  {Object.entries(selectedReview.categories).map(([category, rating]) => (
                    <div key={category} className="category-row">
                      <span>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      {renderStars(rating, 'small')}
                      <span>{rating}/5</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedReview.doctorResponse && (
                <div className="response-section">
                  <h5>Your Response:</h5>
                  <p>{selectedReview.doctorResponse}</p>
                  <span className="response-date">
                    {new Date(selectedReview.responseDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowReviewModal(false)}
              >
                Close
              </button>
              
              {!selectedReview.doctorResponse && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowReviewModal(false);
                    setShowResponseModal(true);
                  }}
                >
                  Respond to Review
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <Modal onClose={() => setShowResponseModal(false)}>
          <div className="response-modal">
            <h3>Respond to Review</h3>
            
            <div className="review-summary">
              <div className="summary-header">
                <span className="patient-name">{selectedReview.patientName}</span>
                {renderStars(selectedReview.rating, 'small')}
              </div>
              <p className="review-text">{selectedReview.comment}</p>
            </div>

            <div className="form-group">
              <label>Your Response</label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Thank the patient and address their feedback professionally..."
                rows="4"
                maxLength="500"
              />
              <small>{responseText.length}/500 characters</small>
            </div>

            <div className="response-tips">
              <h5>💡 Response Tips:</h5>
              <ul>
                <li>Thank the patient for their feedback</li>
                <li>Address specific concerns mentioned</li>
                <li>Keep the tone professional and empathetic</li>
                <li>Avoid discussing medical details publicly</li>
                <li>Invite them to contact you privately if needed</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </button>
              
              <button 
                className="btn-primary"
                onClick={() => handleRespondToReview(selectedReview.id)}
                disabled={responding || !responseText.trim()}
              >
                {responding ? 'Posting...' : 'Post Response'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyRatings;