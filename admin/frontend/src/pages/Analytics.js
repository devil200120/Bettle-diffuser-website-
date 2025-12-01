import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MousePointer,
  Clock,
  Target,
  PieChart,
  Activity,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const Analytics = () => {
  const { isDark } = useTheme();
  const [dateRange, setDateRange] = useState('7d');

  const { data: dashboardData, isLoading, refetch, isFetching } = useQuery(
    'dashboard',
    dashboardAPI.getStats,
    {
      refetchInterval: 60000,
    }
  );

  const stats = dashboardData?.data || {};

  // Mock analytics data (in real app, this would come from API)
  const analyticsData = {
    pageViews: 45892,
    pageViewsChange: 12.5,
    uniqueVisitors: 12453,
    visitorsChange: 8.3,
    avgSessionDuration: '4m 32s',
    sessionChange: -2.1,
    bounceRate: 42.3,
    bounceChange: -5.2,
    conversionRate: 3.8,
    conversionChange: 15.2,
    avgOrderValue: stats.averageOrderValue || 156.50,
    aovChange: 7.8,
  };

  const topProducts = [
    { name: 'Beetle Lite Diffuser', sales: 342, revenue: 25650, growth: 23.5 },
    { name: 'Beetle Pro Diffuser', sales: 256, revenue: 38400, growth: 15.2 },
    { name: 'Essential Oil Set', sales: 189, revenue: 5670, growth: 8.7 },
    { name: 'Beetle Mini', sales: 156, revenue: 7800, growth: -3.2 },
    { name: 'Replacement Pads (10pk)', sales: 134, revenue: 2010, growth: 45.1 },
  ];

  const trafficSources = [
    { source: 'Organic Search', visitors: 5234, percentage: 42, color: 'bg-primary-500' },
    { source: 'Direct', visitors: 3156, percentage: 25, color: 'bg-accent-500' },
    { source: 'Social Media', visitors: 2089, percentage: 17, color: 'bg-success-500' },
    { source: 'Referral', visitors: 1245, percentage: 10, color: 'bg-warning-500' },
    { source: 'Email', visitors: 729, percentage: 6, color: 'bg-error-500' },
  ];

  const deviceStats = [
    { device: 'Desktop', icon: Monitor, percentage: 52, sessions: 6476 },
    { device: 'Mobile', icon: Smartphone, percentage: 41, sessions: 5106 },
    { device: 'Tablet', icon: Globe, percentage: 7, sessions: 871 },
  ];

  const recentActivity = [
    { action: 'New order', detail: 'Order #1234 - $256.00', time: '2 min ago', type: 'order' },
    { action: 'New user', detail: 'john.doe@email.com registered', time: '5 min ago', type: 'user' },
    { action: 'Product view', detail: 'Beetle Pro Diffuser - 45 views', time: '12 min ago', type: 'view' },
    { action: 'Review', detail: '5-star review on Beetle Lite', time: '18 min ago', type: 'review' },
    { action: 'Cart abandoned', detail: '3 items worth $189.00', time: '25 min ago', type: 'cart' },
  ];

  const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '', iconBg }) => (
    <div className={`backdrop-blur-sm border rounded-2xl p-5 transition-all hover:shadow-lg ${
      isDark 
        ? 'bg-dark-800/50 border-dark-700/50 hover:border-dark-600' 
        : 'bg-white/70 border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
          change >= 0 
            ? 'bg-success-500/20 text-success-400' 
            : 'bg-error-500/20 text-error-400'
        }`}>
          {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/25">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Track your store performance and insights</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={`px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all cursor-pointer ${
              isDark 
                ? 'bg-dark-800/50 border-dark-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`p-2.5 border rounded-xl transition-all ${
              isDark 
                ? 'bg-dark-800/50 border-dark-700 text-gray-400 hover:text-white hover:bg-dark-700'
                : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Page Views"
          value={analyticsData.pageViews}
          change={analyticsData.pageViewsChange}
          icon={Eye}
          iconBg="bg-gradient-to-br from-primary-500 to-primary-600"
        />
        <StatCard
          title="Unique Visitors"
          value={analyticsData.uniqueVisitors}
          change={analyticsData.visitorsChange}
          icon={Users}
          iconBg="bg-gradient-to-br from-accent-500 to-accent-600"
        />
        <StatCard
          title="Avg. Session"
          value={analyticsData.avgSessionDuration}
          change={analyticsData.sessionChange}
          icon={Clock}
          iconBg="bg-gradient-to-br from-warning-500 to-warning-600"
        />
        <StatCard
          title="Bounce Rate"
          value={analyticsData.bounceRate}
          suffix="%"
          change={analyticsData.bounceChange}
          icon={Activity}
          iconBg="bg-gradient-to-br from-error-500 to-error-600"
        />
        <StatCard
          title="Conversion Rate"
          value={analyticsData.conversionRate}
          suffix="%"
          change={analyticsData.conversionChange}
          icon={Target}
          iconBg="bg-gradient-to-br from-success-500 to-success-600"
        />
        <StatCard
          title="Avg. Order Value"
          value={analyticsData.avgOrderValue.toFixed(2)}
          prefix="$"
          change={analyticsData.aovChange}
          icon={DollarSign}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
          isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue Overview</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${(stats.totalRevenue || 125680).toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-success-400 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                +18.2%
              </span>
            </div>
          </div>
          {/* Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 45, 75, 55, 85, 70, 90, 60, 80, 95, 75, 88].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-400 hover:to-primary-300"
                  style={{ height: `${height}%` }}
                />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
          isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Traffic Sources</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Where your visitors come from</p>
            </div>
            <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
              <PieChart className="h-5 w-5 text-accent-400" />
            </div>
          </div>
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{source.source}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {source.visitors.toLocaleString()}
                    </span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {source.percentage}%
                    </span>
                  </div>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                  <div 
                    className={`h-full rounded-full ${source.color}`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className={`lg:col-span-2 backdrop-blur-sm border rounded-2xl p-6 ${
          isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Performing Products</h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Best sellers this period</p>
            </div>
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
                  <th className={`pb-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Product</th>
                  <th className={`pb-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sales</th>
                  <th className={`pb-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Revenue</th>
                  <th className={`pb-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Growth</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-dark-700/30' : 'divide-gray-100'}`}>
                {topProducts.map((product, index) => (
                  <tr key={index} className={`transition-colors ${isDark ? 'hover:bg-dark-700/30' : 'hover:bg-gray-50'}`}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                          isDark ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          #{index + 1}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</span>
                      </div>
                    </td>
                    <td className={`py-4 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {product.sales}
                    </td>
                    <td className={`py-4 text-right font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${product.revenue.toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        product.growth >= 0 
                          ? 'bg-success-500/20 text-success-400' 
                          : 'bg-error-500/20 text-error-400'
                      }`}>
                        {product.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(product.growth)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device & Recent Activity */}
        <div className="space-y-6">
          {/* Device Stats */}
          <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
            isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Devices</h3>
              <div className="w-8 h-8 bg-warning-500/20 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-warning-400" />
              </div>
            </div>
            <div className="space-y-4">
              {deviceStats.map((device, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-dark-700' : 'bg-gray-100'
                  }`}>
                    <device.icon className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{device.device}</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{device.percentage}%</span>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
            isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
              <div className="w-8 h-8 bg-success-500/20 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-success-400" />
              </div>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'order' ? 'bg-success-500' :
                    activity.type === 'user' ? 'bg-accent-500' :
                    activity.type === 'view' ? 'bg-primary-500' :
                    activity.type === 'review' ? 'bg-warning-500' :
                    'bg-error-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                    <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.detail}</p>
                  </div>
                  <span className={`text-xs whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
        isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance Summary</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Key metrics compared to previous period</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Orders</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalOrders || 1247}</p>
            <p className="text-xs text-success-400 mt-1">+12.5% from last period</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${(stats.totalRevenue || 125680).toLocaleString()}</p>
            <p className="text-xs text-success-400 mt-1">+18.2% from last period</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>New Customers</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.totalCustomers || 342}</p>
            <p className="text-xs text-success-400 mt-1">+8.3% from last period</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Package className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Products Sold</span>
            </div>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2,156</p>
            <p className="text-xs text-success-400 mt-1">+15.7% from last period</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
