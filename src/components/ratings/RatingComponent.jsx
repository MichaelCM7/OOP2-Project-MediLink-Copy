import React, { useState, useEffect } from 'react';

const RatingComponent = ({
  targetType = 'doctor', // doctor, hospital, service
  targetId,
  targetName,
  existingRating = null,
  onRatingSubmit,
  onRatingUpdate,
  onRatingDelete,
  showReviewText = true,
  maxRating = 5,
  size = 'medium', // small, medium, large
  readOnly = false,
  showLabels = true
}) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [reviewText, setReviewText] = useState(existingRating?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(!existingRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Rating labels
  const ratingLabels = {
    1: 'Poor',
    2: 'Fair', 
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  // Size configurations
  const sizeConfig = {
    small: {
      starSize: '16px',
      fontSize: '12px',
      padding: '8px 12px',
      textareaHeight: '60px'
    },
    medium: {
      starSize: '24px',
      fontSize: '14px',
      padding: '10px 16px',
      textareaHeight: '80px'
    },
    large: {
      starSize: '32px',
      fontSize: '16px',
      padding: '12px 20px',
      textareaHeight: '100px'
    }
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setReviewText(existingRating.review || '');
      setIsEditing(false);
    }
  }, [existingRating]);

  // Handle star click
  const handleStarClick = (value) => {
    if (readOnly) return;
    setRating(value);
  };

  // Handle star hover
  const handleStarHover = (value) => {
    if (readOnly) return;
    setHoveredRating(value);
  };

  // Handle star leave
  const handleStarLeave = () => {
    if (readOnly) return;
    setHoveredRating(0);
  };

  // Submit rating
  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingData = {
        targetType,
        targetId,
        rating,
        review: reviewText.trim(),
        createdAt: new Date().toISOString()
      };

      if (existingRating) {
        // Update existing rating
        const response = await fetch(`/api/ratings/${existingRating.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(ratingData)
        });

        if (response.ok) {
          const updatedRating = await response.json();
          if (onRatingUpdate) {
            onRatingUpdate(updatedRating);
          }
          setIsEditing(false);
        }
      } else {
        // Create new rating
        const response = await fetch('/api/ratings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(ratingData)
        });

        if (response.ok) {
          const newRating = await response.json();
          if (onRatingSubmit) {
            onRatingSubmit(newRating);
          }
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete rating
  const handleDelete = async () => {
    if (!existingRating) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/ratings/${existingRating.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        if (onRatingDelete) {
          onRatingDelete(existingRating.id);
        }
        setRating(0);
        setReviewText('');
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Failed to delete rating. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmDelete(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    if (existingRating) {
      setRating(existingRating.rating);
      setReviewText(existingRating.review || '');
      setIsEditing(false);
    } else {
      setRating(0);
      setReviewText('');
    }
  };

  // Render stars
  const renderStars = () => {
    const stars = [];
    const displayRating = hoveredRating || rating;

    for (let i = 1; i <= maxRating; i++) {
      const isFilled = i <= displayRating;
      const isHovered = i <= hoveredRating;

      stars.push(
        <span
          key={i}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          style={{
            fontSize: config.starSize,
            color: isFilled ? (isHovered ? '#f1c40f' : '#f39c12') : '#ddd',
            cursor: readOnly ? 'default' : 'pointer',
            marginRight: '2px',
            transition: 'color 0.2s ease',
            display: 'inline-block',
            lineHeight: 1
          }}
          title={showLabels ? ratingLabels[i] : `${i} star${i > 1 ? 's' : ''}`}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fff',
      maxWidth: '500px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', fontSize: config.fontSize, color: '#2c3e50' }}>
          {existingRating ? 'Your Rating' : `Rate ${targetName || targetType}`}
        </h4>
        {targetName && (
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: config.fontSize }}>
            for {targetName}
          </p>
        )}
      </div>

      {/* Stars */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div>{renderStars()}</div>
          {showLabels && rating > 0 && (
            <span style={{ fontSize: config.fontSize, color: '#7f8c8d' }}>
              {ratingLabels[rating]}
            </span>
          )}
        </div>
        {rating > 0 && (
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#95a5a6' }}>
            {rating} out of {maxRating} stars
          </p>
        )}
      </div>

      {/* Review Text */}
      {showReviewText && (isEditing || reviewText) && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: config.fontSize,
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            Review (Optional)
          </label>
          {isEditing ? (
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={`Share your experience with ${targetName || `this ${targetType}`}...`}
              maxLength={500}
              style={{
                width: '100%',
                height: config.textareaHeight,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: config.fontSize,
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          ) : reviewText ? (
            <div style={{
              padding: '10px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              fontSize: config.fontSize,
              color: '#495057',
              lineHeight: 1.5
            }}>
              {reviewText}
            </div>
          ) : null}
          {isEditing && (
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              {reviewText.length}/500 characters
            </div>
          )}
        </div>
      )}

      {/* Existing Rating Info */}
      {existingRating && !isEditing && (
        <div style={{
          padding: '10px',
          backgroundColor: '#e8f5e8',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '12px',
          color: '#27ae60'
        }}>
          ✓ You rated this {targetType} on {new Date(existingRating.createdAt).toLocaleDateString()}
        </div>
      )}

      {/* Action Buttons */}
      {!readOnly && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isEditing ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                style={{
                  padding: config.padding,
                  backgroundColor: rating === 0 ? '#95a5a6' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: rating === 0 ? 'not-allowed' : 'pointer',
                  fontSize: config.fontSize,
                  fontWeight: '600',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Submitting...' : (existingRating ? 'Update Rating' : 'Submit Rating')}
              </button>
              
              {existingRating && (
                <button
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  style={{
                    padding: config.padding,
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: config.fontSize
                  }}
                >
                  Cancel
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: config.padding,
                  backgroundColor: '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: config.fontSize,
                  fontWeight: '600'
                }}
              >
                Edit Rating
              </button>
              
              <button
                onClick={() => setShowConfirmDelete(true)}
                style={{
                  padding: config.padding,
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: config.fontSize
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Delete Rating</h4>
            <p style={{ margin: '0 0 20px 0', color: '#7f8c8d' }}>
              Are you sure you want to delete your rating? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirmDelete(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingComponent;