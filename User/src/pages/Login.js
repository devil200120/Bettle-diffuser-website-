import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
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

    try {
      // API call will be integrated later
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if email verification is required
        if (response.status === 403 && data.requiresVerification) {
          navigate('/verification-pending', { state: { email: data.email } });
          return;
        }
        // Check if user is banned
        if (response.status === 403 && data.isBanned) {
          setError(`🚫 Your account has been banned. Reason: ${data.bannedReason || 'Violation of terms and conditions'}`);
          setLoading(false);
          return;
        }
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Dispatch custom event to update navbar
      window.dispatchEvent(new Event('userLogin'));

      // Redirect to home or previous page
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800">
      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <div className="w-full max-w-md bg-zinc-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h1>
          <p className="text-zinc-400 text-center mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label htmlFor="password" className="block text-zinc-300 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-zinc-400 hover:text-yellow-400 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-zinc-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-600"></div>
            <span className="text-zinc-500 text-sm">or</span>
            <div className="flex-1 h-px bg-zinc-600"></div>
          </div>

          <p className="text-center text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
