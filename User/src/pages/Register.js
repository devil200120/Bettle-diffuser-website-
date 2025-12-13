import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Check if verification is required
      if (data.requiresVerification) {
        // Redirect to verification pending page
        navigate('/verification-pending', { state: { email: data.email } });
      } else {
        // Store token and user data (backward compatibility)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to home
        navigate('/');
        window.location.reload(); // Refresh to update navbar
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800">
      <div className="flex items-center justify-center min-h-screen pt-24 pb-12 px-4">
        <div className="w-full max-w-md bg-zinc-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Create Account</h1>
          <p className="text-zinc-400 text-center mb-8">Join Beetle Diffuser today</p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-zinc-300 text-sm mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-zinc-300 text-sm mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-zinc-300 text-sm mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-zinc-300 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-zinc-900 font-bold py-3 px-6 rounded-lg transition-colors mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-600"></div>
            <span className="text-zinc-500 text-sm">or</span>
            <div className="flex-1 h-px bg-zinc-600"></div>
          </div>

          <p className="text-center text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
