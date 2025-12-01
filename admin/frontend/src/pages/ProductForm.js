import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productsAPI, uploadAPI } from '../services/api';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  X, 
  Plus,
  Package,
  DollarSign,
  Tag,
  Layers,
  Settings,
  Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

const FALLBACK_IMAGE = '/images/fallback.jpg';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: '',
    comparePrice: '',
    shippingPrice: '',
    freeShipping: false,
    sku: '',
    category: 'diffuser',
    stock: '',
    lowStockThreshold: '10',
    features: [''],
    specifications: [''],
    compatibility: [''],
    sizes: [''],
    tags: [''],
    isActive: true,
    isFeatured: false,
    images: []
  });

  // Separate state for image URL to handle input properly
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB max for Cloudinary)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadAPI.single(file);
      // Cloudinary returns the full URL directly
      const uploadedUrl = response.data.url;
      
      // Update the image URL state and formData
      setImageUrl(uploadedUrl);
      setFormData(prev => ({
        ...prev,
        images: [{ url: uploadedUrl, alt: prev.name || 'Product', isPrimary: true }]
      }));
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Fetch product data if editing
  const { data: productData, isLoading: isLoadingProduct, isSuccess } = useQuery(
    ['product', id],
    async () => {
      const response = await productsAPI.getById(id);
      return response.data;
    },
    {
      enabled: isEditing,
      staleTime: 0, // Always fetch fresh data when editing
      cacheTime: 0, // Don't cache edit data
    }
  );

  // Populate form when product data is loaded
  useEffect(() => {
    if (isSuccess && productData) {
      const product = productData.data || productData;
      setFormData({
        name: product.name || '',
        subtitle: product.subtitle || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        comparePrice: product.comparePrice?.toString() || '',
        shippingPrice: product.shippingPrice?.toString() || '',
        freeShipping: product.freeShipping ?? false,
        sku: product.sku || '',
        category: product.category || 'diffuser',
        stock: product.stock?.toString() || '',
        lowStockThreshold: product.lowStockThreshold?.toString() || '10',
        features: product.features?.length ? product.features : [''],
        specifications: product.specifications?.length ? product.specifications : [''],
        compatibility: product.compatibility?.length ? product.compatibility : [''],
        sizes: product.sizes?.length ? product.sizes : [''],
        tags: product.tags?.length ? product.tags : [''],
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        images: product.images || []
      });
      // Set the image URL from the first image
      setImageUrl(product.images?.[0]?.url || '');
    }
  }, [isSuccess, productData]);

  // Create mutation
  const createMutation = useMutation(
    (data) => productsAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product created successfully!');
        navigate('/products');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create product');
      }
    }
  );

  // Update mutation
  const updateMutation = useMutation(
    (data) => productsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries(['product', id]);
        toast.success('Product updated successfully!');
        navigate('/products');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up empty array items
    const cleanedData = {
      ...formData,
      price: parseFloat(formData.price),
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
      shippingPrice: formData.shippingPrice ? parseFloat(formData.shippingPrice) : 0,
      freeShipping: formData.freeShipping,
      stock: parseInt(formData.stock),
      lowStockThreshold: parseInt(formData.lowStockThreshold),
      features: formData.features.filter(f => f.trim()),
      specifications: formData.specifications.filter(s => s.trim()),
      compatibility: formData.compatibility.filter(c => c.trim()),
      sizes: formData.sizes.filter(s => s.trim()),
      tags: formData.tags.filter(t => t.trim()),
      images: formData.images.length ? formData.images : [{ url: FALLBACK_IMAGE, alt: formData.name, isPrimary: true }]
    };

    if (isEditing) {
      updateMutation.mutate(cleanedData);
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  // Card styles
  const cardClass = `backdrop-blur-sm border rounded-2xl p-6 ${
    isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200 shadow-sm'
  }`;

  // Input styles
  const inputClass = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
    isDark 
      ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  // Select styles
  const selectClass = `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all cursor-pointer ${
    isDark 
      ? 'bg-dark-700 border-dark-600 text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  // Label styles
  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  // Button styles
  const addButtonClass = `mt-4 flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all ${
    isDark 
      ? 'bg-dark-700/50 hover:bg-dark-600 border-dark-600 text-gray-300 hover:text-white'
      : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-600 hover:text-gray-900'
  }`;

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className={`p-2.5 border rounded-xl transition-colors ${
              isDark 
                ? 'bg-dark-800 hover:bg-dark-700 border-dark-700 text-gray-400 hover:text-white'
                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isEditing ? 'Update product information' : 'Create a new product for your catalog'}
            </p>
          </div>
        </div>
        <button
          type="submit"
          form="product-form"
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Product' : 'Create Product'}
            </>
          )}
        </button>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Basic Information</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Product name and description</p>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Subtitle *</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Brief product subtitle"
                    required
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputClass} min-h-[140px] resize-y`}
                    placeholder="Detailed product description"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory Card */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pricing & Inventory</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Set prices and stock levels</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={inputClass}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Compare Price ($)</label>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleChange}
                    className={inputClass}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Shipping Price ($)</label>
                  <input
                    type="number"
                    name="shippingPrice"
                    value={formData.shippingPrice}
                    onChange={handleChange}
                    className={inputClass}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled={formData.freeShipping}
                  />
                </div>
                
                <div className="flex items-center gap-3 col-span-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="freeShipping"
                      checked={formData.freeShipping}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all ${isDark ? 'bg-dark-600 peer-checked:bg-success-500 after:bg-white' : 'bg-gray-300 peer-checked:bg-success-500 after:bg-white'}`}></div>
                  </label>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Free Shipping</span>
                  {formData.freeShipping && (
                    <span className="text-xs px-2 py-1 bg-success-500/20 text-success-400 rounded-full">Enabled</span>
                  )}
                </div>
                
                <div>
                  <label className={labelClass}>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={selectClass}
                    required
                  >
                    <option value="diffuser">Diffuser</option>
                    <option value="accessory">Accessory</option>
                    <option value="lens-specific">Lens Specific</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>
                
                <div>
                  <label className={labelClass}>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className={inputClass}
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className={labelClass}>Low Stock Threshold</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={formData.lowStockThreshold}
                    onChange={handleChange}
                    className={inputClass}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5 text-accent-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Features</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Highlight key product features</p>
                </div>
              </div>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange('features', index, e.target.value)}
                      className={`flex-1 ${inputClass}`}
                      placeholder="Enter feature"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="p-3 text-error-400 hover:bg-error-500/10 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('features')}
                className={addButtonClass}
              >
                <Plus className="h-4 w-4" /> Add Feature
              </button>
            </div>

            {/* Specifications */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5 text-warning-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Specifications</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Technical details and specs</p>
                </div>
              </div>
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={spec}
                      onChange={(e) => handleArrayChange('specifications', index, e.target.value)}
                      className={`flex-1 ${inputClass}`}
                      placeholder="Enter specification"
                    />
                    {formData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('specifications', index)}
                        className="p-3 text-error-400 hover:bg-error-500/10 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('specifications')}
                className={addButtonClass}
              >
                <Plus className="h-4 w-4" /> Add Specification
              </button>
            </div>

            {/* Compatibility */}
            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Compatibility</h2>
              <div className="space-y-3">
                {formData.compatibility.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('compatibility', index, e.target.value)}
                      className={`flex-1 ${inputClass}`}
                      placeholder="Enter compatible device/lens"
                    />
                    {formData.compatibility.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('compatibility', index)}
                        className="p-3 text-error-400 hover:bg-error-500/10 rounded-xl transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('compatibility')}
                className={addButtonClass}
              >
                <Plus className="h-4 w-4" /> Add Compatibility
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Image Preview */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Image className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Product Image</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Main product photo</p>
                </div>
              </div>
              
              {/* Image Preview */}
              <div className={`relative aspect-square rounded-xl overflow-hidden mb-4 border-2 border-dashed ${
                isDark ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-300'
              }`}>
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center">
                      <LoadingSpinner size="lg" />
                      <p className="text-white text-sm mt-2">Uploading...</p>
                    </div>
                  </div>
                ) : null}
                <img
                  src={imageUrl || FALLBACK_IMAGE}
                  alt={formData.name || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = 'true';
                      e.target.src = FALLBACK_IMAGE;
                    }
                  }}
                />
              </div>

              {/* Upload Button */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl transition-all ${
                    isDark 
                      ? 'bg-dark-700/30 hover:bg-dark-700/50 border-dark-600 hover:border-primary-500 text-gray-300 hover:text-white'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-300 hover:border-primary-500 text-gray-600 hover:text-gray-900'
                  } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Upload className="h-5 w-5" />
                  <span className="font-medium">{isUploading ? 'Uploading...' : 'Choose from Gallery'}</span>
                </button>

                <div className={`flex items-center gap-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <div className="flex-1 h-px bg-current opacity-30"></div>
                  <span className="text-xs">OR</span>
                  <div className="flex-1 h-px bg-current opacity-30"></div>
                </div>

                {/* URL Input */}
                <div>
                  <label className={labelClass}>Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      setImageUrl(url);
                      setFormData(prev => ({
                        ...prev,
                        images: url ? [{ url, alt: prev.name || 'Product', isPrimary: true }] : []
                      }));
                    }}
                    className={`${inputClass} text-sm`}
                    placeholder="Or paste image URL here"
                  />
                </div>

                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Supported formats: JPEG, PNG, GIF, WebP (Max 10MB)
                </p>
              </div>
            </div>

            {/* Status */}
            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Status</h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                  isDark ? 'bg-dark-700/30 hover:bg-dark-700/50' : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className={`w-5 h-5 rounded text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0 ${
                      isDark ? 'border-dark-500 bg-dark-700' : 'border-gray-300 bg-white'
                    }`}
                  />
                  <div className="ml-3">
                    <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Active</span>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Visible to customers</p>
                  </div>
                </label>
                
                <label className={`flex items-center p-3 rounded-xl cursor-pointer transition-colors ${
                  isDark ? 'bg-dark-700/30 hover:bg-dark-700/50' : 'bg-gray-50 hover:bg-gray-100'
                }`}>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className={`w-5 h-5 rounded text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0 ${
                      isDark ? 'border-dark-500 bg-dark-700' : 'border-gray-300 bg-white'
                    }`}
                  />
                  <div className="ml-3">
                    <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Featured</span>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Show on homepage</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                  <Tag className="h-5 w-5 text-accent-400" />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Tags</h2>
              </div>
              <div className="space-y-3">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      className={`flex-1 ${inputClass} text-sm`}
                      placeholder="Enter tag"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="p-2.5 text-error-400 hover:bg-error-500/10 rounded-xl transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('tags')}
                className={`${addButtonClass} w-full justify-center text-sm`}
              >
                <Plus className="h-4 w-4" /> Add Tag
              </button>
            </div>

            {/* Sizes */}
            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sizes</h2>
              <div className="space-y-3">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => handleArrayChange('sizes', index, e.target.value)}
                      className={`flex-1 ${inputClass} text-sm`}
                      placeholder="Enter size"
                    />
                    {formData.sizes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('sizes', index)}
                        className="p-2.5 text-error-400 hover:bg-error-500/10 rounded-xl transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('sizes')}
                className={`${addButtonClass} w-full justify-center text-sm`}
              >
                <Plus className="h-4 w-4" /> Add Size
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button (Mobile) */}
        <div className={`lg:hidden flex justify-end gap-4 pt-4 border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update' : 'Create'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
