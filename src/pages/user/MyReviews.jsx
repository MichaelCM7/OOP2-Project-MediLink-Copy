import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    review: '',
    wouldRecommend: true,
    waitTime: '',
    categories: {
      bedside_manner: 5,
      wait_time: 5,
      helpfulness: 5,
      knowledge: 5
    }
  });
  const [completedAppointments, setCompletedAppointments] = useState([]);

  const location = useLocation();
  const appointmentId = new URLSearchParams(location.search).get('appointment');

  useEffect(() => {
    fetchReviews();
    fetchCompletedAppointments();
    if (appointmentId) {
      setShowReviewForm(true);
      // Find the appointment to review
      const appointment = completedAppointments.find(apt => apt.id.toString() === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
      }
    }
  }, [appointmentId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockReviews = [
        {
          id: 1,
          doctorName: 'Dr. Sarah Johnson',
          doctorSpecialty: 'Cardiology',
          hospital: 'City General Hospital',
          appointmentDate: '2024-01-05',
          reviewDate: '2024-01-06',
          rating: 5,
          title: 'Excellent care and attention',
          review: 'Dr. Johnson was extremely thorough and took time to explain my condition. The staff was professional and the facility was clean.',
          wouldRecommend: true,
          waitTime: '15 minutes',
          categories: {
            bedside_manner: 5,
            wait_time: 4,
            helpfulness: 5,
            knowledge: 5
          },
          helpful: 12,
          reported: false
        },
        {
          id: 2,
          doctorName: 'Dr. Emily Rodriguez',
          doctorSpecialty: 'Dermatology',
          hospital: 'Skin Care Clinic',
          appointmentDate: '2023-12-20',
          reviewDate: '2023-12-21',
          rating: 4,
          title: 'Good treatment, longer wait',
          review: 'Dr. Rodriguez was knowledgeable and the treatment was effective. However, I had to wait longer than expected.',
          wouldRecommend: true,
          waitTime: '45 minutes',
          categories: {
            bedside_manner: 4,
            wait_time: 3,
            helpfulness: 4,
            knowledge: 5
          },
          helpful: 8,
          reported: false
        }
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedAppointments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAppointments = [
        {
          id: 3,
          doctorName: 'Dr. Michael Chen',
          doctorSpecialty: 'General Practice',
          hospital: 'Metro Medical Center',
          date: '2024-01-10',
          hasReview: false
        },
        {
          id: 4,
          doctorName: 'Dr. David Wilson',
          doctorSpecialty: 'Orthopedics',
          hospital: 'Sports Medicine Center',
          date: '2024-01-08',
          hasReview: false
        }
      ];
      setCompletedAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setReviewForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryRating = (category, rating) => {
    setReviewForm(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: rating
      }
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to submit review
      const newReview = {
        id: reviews.length + 1,
        doctorName: selectedAppointment.doctorName,
        doctorSpecialty: selectedAppointment.doctorSpecialty,
        hospital: selectedAppointment.hospital,
        appointmentDate: selectedAppointment.date,
        reviewDate: new Date().toISOString().split('T')[0],
        ...reviewForm,
        helpful: 0,
        reported: false
      };

      setReviews(prev => [newReview, ...prev]);
      setShowReviewForm(false);
      setSelectedAppointment(null);
      setReviewForm({
        rating: 5,
        title: '',
        review: '',
        wouldRecommend: true,
        waitTime: '',
        categories: {
          bedside_manner: 5,
          wait_time: 5,
          helpfulness: 5,
          knowledge: 5
        }
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (reviewId) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setReviewForm({
        rating: review.rating,
        title: review.title,
        review: review.review,
        wouldRecommend: review.wouldRecommend,
        waitTime: review.waitTime,
        categories: review.categories
      });
      setSelectedAppointment({
        doctorName: review.doctorName,
        doctorSpecialty: review.doctorSpecialty,
        hospital: review.hospital,
        date: review.appointmentDate
      });
      setShowReviewForm(true);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'div'}
            onClick={interactive ? () => onChange(star) : undefined}
            className={`text-xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const renderReviewForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Write a Review</h2>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {selectedAppointment && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium">{selectedAppointment.doctorName}</h3>
              <p className="text-sm text-gray-600">{selectedAppointment.doctorSpecialty}</p>
              <p className="text-sm text-gray-600">{selectedAppointment.hospital}</p>
              <p className="text-sm text-gray-500">Appointment: {selectedAppointment.date}</p>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              {renderStars(reviewForm.rating, true, (rating) => handleInputChange('rating', rating))}
            </div>

            {/* Category Ratings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rate Your Experience
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'bedside_manner', label: 'Bedside Manner' },
                  { key: 'wait_time', label: 'Wait Time' },
                  { key: 'helpfulness', label: 'Helpfulness' },
                  { key: 'knowledge', label: 'Knowledge' }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <span className="text-sm text-gray-600">{label}</span>
                    {renderStars(
                      reviewForm.categories[key],
                      true,
                      (rating) => handleCategoryRating(key, rating)
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                id="title"
                value={reviewForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Summarize your experience"
                required
              />
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                id="review"
                value={reviewForm.review}
                onChange={(e) => handleInputChange('review', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share details about your experience..."
                required
              />
            </div>

            {/* Wait Time */}
            <div>
              <label htmlFor="waitTime" className="block text-sm font-medium text-gray-700 mb-2">
                Approximate Wait Time
              </label>
              <select
                id="waitTime"
                value={reviewForm.waitTime}
                onChange={(e) => handleInputChange('waitTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select wait time</option>
                <option value="0-15 minutes">0-15 minutes</option>
                <option value="15-30 minutes">15-30 minutes</option>
                <option value="30-45 minutes">30-45 minutes</option>
                <option value="45-60 minutes">45-60 minutes</option>
                <option value="Over 1 hour">Over 1 hour</option>
              </select>
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Would you recommend this doctor?
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={true}
                    checked={reviewForm.wouldRecommend === true}
                    onChange={() => handleInputChange('wouldRecommend', true)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={false}
                    checked={reviewForm.wouldRecommend === false}
                    onChange={() => handleInputChange('wouldRecommend', false)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading && !showReviewForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
              <p className="text-gray-600">Share your experiences with doctors and hospitals</p>
            </div>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write Review
            </button>
          </div>
        </div>

        {/* Pending Reviews */}
        {completedAppointments.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Appointments Ready for Review
            </h2>
            <div className="space-y-3">
              {completedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex justify-between items-center bg-white rounded-lg p-4"
                >
                  <div>
                    <h3 className="font-medium">{appointment.doctorName}</h3>
                    <p className="text-sm text-gray-600">{appointment.doctorSpecialty}</p>
                    <p className="text-sm text-gray-500">{appointment.date}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowReviewForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Write Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              Share your experiences to help other patients make informed decisions
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write Your First Review
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{review.doctorName}</h3>
                    <p className="text-gray-600">{review.doctorSpecialty}</p>
                    <p className="text-gray-500 text-sm">{review.hospital}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditReview(review.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      Reviewed on {review.reviewDate}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-700">{review.review}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  {Object.entries(review.categories).map(([category, rating]) => (
                    <div key={category}>
                      <span className="text-gray-600 capitalize">
                        {category.replace('_', ' ')}:
                      </span>
                      <div className="flex items-center">
                        {renderStars(rating)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <span>Wait time: {review.waitTime}</span>
                    <span>
                      {review.wouldRecommend ? '✓ Recommends' : '✗ Does not recommend'}
                    </span>
                  </div>
                  <span>{review.helpful} people found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Form Modal */}
        {showReviewForm && renderReviewForm()}
      </div>
    </div>
  );
};

export default MyReviews;