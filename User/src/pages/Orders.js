import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const invoiceRef = useRef(null);

  // Calculate status counts
  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  // Filter orders based on active filter
  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

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
      const response = await fetch('http://localhost:5001/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      'pending': 'bg-amber-500',
      'confirmed': 'bg-blue-500',
      'processing': 'bg-purple-500',
      'shipped': 'bg-cyan-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500'
    };
    return classes[status] || 'bg-gray-500';
  };

  const getFilterBtnClass = (filter) => {
    const baseClass = 'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2';
    if (activeFilter === filter) {
      const activeColors = {
        'all': 'bg-zinc-500 text-white',
        'pending': 'bg-amber-500 text-white',
        'confirmed': 'bg-blue-500 text-white',
        'processing': 'bg-purple-500 text-white',
        'shipped': 'bg-cyan-500 text-white',
        'delivered': 'bg-green-500 text-white',
        'cancelled': 'bg-red-500 text-white'
      };
      return `${baseClass} ${activeColors[filter]}`;
    }
    return `${baseClass} bg-zinc-600/50 text-zinc-300 hover:bg-zinc-600`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'all': '📋',
      'pending': '⏳',
      'confirmed': '✅',
      'processing': '⚙️',
      'shipped': '🚚',
      'delivered': '📦',
      'cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleDownloadInvoice = async (order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderNumber || order._id.slice(-8).toUpperCase()}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: white; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f59e0b; }
          .logo { font-size: 28px; font-weight: bold; color: #18181b; }
          .logo span { color: #f59e0b; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { font-size: 32px; color: #18181b; margin-bottom: 5px; }
          .invoice-title p { color: #666; font-size: 14px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .detail-section h3 { color: #f59e0b; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px; }
          .detail-section p { color: #555; line-height: 1.8; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { background: #18181b; color: white; padding: 15px; text-align: left; font-size: 14px; }
          .items-table td { padding: 15px; border-bottom: 1px solid #eee; font-size: 14px; }
          .items-table tr:hover { background: #f9f9f9; }
          .totals { margin-left: auto; width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .totals-row.total { border-bottom: none; border-top: 2px solid #18181b; padding-top: 15px; margin-top: 10px; font-weight: bold; font-size: 18px; }
          .totals-row.total .amount { color: #f59e0b; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px; }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .status-pending { background: #fef3c7; color: #d97706; }
          .status-confirmed { background: #dbeafe; color: #2563eb; }
          .status-processing { background: #ede9fe; color: #7c3aed; }
          .status-shipped { background: #cffafe; color: #0891b2; }
          .status-delivered { background: #dcfce7; color: #16a34a; }
          .status-cancelled { background: #fee2e2; color: #dc2626; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="logo">Beetle<span>Diffuser</span></div>
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <p>#${order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          
          <div class="invoice-details">
            <div class="detail-section">
              <h3>Bill To</h3>
              <p>
                <strong>${order.shippingAddress?.name || 'Customer'}</strong><br>
                ${order.shippingAddress?.formattedAddress || 'Address not available'}<br>
                ${order.shippingAddress?.phone ? 'Phone: ' + order.shippingAddress.phone : ''}
              </p>
            </div>
            <div class="detail-section">
              <h3>Invoice Details</h3>
              <p>
                <strong>Date:</strong> ${formatDate(order.createdAt)}<br>
                <strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span><br>
                <strong>Payment:</strong> ${order.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
              </p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Details</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td><strong>${item.product?.name || 'Product'}</strong></td>
                  <td>
                    ${item.cameraModel ? 'Camera: ' + item.cameraModel + '<br>' : ''}
                    ${item.lensModel ? 'Lens: ' + item.lensModel + '<br>' : ''}
                    ${item.flashModel ? 'Flash: ' + item.flashModel : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price?.toLocaleString('en-IN')}</td>
                  <td><strong>₹${(item.price * item.quantity)?.toLocaleString('en-IN')}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>₹${(order.subtotal || order.totalAmount)?.toLocaleString('en-IN')}</span>
            </div>
            ${order.discount > 0 ? `
              <div class="totals-row" style="color: #16a34a;">
                <span>Discount</span>
                <span>-₹${order.discount?.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>Shipping</span>
              <span>${order.shippingCost > 0 ? '₹' + order.shippingCost?.toLocaleString('en-IN') : 'Free'}</span>
            </div>
            <div class="totals-row total">
              <span>Grand Total</span>
              <span class="amount">₹${order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with BeetleDiffuser!</p>
            <p style="margin-top: 5px;">For any queries, contact us at support@beetlediffuser.com</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const openCancelModal = (order) => {
    setCancellingOrder(order);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setCancellingOrder(null);
    setCancelReason('');
    setShowCancelModal(false);
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/orders/${cancellingOrder._id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel order');
      }

      // Update the order in state
      setOrders(orders.map(o => 
        o._id === cancellingOrder._id 
          ? { ...o, status: 'cancelled', cancelReason: cancelReason }
          : o
      ));
      
      closeCancelModal();
    } catch (error) {
      setError(error.message);
      closeCancelModal();
    }
  };

  const canCancelOrder = (status) => {
    return !['delivered', 'cancelled', 'shipped'].includes(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-800 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">My Orders</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500">
            {error}
          </div>
        )}

        {/* Status Summary Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">⏳</div>
              <div className="text-2xl font-bold text-amber-400">{statusCounts.pending}</div>
              <div className="text-xs text-zinc-400">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-bold text-blue-400">{statusCounts.confirmed}</div>
              <div className="text-xs text-zinc-400">Confirmed</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">⚙️</div>
              <div className="text-2xl font-bold text-purple-400">{statusCounts.processing}</div>
              <div className="text-xs text-zinc-400">Processing</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🚚</div>
              <div className="text-2xl font-bold text-cyan-400">{statusCounts.shipped}</div>
              <div className="text-xs text-zinc-400">Shipped</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-2xl font-bold text-green-400">{statusCounts.delivered}</div>
              <div className="text-xs text-zinc-400">Delivered</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">❌</div>
              <div className="text-2xl font-bold text-red-400">{statusCounts.cancelled}</div>
              <div className="text-xs text-zinc-400">Cancelled</div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        {orders.length > 0 && (
          <div className="bg-zinc-700/50 rounded-xl p-3 mb-6">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveFilter('all')}
                className={getFilterBtnClass('all')}
              >
                {getStatusIcon('all')} All
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{statusCounts.all}</span>
              </button>
              <button 
                onClick={() => setActiveFilter('pending')}
                className={getFilterBtnClass('pending')}
              >
                {getStatusIcon('pending')} Pending
                {statusCounts.pending > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{statusCounts.pending}</span>}
              </button>
              <button 
                onClick={() => setActiveFilter('confirmed')}
                className={getFilterBtnClass('confirmed')}
              >
                {getStatusIcon('confirmed')} Confirmed
                {statusCounts.confirmed > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{statusCounts.confirmed}</span>}
              </button>
              <button 
                onClick={() => setActiveFilter('processing')}
                className={getFilterBtnClass('processing')}
              >
                {getStatusIcon('processing')} Processing
                {statusCounts.processing > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{statusCounts.processing}</span>}
              </button>
              <button 
                onClick={() => setActiveFilter('shipped')}
                className={getFilterBtnClass('shipped')}
              >
                {getStatusIcon('shipped')} Shipped
                {statusCounts.shipped > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{statusCounts.shipped}</span>}
              </button>
              <button 
                onClick={() => setActiveFilter('delivered')}
                className={getFilterBtnClass('delivered')}
              >
                {getStatusIcon('delivered')} Delivered
                {statusCounts.delivered > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{statusCounts.delivered}</span>}
              </button>
              <button 
                onClick={() => setActiveFilter('cancelled')}
                className={getFilterBtnClass('cancelled')}
              >
                {getStatusIcon('cancelled')} Cancelled
                {statusCounts.cancelled > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{statusCounts.cancelled}</span>}
              </button>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-zinc-700 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No orders yet</h2>
            <p className="text-zinc-400 mb-6">You haven't placed any orders yet. Start shopping!</p>
            <Link 
              to="/" 
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-zinc-700 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">{getStatusIcon(activeFilter)}</div>
                <h3 className="text-xl font-semibold text-white mb-2">No {activeFilter} orders</h3>
                <p className="text-zinc-400 mb-4">You don't have any orders with "{activeFilter}" status.</p>
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  View All Orders
                </button>
              </div>
            ) : (
              filteredOrders.map((order) => (
              <div key={order._id} className="bg-zinc-700 rounded-2xl overflow-hidden shadow-xl">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-zinc-600/50 border-b border-zinc-600">
                  <div>
                    <p className="text-white font-semibold">
                      Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-zinc-400 text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusClass(order.status)}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </span>
                </div>

                {/* Order Items */}
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
                        <div className="text-zinc-400 text-sm space-x-2">
                          {item.cameraModel && <span>Camera: {item.cameraModel}</span>}
                          {item.lensModel && <span>• Lens: {item.lensModel}</span>}
                          {item.flashModel && <span>• Flash: {item.flashModel}</span>}
                        </div>
                        <p className="text-zinc-400 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-yellow-400 font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-zinc-600/30 border-t border-zinc-600">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Total:</span>
                    <span className="text-xl font-bold text-yellow-400">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/track-order/${order.orderNumber || order._id}`}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Track
                    </Link>
                    <button 
                      onClick={() => setInvoiceOrder(order)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Invoice
                    </button>
                    <button 
                      onClick={() => handleDownloadInvoice(order)}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button 
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                      className="bg-zinc-600 hover:bg-zinc-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      {selectedOrder === order._id ? 'Hide' : 'Details'}
                    </button>
                    {canCancelOrder(order.status) && (
                      <button 
                        onClick={() => openCancelModal(order)}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder === order._id && (
                  <div className="p-4 bg-zinc-800/50 border-t border-zinc-600 space-y-4">
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-2">Shipping Address</h4>
                      <p className="text-zinc-300 text-sm">
                        {order.shippingAddress?.formattedAddress || 'Address not available'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-yellow-400 font-semibold mb-2">Payment</h4>
                      <p className="text-zinc-300 text-sm">
                        Method: {order.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                      </p>
                      <p className="text-zinc-300 text-sm">
                        Status: {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'N/A'}
                      </p>
                    </div>

                    {order.trackingNumber && (
                      <div>
                        <h4 className="text-yellow-400 font-semibold mb-2">Tracking</h4>
                        <p className="text-zinc-300 text-sm">Tracking Number: {order.trackingNumber}</p>
                      </div>
                    )}

                    <div className="bg-zinc-700 rounded-lg p-4">
                      <h4 className="text-yellow-400 font-semibold mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-zinc-300">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Discount</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-zinc-300">
                          <span>Shipping</span>
                          <span>{order.shippingCost > 0 ? formatPrice(order.shippingCost) : 'Free'}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-600">
                          <span>Total</span>
                          <span className="text-yellow-400">{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" ref={invoiceRef}>
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Beetle<span className="text-yellow-400">Diffuser</span>
                  </h2>
                  <p className="text-zinc-400 text-sm mt-1">Premium Camera Accessories</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-white">INVOICE</h3>
                  <p className="text-yellow-400 font-mono">#{invoiceOrder.orderNumber || invoiceOrder._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-6 space-y-6">
              {/* Bill To & Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Bill To</h4>
                  <p className="text-zinc-800 font-semibold">{invoiceOrder.shippingAddress?.name || 'Customer'}</p>
                  <p className="text-zinc-600 text-sm mt-1">{invoiceOrder.shippingAddress?.formattedAddress || 'Address not available'}</p>
                  {invoiceOrder.shippingAddress?.phone && (
                    <p className="text-zinc-600 text-sm">Phone: {invoiceOrder.shippingAddress.phone}</p>
                  )}
                </div>
                <div className="md:text-right">
                  <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Invoice Details</h4>
                  <p className="text-zinc-700 text-sm"><span className="font-medium">Date:</span> {formatDate(invoiceOrder.createdAt)}</p>
                  <p className="text-zinc-700 text-sm mt-1">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusClass(invoiceOrder.status)}`}>
                      {invoiceOrder.status?.charAt(0).toUpperCase() + invoiceOrder.status?.slice(1)}
                    </span>
                  </p>
                  <p className="text-zinc-700 text-sm mt-1">
                    <span className="font-medium">Payment:</span> {invoiceOrder.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="text-left p-3 text-xs font-bold text-zinc-600 uppercase">Item</th>
                      <th className="text-left p-3 text-xs font-bold text-zinc-600 uppercase hidden sm:table-cell">Details</th>
                      <th className="text-center p-3 text-xs font-bold text-zinc-600 uppercase">Qty</th>
                      <th className="text-right p-3 text-xs font-bold text-zinc-600 uppercase">Price</th>
                      <th className="text-right p-3 text-xs font-bold text-zinc-600 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceOrder.items?.map((item, index) => (
                      <tr key={index} className="border-t border-zinc-100">
                        <td className="p-3">
                          <p className="font-medium text-zinc-800">{item.product?.name || 'Product'}</p>
                          <div className="sm:hidden text-xs text-zinc-500 mt-1">
                            {item.cameraModel && <span>Camera: {item.cameraModel}</span>}
                            {item.lensModel && <span className="block">Lens: {item.lensModel}</span>}
                            {item.flashModel && <span className="block">Flash: {item.flashModel}</span>}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-zinc-600 hidden sm:table-cell">
                          {item.cameraModel && <span className="block">Camera: {item.cameraModel}</span>}
                          {item.lensModel && <span className="block">Lens: {item.lensModel}</span>}
                          {item.flashModel && <span className="block">Flash: {item.flashModel}</span>}
                        </td>
                        <td className="p-3 text-center text-zinc-800">{item.quantity}</td>
                        <td className="p-3 text-right text-zinc-800">{formatPrice(item.price)}</td>
                        <td className="p-3 text-right font-semibold text-zinc-800">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-zinc-600 text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(invoiceOrder.subtotal || invoiceOrder.totalAmount)}</span>
                  </div>
                  {invoiceOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Discount</span>
                      <span>-{formatPrice(invoiceOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600 text-sm">
                    <span>Shipping</span>
                    <span>{invoiceOrder.shippingCost > 0 ? formatPrice(invoiceOrder.shippingCost) : 'Free'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-zinc-200">
                    <span className="text-zinc-800">Grand Total</span>
                    <span className="text-yellow-600">{formatPrice(invoiceOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-4 border-t border-zinc-200">
                <p className="text-zinc-500 text-sm">Thank you for shopping with BeetleDiffuser!</p>
                <p className="text-zinc-400 text-xs mt-1">For queries, contact support@beetlediffuser.com</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-zinc-50 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setInvoiceOrder(null)}
                className="px-6 py-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadInvoice(invoiceOrder)}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && cancellingOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-red-500/10 border-b border-red-500/20 p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Cancel Order</h3>
                  <p className="text-zinc-400 text-sm">#{cancellingOrder.orderNumber || cancellingOrder._id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <p className="text-zinc-300">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              
              <div className="bg-zinc-700/50 rounded-lg p-3">
                <p className="text-sm text-zinc-400 mb-1">Order Total</p>
                <p className="text-xl font-bold text-yellow-400">{formatPrice(cancellingOrder.totalAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Reason for cancellation (optional)
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
                >
                  <option value="">Select a reason...</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Found a better price">Found a better price</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Delivery time too long">Delivery time too long</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {cancelReason === 'Other' && (
                <textarea
                  placeholder="Please specify your reason..."
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors resize-none"
                  rows={3}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-900/50 px-5 py-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={closeCancelModal}
                className="flex-1 px-6 py-3 bg-zinc-600 hover:bg-zinc-500 text-white font-medium rounded-lg transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Orders;
