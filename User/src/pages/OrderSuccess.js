import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const accountCreated = location.state?.accountCreated;
  const email = location.state?.email;
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#efd93e', '#f05454', '#99f443', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-5 pt-24 pb-12">
        <div className="max-w-2xl w-full">
          {/* Success Animation Container */}
          <div className="bg-zinc-800/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl text-center shadow-2xl border border-zinc-700">
            
            {/* Animated Success Icon */}
            <div className="relative mb-8">
              <div className="w-28 h-28 mx-auto relative">
                {/* Outer ring animation */}
                <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-ping"></div>
                {/* Main circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Success Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                Order Placed Successfully!
              </span>
            </h1>
            
            <p className="text-zinc-400 text-lg mb-8">
              🎉 Thank you for shopping with Beetle Diffuser!
            </p>
            
            {/* Order Details Card */}
            {order ? (
              <div className="bg-zinc-700/50 p-6 rounded-2xl mb-8 text-left border border-zinc-600">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-2xl">📦</span>
                  <h3 className="text-xl font-bold text-yellow-400">Order Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔢</span>
                      <span className="text-zinc-400">Order Number</span>
                    </div>
                    <span className="text-yellow-400 font-bold text-lg tracking-wider">{order.orderNumber}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <span className="text-zinc-400">Total Amount</span>
                    </div>
                    <span className="text-white font-bold text-xl">₹{order.totalAmount?.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📋</span>
                      <span className="text-zinc-400">Status</span>
                    </div>
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg shadow-green-500/30">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-700/50 p-6 rounded-2xl mb-8 border border-zinc-600">
                <p className="text-zinc-400">Your order has been successfully placed!</p>
              </div>
            )}

            {/* Info Messages */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center gap-3 text-zinc-400 bg-zinc-700/30 p-3 rounded-lg">
                <span className="text-xl">📧</span>
                <span className="text-sm">A confirmation email has been sent to your email address</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-zinc-400 bg-zinc-700/30 p-3 rounded-lg">
                <span className="text-xl">🚚</span>
                <span className="text-sm">Your order will be delivered within 5-7 business days</span>
              </div>
              
              {/* Account Created Message */}
              {accountCreated && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">🎉</span>
                    <h4 className="text-green-400 font-bold">Account Created!</h4>
                  </div>
                  <p className="text-zinc-300 text-sm mb-2">
                    We've automatically created an account for you using your checkout information.
                  </p>
                  <p className="text-zinc-400 text-sm">
                    Check your email <span className="text-yellow-400 font-medium">({email})</span> to set your password and access your account.
                  </p>
                  <div className="mt-3 text-xs text-zinc-500">
                    With your account, you can track orders, view order history, and enjoy faster checkout!
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/orders')}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View My Orders
              </button>
              <button 
                onClick={() => navigate('/')}
                className="flex-1 py-4 px-6 bg-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-600 transition-all transform hover:scale-105 border border-zinc-600 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Continue Shopping
              </button>
            </div>
            
            {/* Track Order Link */}
            {order && (
              <p className="mt-6 text-zinc-500 text-sm">
                Track your order anytime using order number: <span className="text-yellow-400 font-semibold">{order.orderNumber}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
