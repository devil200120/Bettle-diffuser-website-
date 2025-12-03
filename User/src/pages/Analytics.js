import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Analytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    ordersByStatus: {},
    ordersByMonth: [],
    topProducts: [],
    recentActivity: []
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const ordersList = data.orders || data || [];
        setOrders(ordersList);
        calculateAnalytics(ordersList);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (ordersList) => {
    if (!ordersList.length) {
      setAnalytics({
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
        ordersByMonth: [],
        topProducts: [],
        recentActivity: []
      });
      return;
    }

    // Total orders and spending
    const totalOrders = ordersList.length;
    const totalSpent = ordersList.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const averageOrderValue = totalSpent / totalOrders;

    // Orders by status
    const ordersByStatus = ordersList.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Orders by month (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthOrders = ordersList.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === date.getFullYear() && 
               orderDate.getMonth() === date.getMonth();
      });
      
      last6Months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        orders: monthOrders.length,
        spent: monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      });
    }

    // Top products
    const productCount = {};
    ordersList.forEach(order => {
      (order.items || []).forEach(item => {
        const name = item.name || 'Unknown Product';
        if (!productCount[name]) {
          productCount[name] = { name, count: 0, totalSpent: 0 };
        }
        productCount[name].count += item.quantity || 1;
        productCount[name].totalSpent += (item.price || 0) * (item.quantity || 1);
      });
    });
    const topProducts = Object.values(productCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity
    const recentActivity = ordersList
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        amount: order.totalAmount
      }));

    setAnalytics({
      totalOrders,
      totalSpent,
      averageOrderValue,
      ordersByStatus,
      ordersByMonth: last6Months,
      topProducts,
      recentActivity
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      processing: 'bg-purple-500',
      shipped: 'bg-indigo-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-zinc-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📦';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate max value for chart scaling
  const maxSpent = Math.max(...analytics.ordersByMonth.map(m => m.spent), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-800 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-800 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Analytics</h1>
            <p className="text-zinc-400 mt-1">Track your shopping insights and order history</p>
          </div>
          <Link 
            to="/orders"
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className="bg-zinc-700 rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-zinc-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Analytics Yet</h2>
            <p className="text-zinc-400 mb-6">Start shopping to see your analytics and insights here!</p>
            <Link 
              to="/"
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Orders */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/80 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
              </div>

              {/* Total Spent */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/80 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-white">₹{analytics.totalSpent.toFixed(0)}</p>
              </div>

              {/* Average Order Value */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/80 text-sm">Avg. Order Value</p>
                <p className="text-3xl font-bold text-white">₹{analytics.averageOrderValue.toFixed(0)}</p>
              </div>

              {/* Delivered Orders */}
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/80 text-sm">Delivered</p>
                <p className="text-3xl font-bold text-white">{analytics.ordersByStatus.delivered || 0}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Spending Chart */}
              <div className="bg-zinc-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Spending Over Time</h3>
                <div className="flex items-end justify-between gap-2 h-48">
                  {analytics.ordersByMonth.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center justify-end h-36">
                        <span className="text-yellow-400 text-xs mb-1 font-medium">
                          {month.spent > 0 ? `₹${(month.spent / 1000).toFixed(1)}k` : ''}
                        </span>
                        <div 
                          className="w-full max-w-[40px] bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg transition-all duration-500"
                          style={{ 
                            height: `${Math.max((month.spent / maxSpent) * 100, month.spent > 0 ? 10 : 0)}%`,
                            minHeight: month.spent > 0 ? '20px' : '0'
                          }}
                        ></div>
                      </div>
                      <span className="text-zinc-400 text-xs mt-2">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-zinc-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Order Status</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.ordersByStatus).map(([status, count]) => {
                    const percentage = (count / analytics.totalOrders) * 100;
                    return (
                      <div key={status}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-zinc-300 capitalize flex items-center gap-2">
                            <span>{getStatusIcon(status)}</span>
                            {status}
                          </span>
                          <span className="text-white font-medium">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-3 bg-zinc-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getStatusColor(status)} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-zinc-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Top Products</h3>
                {analytics.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                          ${index === 0 ? 'bg-yellow-400 text-zinc-900' : 
                            index === 1 ? 'bg-zinc-400 text-zinc-900' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-zinc-600 text-white'}`}
                        >
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{product.name}</p>
                          <p className="text-zinc-400 text-sm">Ordered {product.count} times</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-semibold">₹{product.totalSpent.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-8">No product data available</p>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-zinc-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                {analytics.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity, index) => (
                      <Link 
                        key={index} 
                        to={`/track-order/${activity.orderNumber}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-600 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                          <span className="text-lg">{getStatusIcon(activity.status)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium">Order #{activity.orderNumber}</p>
                          <p className="text-zinc-400 text-sm">{formatDate(activity.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-400 font-semibold">₹{activity.amount?.toFixed(0) || 0}</p>
                          <p className="text-zinc-400 text-xs capitalize">{activity.status}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-zinc-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  to="/"
                  className="flex flex-col items-center gap-2 p-4 bg-zinc-600 rounded-xl hover:bg-zinc-500 transition-colors"
                >
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium">Shop Now</span>
                </Link>
                <Link 
                  to="/orders"
                  className="flex flex-col items-center gap-2 p-4 bg-zinc-600 rounded-xl hover:bg-zinc-500 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium">My Orders</span>
                </Link>
                <Link 
                  to="/track-order"
                  className="flex flex-col items-center gap-2 p-4 bg-zinc-600 rounded-xl hover:bg-zinc-500 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium">Track Order</span>
                </Link>
                <Link 
                  to="/profile"
                  className="flex flex-col items-center gap-2 p-4 bg-zinc-600 rounded-xl hover:bg-zinc-500 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-400/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium">Profile</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Analytics;
