import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../services/api';
import { 
  ArrowLeft, 
  Edit, 
  Package,
  Tag,
  DollarSign,
  Layers,
  CheckCircle,
  XCircle,
  Star,
  Box,
  Calendar,
  User,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';

const FALLBACK_IMAGE = '/images/fallback.jpg';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    ['product', id],
    async () => {
      const response = await productsAPI.getById(id);
      return response.data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-error-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Error loading product</h3>
          <p className="text-gray-400 mb-6">{error.message}</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const product = data?.data || data;

  if (!product) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-warning-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Product not found</h3>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const getStockBadge = (stock, threshold) => {
    if (stock === 0) {
      return <Badge variant="error" dot>Out of Stock</Badge>;
    } else if (stock <= threshold) {
      return <Badge variant="warning" dot>Low Stock ({stock})</Badge>;
    } else {
      return <Badge variant="success" dot>In Stock ({stock})</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2.5 hover:bg-dark-700/50 rounded-xl transition-colors border border-dark-700/50"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{product.name}</h1>
              {product.isActive ? (
                <Badge variant="success" dot>Active</Badge>
              ) : (
                <Badge variant="error" dot>Inactive</Badge>
              )}
            </div>
            <p className="text-gray-400 mt-1">{product.subtitle}</p>
          </div>
        </div>
        <Link 
          to={`/products/${id}/edit`} 
          className="btn btn-primary inline-flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image */}
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-dark-700/50 to-dark-800/50 rounded-xl overflow-hidden relative group">
              <img
                src={product.images?.[0]?.url || FALLBACK_IMAGE}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = 'true';
                    e.target.src = FALLBACK_IMAGE;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <button className="px-4 py-2 bg-dark-800/80 backdrop-blur-sm rounded-lg text-white text-sm flex items-center gap-2 border border-dark-600">
                  <Maximize2 className="h-4 w-4" />
                  View Full Size
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Description</h2>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{product.description}</p>
          </div>

          {/* Features */}
          {product.features?.length > 0 && (
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Features</h2>
              </div>
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-300 bg-dark-700/30 p-3 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-success-400 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {product.specifications?.length > 0 && (
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5 text-accent-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Specifications</h2>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specifications.map((spec, index) => (
                  <li key={index} className="flex items-start text-gray-300 bg-dark-700/30 p-3 rounded-xl">
                    <span className="w-2 h-2 bg-primary-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Compatibility */}
          {product.compatibility?.length > 0 && (
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-info-500/20 rounded-xl flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-info-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Compatibility</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.compatibility.map((item, index) => (
                  <Badge key={index} variant="info">{item}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Pricing</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">Current Price</span>
                <span className="text-3xl font-bold text-white">${product.price?.toFixed(2)}</span>
              </div>
              {product.comparePrice && (
                <div className="flex justify-between items-center pt-3 border-t border-dark-700/50">
                  <span className="text-gray-400">Compare at</span>
                  <div className="text-right">
                    <span className="text-lg text-gray-500 line-through">${product.comparePrice?.toFixed(2)}</span>
                    <span className="ml-2 text-sm text-success-400">
                      {Math.round((1 - product.price / product.comparePrice) * 100)}% off
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
                <Box className="h-5 w-5 text-warning-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Inventory</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400">SKU</span>
                <span className="text-white font-mono text-sm bg-dark-600 px-2 py-1 rounded">{product.sku}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400">Stock Status</span>
                {getStockBadge(product.stock, product.lowStockThreshold)}
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400">Low Stock Alert</span>
                <span className="text-white">{product.lowStockThreshold} units</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                <Layers className="h-5 w-5 text-accent-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400">Visibility</span>
                {product.isActive ? (
                  <Badge variant="success" dot>Active</Badge>
                ) : (
                  <Badge variant="error" dot>Inactive</Badge>
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400">Featured</span>
                {product.isFeatured ? (
                  <Badge variant="warning">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                ) : (
                  <span className="text-gray-500">Not Featured</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400">Category</span>
                <Badge variant="default" className="capitalize">{product.category}</Badge>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1.5 bg-dark-700/50 border border-dark-600 rounded-xl text-gray-300 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Available Sizes</h2>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-dark-700/50 border border-dark-600 hover:border-primary-500/50 rounded-xl text-gray-300 text-sm transition-colors cursor-default"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Information</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created
                </span>
                <span className="text-gray-300 text-sm">
                  {new Date(product.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated
                </span>
                <span className="text-gray-300 text-sm">
                  {new Date(product.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {product.createdBy && (
                <div className="flex justify-between items-center p-3 bg-dark-700/30 rounded-xl">
                  <span className="text-gray-400 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Created By
                  </span>
                  <span className="text-gray-300 text-sm">
                    {product.createdBy.name || 'Admin'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
