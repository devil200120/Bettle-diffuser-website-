import React, { useState } from 'react';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Contact = () => {
  const { showSuccessMessage } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: 'Contact Form Submission',
          message: formData.description
        })
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessMessage('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', description: '' });
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>
        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
