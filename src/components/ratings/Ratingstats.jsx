import React, { useState, useEffect } from 'react';

const RatingStats = ({
  targetId,
  targetType = 'doctor', // doctor, hospital, service
  ratings = [],
  showDistribution = true,
  showTrends = false,
  showCategories = false,
  timeFrame = 'all', // all, year, month, week
  variant = 'default' // default, compact, detailed
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(timeFrame);

  useEffect(() => {
    if (ratings.length > 0) {
      calculateStats();
    } else if (targetId) {
      fetchRatingStats();
    }
  }, [ratings, targetId, selectedTimeFrame]);

  // Fetch rating stats from API
  const fetchRatingStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ratings/stats/${targetType}/${targetId}?timeFrame=${selectedTimeFrame}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      // Fallback to mock data
      generateMockStats();
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from provided ratings
  const calculateStats = () => {
    if (ratings.length === 0) {
      setStats({
        totalRatings: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categories: {},
        trends: []
      });
      return;
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const categories = {};
    let totalRating = 0;

    ratings.forEach(rating => {
      totalRating += rating.rating;
      distribution[rating.rating]++;

      // Process categories if available
      if (rating.categories) {
        rating.categories.forEach(category => {
          if (!categories[category]) {
            categories[category] = { total: 0, sum: 0, average: 0 };
          }
          categories[category].total++;
          categories[category].sum += rating.rating;
        });
      }
    });

    // Calculate category averages
    Object.keys(categories).forEach(category => {
      categories[category].average = categories[category].sum / categories[category].total;
    });

    setStats({
      totalRatings: ratings.length,
      averageRating: totalRating / ratings.length,
      distribution,
      categories,
      trends: generateTrends(ratings)
    });
  };

  // Generate mock stats for development
  const generateMockStats = () => {
    const mockStats = {
      totalRatings: 247,
      averageRating: 4.3,
      distribution: { 1: 8, 2: 12, 3: 31, 4: 89, 5: 107 },
      categories: {
        'Communication': { total: 156, average: 4.5 },
        'Punctuality': { total: 143, average: 4.1 },
        'Expertise': { total: 189, average: 4.6 },
        'Facilities': { total: 98, average: 3.9 },
        'Value for Money': { total: 134, average: 4.2 }
      },
      trends: [
        { period: 'Jan', rating: 4.1, count: 23 },
        { period: 'Feb', rating: 4.2, count: 28 },
        { period: 'Mar', rating: 4.3, count: 31 },
        { period: 'Apr', rating: 4.4, count: 29 },
        { period: 'May', rating: 4.3, count: 34 },
        { period: 'Jun', rating: 4.5, count: 38 }
      ]
    };
    setStats(mockStats);
  };

  // Generate trends data
  const generateTrends = (ratingsData) => {
    // Group ratings by month for trend analysis
    const months = {};
    ratingsData.forEach(rating => {
      const month = new Date(rating.createdAt).toLocaleDateString('en-US', { month: 'short' });
      if (!months[month]) {
        months[month] = { sum: 0, count: 0 };
      }
      months[month].sum += rating.rating;
      months[month].count++;
    });

    return Object.keys(months).map(month => ({
      period: month,
      rating: months[month].sum / months[month].count,
      count: months[month].count
    }));
  };

  // Render stars
  const renderStars = (rating, size = '20px') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      let starColor = '#ddd';
      if (i <= fullStars) {
        starColor = '#f39c12';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starColor = '#f39c12';
      }

      stars.push(
        <span
          key={i}
          style={{
            fontSize: size,
            color: starColor,
            marginRight: '1px'
          }}
        >
          {i === fullStars + 1 && hasHalfStar ? '★' : '★'}
        </span>
      );
    }
    return stars;
  };

  // Get rating distribution bar
  const getDistributionBar = (starRating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div key={starRating} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        marginBottom: '8px' 
      }}>
        <span style={{ fontSize: '14px', minWidth: '20px', color: '#666' }}>
          {starRating}★
        </span>
        <div style={{
          flex: 1,
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: '#f39c12',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <span style={{ fontSize: '12px', color: '#666', minWidth: '40px' }}>
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        backgroundColor: '#fff'
      }}>
        <div>Loading rating statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        backgroundColor: '#fff',
        color: '#666'
      }}>
        <div>No rating data available</div>
      </div>
    );
  }

  const containerStyle = {
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    backgroundColor: '#fff',
    padding: variant === 'compact' ? '16px' : '20px'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: variant === 'compact' ? '18px' : '20px',
          color: '#2c3e50' 
        }}>
          Rating Summary
        </h3>
        
        {showTrends && (
          <select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        )}
      </div>

      {/* Overall Rating */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        marginBottom: '25px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: variant === 'compact' ? '32px' : '36px',
            fontWeight: 'bold',
            color: '#2c3e50',
            lineHeight: 1
          }}>
            {stats.averageRating.toFixed(1)}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            out of 5
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '8px' }}>
            {renderStars(stats.averageRating, variant === 'compact' ? '18px' : '24px')}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Based on {stats.totalRatings.toLocaleString()} review{stats.totalRatings !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {showDistribution && (
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px',
            color: '#2c3e50' 
          }}>
            Rating Distribution
          </h4>
          <div>
            {[5, 4, 3, 2, 1].map(star => 
              getDistributionBar(star, stats.distribution[star], stats.totalRatings)
            )}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {showCategories && Object.keys(stats.categories).length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px',
            color: '#2c3e50' 
          }}>
            Category Ratings
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: variant === 'compact' ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            {Object.entries(stats.categories).map(([category, data]) => (
              <div 
                key={category}
                style={{
                  padding: '12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  backgroundColor: '#fafbfc'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                    {category}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f39c12' }}>
                    {data.average.toFixed(1)}
                  </span>
                </div>
                <div style={{ marginBottom: '5px' }}>
                  {renderStars(data.average, '14px')}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {data.total} review{data.total !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Chart */}
      {showTrends && stats.trends && stats.trends.length > 0 && (
        <div>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '16px',
            color: '#2c3e50' 
          }}>
            Rating Trends
          </h4>
          <div style={{
            display: 'flex',
            alignItems: 'end',
            gap: '8px',
            height: '120px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
          }}>
            {stats.trends.map((trend, index) => {
              const height = (trend.rating / 5) * 80; // Max height 80px
              return (
                <div 
                  key={index}
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center' 
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${height}px`,
                      backgroundColor: '#3498db',
                      borderRadius: '3px 3px 0 0',
                      position: 'relative',
                      marginBottom: '5px'
                    }}
                    title={`${trend.period}: ${trend.rating.toFixed(1)} (${trend.count} reviews)`}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: '#666',
                      whiteSpace: 'nowrap'
                    }}>
                      {trend.rating.toFixed(1)}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: '#666' }}>
                    {trend.period}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {variant === 'detailed' && (
        <div style={{
          marginTop: '25px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                {Math.round((stats.distribution[5] + stats.distribution[4]) / stats.totalRatings * 100)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Positive</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f39c12' }}>
                {Math.round(stats.distribution[3] / stats.totalRatings * 100)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Neutral</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>
                {Math.round((stats.distribution[1] + stats.distribution[2]) / stats.totalRatings * 100)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Negative</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3498db' }}>
                {stats.totalRatings}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Reviews</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingStats;