import React from 'react';
import { useQuery } from 'react-query';
import { dashboardAPI } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const { isDark } = useTheme();
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    dashboardAPI.getStats,
    {
      refetchInterval: 30000,
    }
  );

  const { data: salesData, isLoading: salesLoading } = useQuery(
    'salesChart',
    dashboardAPI.getSalesChart
  );

  const dashboardData = stats?.data;
  const chartData = salesData?.data;

  const statCards = [
    {
      title: 'Total Products',
      value: dashboardData?.totals?.products || 0,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgGlow: 'bg-blue-500/10',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      href: '/products',
      change: '+12%',
      changeType: 'up'
    },
    {
      title: 'Total Users',
      value: dashboardData?.totals?.users || 0,
      icon: Users,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGlow: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      href: '/users',
      change: '+8%',
      changeType: 'up'
    },
    {
      title: 'Total Orders',
      value: dashboardData?.totals?.orders || 0,
      icon: ShoppingCart,
      gradient: 'from-amber-500 to-orange-600',
      bgGlow: 'bg-amber-500/10',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      href: '/orders',
      change: '+23%',
      changeType: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: `$${(dashboardData?.totals?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-primary-500 to-primary-600',
      bgGlow: 'bg-primary-500/10',
      iconBg: 'bg-primary-500/20',
      iconColor: 'text-primary-400',
      growth: dashboardData?.monthlyComparison?.revenueGrowth,
      change: dashboardData?.monthlyComparison?.revenueGrowth ? `${Math.abs(parseFloat(dashboardData.monthlyComparison.revenueGrowth))}%` : '+15%',
      changeType: dashboardData?.monthlyComparison?.revenueGrowth >= 0 ? 'up' : 'down'
    }
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Clock className="w-4 h-4" />
            Last updated: Just now
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`relative group overflow-hidden backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${
                isDark 
                  ? 'bg-dark-800/50 border-dark-700/50 hover:border-dark-600' 
                  : 'bg-white/70 border-gray-200/50 hover:border-gray-300'
              }`}
            >
              {/* Background glow effect */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 ${stat.bgGlow} rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  {stat.href && (
                    <Link 
                      to={stat.href} 
                      className={`p-2 rounded-lg transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600' 
                          : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                  <p className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    stat.changeType === 'up' 
                      ? 'bg-success-500/15 text-success-400' 
                      : 'bg-error-500/15 text-error-400'
                  }`}>
                    {stat.changeType === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>vs last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - Takes 2 columns */}
        <div className={`lg:col-span-2 backdrop-blur-sm border rounded-2xl p-6 ${
          isDark 
            ? 'bg-dark-800/50 border-dark-700/50' 
            : 'bg-white/70 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sales Overview</h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Daily revenue for the last 30 days</p>
            </div>
            <button className={`p-2 rounded-lg transition-all ${
              isDark 
                ? 'bg-dark-700/50 text-gray-400 hover:text-white hover:bg-dark-600' 
                : 'bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200'
            }`}>
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          
          {salesLoading ? (
            <div className="flex items-center justify-center h-72">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="_id" 
                    stroke={isDark ? '#6B7280' : '#9ca3af'}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke={isDark ? '#6B7280' : '#9ca3af'} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}
                    labelStyle={{ color: isDark ? '#9CA3AF' : '#6b7280' }}
                    itemStyle={{ color: isDark ? '#fff' : '#111827' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
          isDark 
            ? 'bg-dark-800/50 border-dark-700/50' 
            : 'bg-white/70 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Status</h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Current distribution</p>
            </div>
          </div>
          <div className="space-y-4">
            {dashboardData?.orderStatusDistribution?.map((status, index) => {
              const total = dashboardData?.orderStatusDistribution?.reduce((acc, s) => acc + s.count, 0) || 1;
              const percentage = Math.round((status.count / total) * 100);
              return (
                <div key={status._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusVariant(status._id)}>
                        {status._id}
                      </Badge>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{status.count}</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getStatusColor(status._id)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
          isDark 
            ? 'bg-dark-800/50 border-dark-700/50' 
            : 'bg-white/70 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Orders</h3>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Latest customer orders</p>
            </div>
            <Link 
              to="/orders" 
              className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData?.recentOrders?.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-dark-600' : 'text-gray-300'}`} />
                <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>No orders yet</p>
              </div>
            ) : (
              dashboardData?.recentOrders?.map((order) => (
                <div 
                  key={order._id} 
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors group ${
                    isDark 
                      ? 'bg-dark-700/30 hover:bg-dark-700/50' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-dark-600' : 'bg-gray-200'
                    }`}>
                      <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        #{order.orderNumber}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {order.customer?.name || order.guestCustomer?.name || 'Guest'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${order.totalAmount?.toFixed(2)}
                    </p>
                    <Badge variant={getStatusVariant(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
          isDark 
            ? 'bg-dark-800/50 border-dark-700/50' 
            : 'bg-white/70 border-gray-200/50'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning-500" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Low Stock Alert</h3>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Products running low</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {dashboardData?.lowStockProducts?.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-success-500/50 mx-auto mb-3" />
                <p className="text-success-400 font-medium">All products are well stocked!</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No inventory alerts at this time</p>
              </div>
            ) : (
              dashboardData?.lowStockProducts?.map((product) => (
                <div 
                  key={product._id} 
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors border-l-4 border-warning-500 ${
                    isDark 
                      ? 'bg-dark-700/30 hover:bg-dark-700/50' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDark ? 'bg-dark-600' : 'bg-gray-200'
                    }`}>
                      <Package className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {product.name}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-error-400">
                      {product.stock} left
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Min: {product.lowStockThreshold}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusVariant = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'refunded':
      return 'error';
    case 'processing':
    case 'shipped':
      return 'info';
    default:
      return 'default';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-gradient-to-r from-warning-500 to-warning-600';
    case 'confirmed':
    case 'delivered':
      return 'bg-gradient-to-r from-success-500 to-success-600';
    case 'cancelled':
    case 'refunded':
      return 'bg-gradient-to-r from-error-500 to-error-600';
    case 'processing':
    case 'shipped':
      return 'bg-gradient-to-r from-accent-500 to-accent-600';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600';
  }
};

export default Dashboard;