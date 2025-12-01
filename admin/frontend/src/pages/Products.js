import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productsAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Package,
  SlidersHorizontal,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import Pagination from '../components/UI/Pagination';
import Modal from '../components/UI/Modal';
import { useTheme } from '../contexts/ThemeContext';

const FALLBACK_IMAGE = '/images/fallback.jpg';

const Products = () => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [showFilters, setShowFilters] = useState(false);
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['products', { 
      page: currentPage, 
      search: searchQuery, 
      category: categoryFilter,
      isActive: statusFilter
    }],
    async () => {
      const response = await productsAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        category: categoryFilter,
        isActive: statusFilter
      });
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  const toggleStatusMutation = useMutation(
    productsAPI.toggleStatus,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product status');
      }
    }
  );

  const deleteMutation = useMutation(
    productsAPI.delete,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product deleted successfully');
        setDeleteModal({ isOpen: false, product: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  );

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination || {};

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleToggleStatus = (productId) => {
    toggleStatusMutation.mutate(productId);
  };

  const handleDelete = (product) => {
    setDeleteModal({ isOpen: true, product });
  };

  const confirmDelete = () => {
    if (deleteModal.product) {
      deleteMutation.mutate(deleteModal.product._id);
    }
  };

  const getStockBadge = (stock, lowStockThreshold) => {
    if (stock === 0) {
      return <Badge variant="error">Out of Stock</Badge>;
    } else if (stock <= lowStockThreshold) {
      return <Badge variant="warning">Low Stock</Badge>;
    } else {
      return <Badge variant="success">In Stock</Badge>;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-error-500/20 rounded-2xl flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-error-400" />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error loading products</h3>
        <p className={`mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{error.message}</p>
        <button 
          onClick={() => queryClient.invalidateQueries('products')}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Products</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <Link to="/products/new" className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`backdrop-blur-sm border rounded-2xl p-4 ${
        isDark 
          ? 'bg-dark-800/50 border-dark-700/50' 
          : 'bg-white/70 border-gray-200/50'
      }`}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search products by name, SKU..."
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                  isDark 
                    ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          
          {/* Filter Toggle Button (Mobile) */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn btn-secondary"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </button>

          {/* Filter Dropdowns */}
          <div className={`flex flex-col sm:flex-row gap-3 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            <select
              className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all cursor-pointer min-w-[160px] ${
                isDark 
                  ? 'bg-dark-700/50 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              <option value="diffuser">Diffuser</option>
              <option value="accessory">Accessory</option>
              <option value="lens-specific">Lens Specific</option>
              <option value="bundle">Bundle</option>
            </select>
            
            <select
              className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all cursor-pointer min-w-[140px] ${
                isDark 
                  ? 'bg-dark-700/50 border-dark-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* Active Filters */}
        {(categoryFilter || statusFilter || searchQuery) && (
          <div className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200/50'}`}>
            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Active filters:</span>
            {searchQuery && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                isDark ? 'bg-dark-600 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Search: "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery('')}
                  className={isDark ? 'ml-1 text-gray-500 hover:text-white' : 'ml-1 text-gray-500 hover:text-gray-900'}
                >
                  ×
                </button>
              </span>
            )}
            {categoryFilter && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                isDark ? 'bg-dark-600 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Category: {categoryFilter}
                <button 
                  onClick={() => setCategoryFilter('')}
                  className={isDark ? 'ml-1 text-gray-500 hover:text-white' : 'ml-1 text-gray-500 hover:text-gray-900'}
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                isDark ? 'bg-dark-600 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                Status: {statusFilter === 'true' ? 'Active' : 'Inactive'}
                <button 
                  onClick={() => setStatusFilter('')}
                  className={isDark ? 'ml-1 text-gray-500 hover:text-white' : 'ml-1 text-gray-500 hover:text-gray-900'}
                >
                  ×
                </button>
              </span>
            )}
            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setStatusFilter('');
              }}
              className="text-sm text-primary-400 hover:text-primary-300 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className={`backdrop-blur-sm border rounded-2xl overflow-hidden ${
        isDark 
          ? 'bg-dark-800/50 border-dark-700/50' 
          : 'bg-white/70 border-gray-200/50'
      }`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              isDark ? 'bg-dark-700' : 'bg-gray-100'
            }`}>
              <Package className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No products found</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Get started by creating your first product.</p>
            <Link to="/products/new" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'bg-dark-700/50' : 'bg-gray-50'}>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Product</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Price</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stock</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-6 py-4 text-right text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-dark-700/50' : 'divide-gray-200/50'}`}>
                  {products.map((product, index) => (
                    <tr 
                      key={product._id} 
                      className={`transition-colors ${isDark ? 'hover:bg-dark-700/30' : 'hover:bg-gray-50'}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              className={`h-12 w-12 rounded-xl object-cover ring-2 ${isDark ? 'ring-dark-600' : 'ring-gray-200'}`}
                              src={product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || FALLBACK_IMAGE}
                              alt={product.name}
                              onError={(e) => {
                                if (!e.target.dataset.fallback) {
                                  e.target.dataset.fallback = 'true';
                                  e.target.src = FALLBACK_IMAGE;
                                }
                              }}
                            />
                            {!product.isActive && (
                              <div className={`absolute inset-0 rounded-xl flex items-center justify-center ${
                                isDark ? 'bg-dark-900/60' : 'bg-gray-900/40'
                              }`}>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-white'}`}>Draft</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm capitalize ${
                          isDark ? 'bg-dark-600/50 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${product.price?.toFixed(2) || '0.00'}</p>
                          {product.compareAtPrice > product.price && (
                            <p className={`text-xs line-through ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>${product.compareAtPrice?.toFixed(2)}</p>
                          )}
                          {product.freeShipping ? (
                            <span className="text-xs text-success-400 font-medium">Free Shipping</span>
                          ) : product.shippingPrice > 0 && (
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>+${product.shippingPrice?.toFixed(2)} shipping</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.stock} units</span>
                          {getStockBadge(product.stock, product.lowStockThreshold)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(product._id)}
                          disabled={toggleStatusMutation.isLoading}
                          className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-dark-600/50' : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className={`relative w-10 h-6 rounded-full transition-colors ${
                            product.isActive 
                              ? 'bg-success-500/30' 
                              : isDark ? 'bg-dark-600' : 'bg-gray-300'
                          }`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                              product.isActive 
                                ? 'left-5 bg-success-500' 
                                : 'left-1 bg-gray-500'
                            }`} />
                          </div>
                          <span className={`text-sm font-medium ${
                            product.isActive ? 'text-success-400' : isDark ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/products/${product._id}`}
                            className={`p-2 rounded-lg transition-all ${
                              isDark 
                                ? 'text-gray-400 hover:text-white hover:bg-dark-600' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/products/${product._id}/edit`}
                            className={`p-2 rounded-lg transition-all ${
                              isDark 
                                ? 'text-gray-400 hover:text-primary-400 hover:bg-primary-500/10' 
                                : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
                            }`}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            className={`p-2 rounded-lg transition-all ${
                              isDark 
                                ? 'text-gray-400 hover:text-error-400 hover:bg-error-500/10' 
                                : 'text-gray-500 hover:text-error-600 hover:bg-error-50'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className={`border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200/50'}`}>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        title="Delete Product"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-error-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-error-400" />
            </div>
            <div>
              <h4 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Delete "{deleteModal.product?.name}"?
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This action cannot be undone. This will permanently delete the product and all associated data.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false, product: null })}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
              className="btn btn-danger"
            >
              {deleteMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Product
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;