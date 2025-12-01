import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ordersAPI } from '../services/api';
import { 
  Search, 
  Filter, 
  Eye, 
  ShoppingCart,
  Calendar,
  X,
  Package,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import Pagination from '../components/UI/Pagination';
import { useTheme } from '../contexts/ThemeContext';

const Orders = () => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  
  const { data, isLoading, error } = useQuery(
    ['orders', { 
      page: currentPage, 
      search: searchQuery, 
      status: statusFilter,
      paymentStatus: paymentFilter
    }],
    () => ordersAPI.getAll({
      page: currentPage,
      limit: 10,
      search: searchQuery,
      status: statusFilter,
      paymentStatus: paymentFilter
    }),
    {
      keepPreviousData: true,
    }
  );

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter || paymentFilter;

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'info',
      shipped: 'info',
      delivered: 'success',
      cancelled: 'error',
      refunded: 'error'
    };
    return <Badge variant={variants[status] || 'default'} dot>{status}</Badge>;
  };

  const getPaymentBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'success',
      failed: 'error',
      refunded: 'error'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const paymentOptions = [
    { value: '', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`text-center backdrop-blur-sm border rounded-2xl p-8 max-w-md ${
          isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-error-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error loading orders</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Orders</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage customer orders and track fulfillment</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 backdrop-blur-sm border rounded-xl ${
            isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
          }`}>
            <Package className="h-4 w-4 text-primary-400" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{pagination.total || 0} total</span>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value === statusFilter ? '' : opt.value); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === opt.value
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : isDark 
                  ? 'bg-dark-800/50 text-gray-400 border border-dark-700/50 hover:bg-dark-700/50 hover:text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search & Advanced Filters */}
      <div className={`backdrop-blur-sm border rounded-2xl p-4 ${
        isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
      }`}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by order number, customer name or email..."
                className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                  isDark 
                    ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer ${
              isDark 
                ? 'bg-dark-700/50 border-dark-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {paymentOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          <button type="submit" className="btn btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </form>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-sm">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-primary-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-500/20 text-accent-400 rounded-lg text-sm capitalize">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('')} className="hover:text-accent-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {paymentFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-500/20 text-success-400 rounded-lg text-sm capitalize">
                Payment: {paymentFilter}
                <button onClick={() => setPaymentFilter('')} className="hover:text-success-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className={`backdrop-blur-sm border rounded-2xl overflow-hidden ${
        isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
      }`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-dark-700/50' : 'bg-gray-100'
              }`}>
                <ShoppingCart className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No orders found</h3>
              <p className={`text-sm max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {hasActiveFilters 
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Orders will appear here when customers make purchases.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-secondary mt-4">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customer</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Items</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Payment</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-dark-700/30' : 'divide-gray-100'}`}>
                  {orders.map((order) => (
                    <tr key={order._id} className={`transition-colors ${isDark ? 'hover:bg-dark-700/30' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-primary-400" />
                          </div>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            #{order.orderNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {order.customer?.name || order.guestCustomer?.name || 'N/A'}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {order.customer?.email || order.guestCustomer?.email || '-'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Calendar className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <span className={`px-2 py-1 rounded-lg ${isDark ? 'bg-dark-700/50' : 'bg-gray-100'}`}>
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <DollarSign className="h-4 w-4 text-success-400" />
                          {order.totalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentBadge(order.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/orders/${order._id}`}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                            isDark 
                              ? 'bg-dark-700/50 hover:bg-primary-500/20 text-gray-300 hover:text-primary-400'
                              : 'bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600'
                          }`}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className={`border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
              <Pagination
                currentPage={pagination.page || 1}
                totalPages={pagination.pages || 1}
                onPageChange={setCurrentPage}
                totalItems={pagination.total || 0}
                itemsPerPage={pagination.limit || 10}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;