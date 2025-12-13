import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const TrackOrder = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchOrderNumber, setSearchOrderNumber] = useState(orderNumber || '');

  useEffect(() => {
    if (orderNumber) {
      fetchOrderByNumber(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchOrderByNumber = async (number) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${API_URL}/orders/track/${number}`, {
        headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check the order number and try again.');
        }
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      setError(error.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchOrderNumber.trim()) {
      navigate(`/track-order/${searchOrderNumber.trim()}`);
      fetchOrderByNumber(searchOrderNumber.trim());
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const orderStatuses = [
    { key: 'pending', label: 'Order Placed', icon: '📝', description: 'Your order has been placed successfully' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅', description: 'Your order has been confirmed' },
    { key: 'processing', label: 'Processing', icon: '⚙️', description: 'Your order is being prepared' },
    { key: 'shipped', label: 'Shipped', icon: '🚚', description: 'Your order is on the way' },
    { key: 'delivered', label: 'Delivered', icon: '📦', description: 'Your order has been delivered' }
  ];

  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1;
    return orderStatuses.findIndex(s => s.key === status);
  };

  const getEstimatedDelivery = (createdAt) => {
    const orderDate = new Date(createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-zinc-800 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-zinc-400">Enter your order number to track your shipment</p>
        </div>

        {/* Search Box */}
        <div className="bg-zinc-700 rounded-2xl p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value.toUpperCase())}
                placeholder="Enter Order Number (e.g., BD1234567890)"
                className="w-full bg-zinc-600 border border-zinc-500 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-yellow-400 transition-colors placeholder-zinc-400 font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Track Order
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-white mb-2">Order Not Found</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <Link 
              to="/orders" 
              className="inline-block bg-zinc-600 hover:bg-zinc-500 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              View My Orders
            </Link>
          </div>
        )}

        {/* No Order Number State */}
        {!orderNumber && !loading && !error && (
          <div className="bg-zinc-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Track Your Shipment</h2>
            <p className="text-zinc-400 mb-6">Enter your order number above to see the current status of your order</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/orders" 
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                View My Orders
              </Link>
              <Link 
                to="/" 
                className="inline-block bg-zinc-600 hover:bg-zinc-500 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Order Found - Show Tracking */}
        {order && !loading && (
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-zinc-700 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/10 p-6 border-b border-zinc-600">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm">Order Number</p>
                    <p className="text-2xl font-bold text-yellow-400 font-mono">
                      #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                    </p>
                    {order.trackingNumber && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-cyan-400">🚚</span>
                        <div>
                          <p className="text-zinc-400 text-xs">Tracking Number</p>
                          <p className="text-cyan-400 font-semibold font-mono text-sm">{order.trackingNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-sm">Order Date</p>
                    <p className="text-white font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Cancelled Order */}
              {order.status === 'cancelled' ? (
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">❌</span>
                  </div>
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Order Cancelled</h3>
                  <p className="text-zinc-400 mb-4">This order has been cancelled</p>
                  {order.cancelReason && (
                    <p className="text-zinc-500 text-sm">Reason: {order.cancelReason}</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Progress Timeline */}
                  <div className="p-6">
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-600"></div>
                      <div 
                        className="absolute left-6 top-0 w-0.5 bg-yellow-400 transition-all duration-500"
                        style={{ 
                          height: `${Math.max(0, (getStatusIndex(order.status) / (orderStatuses.length - 1)) * 100)}%` 
                        }}
                      ></div>

                      {/* Status Steps */}
                      <div className="space-y-8">
                        {orderStatuses.map((status, index) => {
                          const currentIndex = getStatusIndex(order.status);
                          const isCompleted = index <= currentIndex;
                          const isCurrent = index === currentIndex;

                          return (
                            <div key={status.key} className="relative flex items-start gap-4 pl-0">
                              {/* Status Icon */}
                              <div className={`
                                relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl
                                transition-all duration-300
                                ${isCompleted 
                                  ? 'bg-yellow-400 text-zinc-900 shadow-lg shadow-yellow-400/30' 
                                  : 'bg-zinc-600 text-zinc-400'
                                }
                                ${isCurrent ? 'ring-4 ring-yellow-400/30 animate-pulse' : ''}
                              `}>
                                {status.icon}
                              </div>

                              {/* Status Content */}
                              <div className="flex-1 pt-1">
                                <h4 className={`font-semibold ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                                  {status.label}
                                </h4>
                                <p className={`text-sm ${isCompleted ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                  {status.description}
                                </p>
                                {isCurrent && (
                                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-medium rounded-full">
                                    Current Status
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  {order.status !== 'delivered' && (
                    <div className="bg-zinc-800/50 p-4 mx-6 mb-6 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                          <span className="text-xl">📅</span>
                        </div>
                        <div>
                          <p className="text-zinc-400 text-sm">Estimated Delivery</p>
                          <p className="text-white font-medium">{getEstimatedDelivery(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-zinc-700 rounded-2xl overflow-hidden">
              <div className="p-4 bg-zinc-600/50 border-b border-zinc-600">
                <h3 className="text-lg font-semibold text-white">Order Items</h3>
              </div>
              <div className="p-4 space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-16 bg-zinc-600 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📷</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{item.product?.name || 'Product'}</h4>
                      <p className="text-zinc-400 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-yellow-400 font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-zinc-600/30 border-t border-zinc-600 flex justify-between items-center">
                <span className="text-zinc-400">Total Amount</span>
                <span className="text-2xl font-bold text-yellow-400">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-zinc-700 rounded-2xl overflow-hidden">
              <div className="p-4 bg-zinc-600/50 border-b border-zinc-600">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📍</span> Delivery Address
                </h3>
              </div>
              <div className="p-4">
                <p className="text-white font-medium">{order.shippingAddress?.name}</p>
                <p className="text-zinc-400 text-sm mt-1">{order.shippingAddress?.formattedAddress}</p>
                {order.shippingAddress?.phone && (
                  <p className="text-zinc-400 text-sm mt-1">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/orders" 
                className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-medium py-3 px-6 rounded-xl transition-colors text-center"
              >
                View All Orders
              </Link>
              <Link 
                to="/contact" 
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold py-3 px-6 rounded-xl transition-colors text-center"
              >
                Need Help?
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrder;
