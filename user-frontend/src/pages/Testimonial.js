import React, { useState } from 'react';
import Footer from '../components/Footer';
import { initialReviews } from '../data/products';
import { useCart } from '../context/CartContext';

const Testimonial = () => {
  const { showSuccessMessage } = useCart();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    content: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', dateOptions);
    
    const newReview = {
      id: Date.now(),
      title: formData.title,
      date: today,
      rating: rating,
      body: formData.content,
      author: formData.name
    };
    
    setReviews(prev => [newReview, ...prev]);
    setFormData({ name: '', email: '', title: '', content: '' });
    setRating(5);
    showSuccessMessage('Review submitted successfully!');
  };

  const renderStars = (count) => {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < count ? '★' : '☆';
    }
    return stars;
  };

  return (
    <div>
      <div className="testimonial-container">
        {/* Left Column: Reviews */}
        <div className="testimonial-left">
          <h2 className="testimonial-title">Testimonials</h2>
          <div className="reviews-container">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-title">{review.title}</div>
                <div className="review-date">{review.date}</div>
                <div className="review-stars">{renderStars(review.rating)}</div>
                <div className="review-body">{review.body}</div>
                <div className="review-author">- {review.author}</div>
              </div>
            ))}
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
                      onClick={() => setRating(value)}
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
                />
              </div>
            </div>

            <div className="form-row">
              <div className="submit-row" style={{ width: '100%' }}>
                <div className="form-label" style={{ background: 'transparent' }}></div>
                <div className="form-input">
                  <button type="submit" className="submit-btn">Submit</button>
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
