import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const API_URL = 'http://localhost:5001/api';

const Testimonial = () => {
  const { showSuccessMessage } = useCart();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    content: ''
  });

  // Fetch reviews from API
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/reviews`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          body: formData.content.trim(),
          rating: parseInt(rating, 10),
          author: formData.name.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setFormData({ name: '', email: '', title: '', content: '' });
        setRating(5);
        showSuccessMessage('Review submitted successfully!');
        // Refresh reviews to show the new one
        fetchReviews();
      } else {
        showSuccessMessage(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showSuccessMessage('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < count ? '★' : '☆';
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', dateOptions);
  };

  return (
    <div>
      <div className="testimonial-container">
        {/* Left Column: Reviews */}
        <div className="testimonial-left">
          <h2 className="testimonial-title">Testimonials</h2>
          <div className="reviews-container">
            {loading ? (
              <div className="loading-spinner">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-title">{review.title}</div>
                  <div className="review-date">{formatDate(review.createdAt)}</div>
                  <div className="review-stars">{renderStars(review.rating)}</div>
                  <div className="review-body">{review.body}</div>
                  <div className="review-author">- {review.author}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="testimonial-right">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="form-label">Name *</label>
              <div className="form-input">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Email *</label>
              <div className="form-input">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Review Title *</label>
              <div className="form-input">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Rating *</label>
              <div className="form-input" style={{ display: 'flex', alignItems: 'center' }}>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={value <= rating ? 'active' : ''}
                      onClick={() => !submitting && setRating(value)}
                      style={{ cursor: submitting ? 'not-allowed' : 'pointer' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-row">
              <label className="form-label">Review Content *</label>
              <div className="form-input">
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="submit-row" style={{ width: '100%' }}>
                <div className="form-input">
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Testimonial;
