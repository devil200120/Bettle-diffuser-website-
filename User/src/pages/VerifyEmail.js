import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [expiredEmail, setExpiredEmail] = useState('');

  useEffect(() => {
    // Add a small delay to prevent UI flashing
    const timer = setTimeout(() => {
      verifyEmail();
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email/${token}`, {
        method: 'GET'
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        // Check for specific error types
        if (data.alreadyVerified) {
          setAlreadyVerified(true);
          setSuccess(true); // Show as success since they're verified
        } else if (data.expired) {
          setExpired(true);
          setExpiredEmail(data.email || '');
        }
        throw new Error(data.message || 'Verification failed');
      }

      setSuccess(true);
      setError('');
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      if (!alreadyVerified) {
        setSuccess(false);
      }
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!expiredEmail) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: expiredEmail })
      });

      const data = await response.json();
      
      if (response.ok) {
        setError('');
        alert('Verification email sent! Please check your inbox.');
        navigate('/login');
      } else {
        setError(data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800">
      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4">
        <div className="w-full max-w-md bg-zinc-700 rounded-2xl p-8 shadow-2xl text-center">
          {loading ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mb-4 animate-pulse">
                <span className="text-4xl">⏳</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verifying Your Email...</h1>
              <p className="text-zinc-400">Please wait while we verify your email address.</p>
            </>
          ) : success ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-zinc-400 mb-6">
                Your email has been successfully verified. You can now login to your account.
              </p>
              <div className="bg-zinc-600 rounded-lg p-4 mb-6">
                <p className="text-zinc-300 text-sm">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Login Now
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                <span className="text-4xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
                <p className="text-red-400">{error}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Register Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
