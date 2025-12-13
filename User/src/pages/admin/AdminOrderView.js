import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useToast } from '../../components/Toast';

const AdminOrderView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/orders/${id}`);
      setOrder(response.data.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load order');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      showSuccess('Order status updated successfully');
      fetchOrder();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/admin/orders/${id}/payment-status`, { paymentStatus: newStatus });
      showSuccess('Payment status updated successfully');
      fetchOrder();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackingUpdate = async (e) => {
    e.preventDefault();
    const trackingNumber = e.target.trackingNumber.value;
    try {
      setUpdating(true);
      await api.patch(`/admin/orders/${id}/tracking`, { trackingNumber });
      showSuccess('Tracking number updated successfully');
      fetchOrder();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update tracking');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      shipped: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentOptions = ['pending', 'paid', 'failed', 'refunded'];

  const formatCurrency = (amount, currency = 'INR') => {
    const currencySymbol = currency === 'USD' ? '$' : '₹';
    const locale = currency === 'USD' ? 'en-US' : 'en-IN';
    return `${currencySymbol}${amount?.toLocaleString(locale) || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const customer = order.user || order.guestInfo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="mt-1 text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="font-semibold capitalize">{order.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Order Items ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || item.product?.icon || item.icon || '/images/fallback.jpg'}
                      alt={item.name || item.product?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/images/fallback.jpg'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{item.name || item.product?.name}</h3>
                    {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                    {item.cameraModel && <p className="text-sm text-gray-500">Camera: {item.cameraModel}</p>}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity, order.currency)}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price, order.currency)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping, order.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatCurrency(order.tax, order.currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </div>

          {/* Update Status Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Order</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status} className="capitalize">{status}</option>
                  ))}
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
                  disabled={updating}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {paymentOptions.map(status => (
                    <option key={status} value={status} className="capitalize">{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tracking Number */}
            <form onSubmit={handleTrackingUpdate} className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="trackingNumber"
                  defaultValue={order.trackingNumber || ''}
                  placeholder="Enter tracking number"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Customer
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {(customer?.name || customer?.firstName || 'G').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {customer?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Guest'}
                  </p>
                  <p className="text-sm text-gray-500">{order.user ? 'Registered' : 'Guest'}</p>
                </div>
              </div>
              
              {(customer?.email || customer?.phone) && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {customer?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {customer.email}
                    </div>
                  )}
                  {customer?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" />
              Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                {order.shippingAddress.formattedAddress ? (
                  <p>{order.shippingAddress.formattedAddress}</p>
                ) : (
                  <>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </>
                )}
                {order.shippingAddress.phone && (
                  <div className="flex items-center gap-2 pt-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {order.shippingAddress.phone}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No shipping address provided</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              Payment
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-medium text-gray-900 capitalize">{order.paymentMethod || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">
                  {new Date(order.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="text-gray-900">
                  {new Date(order.updatedAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderView;
