import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Ticket,
  Calendar,
  Percent,
  IndianRupee,
  TrendingUp,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const couponsAPI = {
  getAll: () => axios.get(`${API_URL}/admin/coupons`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  }),
  create: (data) => axios.post(`${API_URL}/admin/coupons`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  }),
  update: (id, data) => axios.put(`${API_URL}/admin/coupons/${id}`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  }),
  delete: (id) => axios.delete(`${API_URL}/admin/coupons/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  }),
  toggleStatus: (id) => axios.patch(`${API_URL}/admin/coupons/${id}/toggle`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  })
};

const Coupons = () => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [formModal, setFormModal] = useState({ isOpen: false, coupon: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, coupon: null });
  
  const queryClient = useQueryClient();

  const { data: coupons, isLoading } = useQuery('coupons', async () => {
    const response = await couponsAPI.getAll();
    return response.data;
  });

  const createMutation = useMutation(couponsAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('coupons');
      toast.success('Coupon created successfully');
      setFormModal({ isOpen: false, coupon: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  });

  const updateMutation = useMutation(
    ({ id, data }) => couponsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('coupons');
        toast.success('Coupon updated successfully');
        setFormModal({ isOpen: false, coupon: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update coupon');
      }
    }
  );

  const deleteMutation = useMutation(couponsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('coupons');
      toast.success('Coupon deleted successfully');
      setDeleteModal({ isOpen: false, coupon: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  });

  const toggleStatusMutation = useMutation(couponsAPI.toggleStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('coupons');
      toast.success('Coupon status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update coupon status');
    }
  });

  const filteredCoupons = coupons?.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const isExpired = (date) => new Date(date) < new Date();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Coupons
          </h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage discount coupons for your store
          </p>
        </div>
        <button
          onClick={() => setFormModal({ isOpen: true, coupon: null })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      {/* Search Bar */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map((coupon) => (
          <div
            key={coupon._id}
            className={`p-6 rounded-lg shadow-lg ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } ${!coupon.isActive ? 'opacity-60' : ''}`}
          >
            {/* Coupon Code Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="text-blue-500" size={24} />
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {coupon.code}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(coupon._id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    coupon.isActive
                      ? 'text-green-500 hover:bg-green-500/10'
                      : 'text-gray-500 hover:bg-gray-500/10'
                  }`}
                  title={coupon.isActive ? 'Deactivate' : 'Activate'}
                >
                  {coupon.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>

            {/* Discount Info */}
            <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                {coupon.discountType === 'percentage' ? (
                  <>
                    <Percent className="text-green-500" size={20} />
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {coupon.discountValue}% OFF
                    </span>
                  </>
                ) : (
                  <>
                    <IndianRupee className="text-green-500" size={20} />
                    <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ₹{coupon.discountValue} OFF
                    </span>
                  </>
                )}
              </div>
              {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Max discount: ₹{coupon.maxDiscount}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              {coupon.minOrderValue > 0 && (
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Min order: ₹{coupon.minOrderValue}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Expires: {formatDate(coupon.expiryDate)}
                </span>
              </div>
              {isExpired(coupon.expiryDate) && (
                <Badge variant="danger" size="sm">Expired</Badge>
              )}
              <div className="flex items-center gap-2">
                <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Used: {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                </span>
              </div>
            </div>

            {coupon.description && (
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {coupon.description}
              </p>
            )}

            {/* Status Badge */}
            <div className="mb-4">
              <Badge variant={coupon.isActive ? 'success' : 'secondary'}>
                {coupon.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setFormModal({ isOpen: true, coupon })}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => setDeleteModal({ isOpen: true, coupon })}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCoupons.length === 0 && (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <Ticket size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No coupons found</p>
        </div>
      )}

      {/* Form Modal */}
      <CouponFormModal
        isOpen={formModal.isOpen}
        coupon={formModal.coupon}
        onClose={() => setFormModal({ isOpen: false, coupon: null })}
        onSubmit={(data) => {
          if (formModal.coupon) {
            updateMutation.mutate({ id: formModal.coupon._id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isDark={isDark}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, coupon: null })}
        title="Delete Coupon"
      >
        <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
          Are you sure you want to delete coupon <strong>{deleteModal.coupon?.code}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setDeleteModal({ isOpen: false, coupon: null })}
            className={`flex-1 px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => deleteMutation.mutate(deleteModal.coupon._id)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );

  function handleToggleStatus(id) {
    toggleStatusMutation.mutate(id);
  }
};

// Coupon Form Modal Component
const CouponFormModal = ({ isOpen, coupon, onClose, onSubmit, isDark }) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: '',
    description: ''
  });

  React.useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue || '',
        maxDiscount: coupon.maxDiscount || '',
        usageLimit: coupon.usageLimit || '',
        expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
        description: coupon.description || ''
      });
    } else {
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        expiryDate: '',
        description: ''
      });
    }
  }, [coupon]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
    };
    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? 'Edit Coupon' : 'Create New Coupon'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Coupon Code *
          </label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            placeholder="e.g., SAVE20"
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Discount Type *
          </label>
          <select
            required
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
          </label>
          <input
            type="number"
            required
            min="0"
            max={formData.discountType === 'percentage' ? '100' : undefined}
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            placeholder={formData.discountType === 'percentage' ? '10' : '100'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Min Order Value (₹)
            </label>
            <input
              type="number"
              min="0"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="0"
            />
          </div>

          {formData.discountType === 'percentage' && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Max Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder="Unlimited"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Usage Limit
            </label>
            <input
              type="number"
              min="0"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              placeholder="Unlimited"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Expiry Date *
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
            }`}
            placeholder="Optional description for this coupon"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {coupon ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Coupons;
