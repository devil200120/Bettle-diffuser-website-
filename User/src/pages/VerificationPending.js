import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const VerificationPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendVerification = async () => {
    if (!email) {
      setError('Email address not found. Please register again.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800">
      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <div className="w-full max-w-lg bg-zinc-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mb-4">
              <span className="text-4xl">📧</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-zinc-400">
              We've sent a verification link to
            </p>
            <p className="text-yellow-400 font-semibold mt-1">{email}</p>
          </div>

          <div className="bg-zinc-600 rounded-lg p-6 mb-6">
            <h3 className="text-white font-semibold mb-3">📬 Check Your Inbox</h3>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>Click the verification link in the email we sent you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>The link will expire in 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>Check your spam folder if you don't see it</span>
              </li>
            </ul>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 text-green-400 border border-green-500 text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500 text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-zinc-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Already verified?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                Login Now
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerificationPending;
