import React, { useState } from 'react';

const ReviewCard = ({
  review,
  showAvatar = true,
  showDate = true,
  showHelpful = true,
  showReply = false,
  isOwner = false,
  onEdit,
  onDelete,
  onReply,
  onHelpful,
  maxLength = null,
  variant = 'default' // default, compact, detailed
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        return 'Just now';
      }
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) { // 7 days
      const days = Math.floor(diffInHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Render stars
  const renderStars = (rating, size = '16px') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            fontSize: size,
            color: i <= rating ? '#f39c12' : '#ddd',
            marginRight: '1px'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 4) return '#27ae60';
    if (rating >= 3) return '#f39c12';
    return '#e74c3c';
  };

  // Handle reply submission
  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      if (onReply) {
        await onReply(review.id, replyText.trim());
      }
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Truncate text if needed
  const truncateText = (text, maxLen) => {
    if (!maxLen || text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '...';
  };

  const shouldShowExpand = maxLength && review.reviewText && review.reviewText.length > maxLength;
  const displayText = shouldShowExpand && !isExpanded 
    ? truncateText(review.reviewText, maxLength)
    : review.reviewText;

  // Variant styles
  const getCardStyle = () => {
    const baseStyle = {
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      backgroundColor: '#fff',
      marginBottom: '15px'
    };

    switch (variant) {
      case 'compact':
        return { ...baseStyle, padding: '12px' };
      case 'detailed':
        return { ...baseStyle, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' };
      default:
        return { ...baseStyle, padding: '16px' };
    }
  };

  return (
    <div style={getCardStyle()}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: '12px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Avatar */}
          {showAvatar && (
            <div style={{
              width: variant === 'compact' ? '32px' : '40px',
              height: variant === 'compact' ? '32px' : '40px',
              borderRadius: '50%',
              backgroundColor: review.user?.avatar ? 'transparent' : '#3498db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: variant === 'compact' ? '12px' : '14px',
              fontWeight: '600',
              flexShrink: 0,
              backgroundImage: review.user?.avatar ? `url(${review.user.avatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!review.user?.avatar && getUserInitials(review.user?.name || 'Anonymous')}
            </div>
          )}

          {/* User Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h5 style={{ 
                margin: 0, 
                fontSize: variant === 'compact' ? '14px' : '16px',
                color: '#2c3e50',
                fontWeight: '600'
              }}>
                {review.user?.name || 'Anonymous'}
              </h5>
              
              {review.isVerified && (
                <span style={{
                  fontSize: '12px',
                  color: '#27ae60',
                  backgroundColor: '#e8f5e8',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontWeight: '500'
                }}>
                  ✓ Verified
                </span>
              )}
            </div>

            {showDate && (
              <p style={{ 
                margin: '2px 0 0 0', 
                fontSize: '12px', 
                color: '#95a5a6' 
              }}>
                {formatDate(review.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Actions for owner */}
        {isOwner && (
          <div style={{ display: 'flex', gap: '5px' }}>
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#7f8c8d',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px'
                }}
                title="Edit review"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e74c3c',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '4px'
                }}
                title="Delete review"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: review.reviewText ? '12px' : '8px' 
      }}>
        <div>{renderStars(review.rating, variant === 'compact' ? '14px' : '16px')}</div>
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          color: getRatingColor(review.rating)
        }}>
          {review.rating}/5
        </span>
        
        {variant === 'detailed' && (
          <span style={{ fontSize: '12px', color: '#95a5a6' }}>
            • {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][review.rating - 1]}
          </span>
        )}
      </div>

      {/* Review Text */}
      {review.reviewText && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{
            margin: 0,
            fontSize: variant === 'compact' ? '13px' : '14px',
            color: '#495057',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
          }}>
            {displayText}
          </p>
          
          {shouldShowExpand && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                fontSize: '13px',
                marginTop: '5px',
                padding: 0
              }}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Review Categories/Tags */}
      {review.categories && review.categories.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {review.categories.map((category, index) => (
            <span
              key={index}
              style={{
                fontSize: '11px',
                color: '#666',
                backgroundColor: '#f1f3f4',
                padding: '3px 8px',
                borderRadius: '12px',
                marginRight: '5px',
                marginBottom: '5px',
                display: 'inline-block'
              }}
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {/* Photo attachments */}
      {review.photos && review.photos.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {review.photos.slice(0, 3).map((photo, index) => (
              <img
                key={index}
                src={photo.url}
                alt={`Review photo ${index + 1}`}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef',
                  cursor: 'pointer'
                }}
                onClick={() => {/* Open photo viewer */}}
              />
            ))}
            {review.photos.length > 3 && (
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#666',
                cursor: 'pointer'
              }}>
                +{review.photos.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderTop: variant !== 'compact' ? '1px solid #f1f3f4' : 'none',
        paddingTop: variant !== 'compact' ? '12px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Helpful */}
          {showHelpful && (
            <button
              onClick={() => onHelpful && onHelpful(review.id)}
              style={{
                background: 'none',
                border: 'none',
                color: review.isHelpful ? '#27ae60' : '#95a5a6',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              👍 Helpful ({review.helpfulCount || 0})
            </button>
          )}

          {/* Reply */}
          {showReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              style={{
                background: 'none',
                border: 'none',
                color: '#7f8c8d',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              💬 Reply
            </button>
          )}
        </div>

        {/* Report */}
        {!isOwner && (
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#95a5a6',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Report review"
          >
            ⚠️
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px'
        }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            style={{
              width: '100%',
              height: '60px',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
              resize: 'vertical'
            }}
          />
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowReplyForm(false)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleReplySubmit}
              disabled={!replyText.trim() || isSubmittingReply}
              style={{
                padding: '6px 12px',
                backgroundColor: !replyText.trim() ? '#bdc3c7' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: !replyText.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmittingReply ? 'Sending...' : 'Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {review.replies && review.replies.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {review.replies.map((reply, index) => (
            <div
              key={index}
              style={{
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '6px',
                marginBottom: '8px',
                borderLeft: '3px solid #3498db'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>
                  {reply.author}
                </span>
                <span style={{ fontSize: '11px', color: '#95a5a6' }}>
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#495057', lineHeight: 1.4 }}>
                {reply.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;