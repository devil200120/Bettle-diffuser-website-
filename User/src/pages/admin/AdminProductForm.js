import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Save,
  ArrowLeft,
  X,
  Plus,
  Package,
  DollarSign,
  Layers,
  Settings,
  Image,
  Globe
} from 'lucide-react';
import { useToast } from '../../components/Toast';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    price: '',
    internationalPriceQty1: '',
    internationalPriceQty2: '',
    internationalPriceQty3: '',
    internationalPriceQty4: '',
    internationalPriceQty5: '',
    sku: '',
    stock: '',
    icon: '',
    features: [''],
    specifications: [''],
    compatibility: [''],
    sizes: [''],
    variant: [''],
    variantPricing: {}, // Store variant-specific pricing
    isActive: true,
    rating: 5
  });

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/admin/products/${id}`);
      const product = response.data.data;
      
      // Convert variantPricing Map to object for form
      let variantPricingObj = {};
      if (product.variantPricing) {
        // Handle both Map and plain object formats
        if (product.variantPricing instanceof Map || typeof product.variantPricing.entries === 'function') {
          for (const [key, value] of product.variantPricing.entries()) {
            variantPricingObj[key] = value;
          }
        } else if (typeof product.variantPricing === 'object') {
          variantPricingObj = { ...product.variantPricing };
        }
      }
      
      setFormData({
        name: product.name || '',
        subtitle: product.subtitle || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        internationalPriceQty1: product.internationalPrice?.qty1?.toString() || product.internationalPrice?.single?.toString() || '',
        internationalPriceQty2: product.internationalPrice?.qty2?.toString() || product.internationalPrice?.double?.toString() || '',
        internationalPriceQty3: product.internationalPrice?.qty3?.toString() || '',
        internationalPriceQty4: product.internationalPrice?.qty4?.toString() || '',
        internationalPriceQty5: product.internationalPrice?.qty5?.toString() || '',
        sku: product.sku || '',
        stock: product.stock?.toString() || '',
        icon: product.icon || '',
        features: product.features?.length ? product.features : [''],
        specifications: product.specifications?.length ? product.specifications : [''],
        compatibility: product.compatibility?.length ? product.compatibility : [''],
        sizes: product.sizes?.length ? product.sizes : [''],
        variant: product.variant?.length ? product.variant : [''],
        variantPricing: variantPricingObj,
        isActive: product.isActive ?? true,
        rating: product.rating || 5
      });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load product');
      navigate('/admin/products');
    } finally {
      setFetching(false);
    }
  };

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

  // Handle variant pricing changes
  const handleVariantPriceChange = (variantName, field, value) => {
    setFormData(prev => {
      const newVariantPricing = { ...prev.variantPricing };
      if (!newVariantPricing[variantName]) {
        newVariantPricing[variantName] = {
          price: 0,
          internationalPrice: { qty1: 0, qty2: 0, qty3: 0, qty4: 0, qty5: 0, single: 0, double: 0 }
        };
      }
      
      if (field === 'price') {
        newVariantPricing[variantName].price = parseFloat(value) || 0;
      } else if (field.startsWith('intl_')) {
        const intlField = field.replace('intl_', '');
        if (!newVariantPricing[variantName].internationalPrice) {
          newVariantPricing[variantName].internationalPrice = { qty1: 0, qty2: 0, qty3: 0, qty4: 0, qty5: 0, single: 0, double: 0 };
        }
        newVariantPricing[variantName].internationalPrice[intlField] = parseFloat(value) || 0;
      }
      
      return { ...prev, variantPricing: newVariantPricing };
    });
  };

  // Check if product has multiple non-empty variants
  const hasMultipleVariants = () => {
    const nonEmptyVariants = formData.variant.filter(v => v.trim());
    return nonEmptyVariants.length > 1;
  };

  // Get non-empty variants
  const getNonEmptyVariants = () => {
    return formData.variant.filter(v => v.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.description || !formData.price || !formData.sku || !formData.stock) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Build variant pricing object for submission
      const variantPricingData = {};
      if (hasMultipleVariants()) {
        getNonEmptyVariants().forEach(variantName => {
          const vp = formData.variantPricing[variantName] || {};
          variantPricingData[variantName] = {
            price: vp.price || parseFloat(formData.price) || 0,
            internationalPrice: {
              qty1: vp.internationalPrice?.qty1 || parseFloat(formData.internationalPriceQty1) || 0,
              qty2: vp.internationalPrice?.qty2 || parseFloat(formData.internationalPriceQty2) || 0,
              qty3: vp.internationalPrice?.qty3 || parseFloat(formData.internationalPriceQty3) || 0,
              qty4: vp.internationalPrice?.qty4 || parseFloat(formData.internationalPriceQty4) || 0,
              qty5: vp.internationalPrice?.qty5 || parseFloat(formData.internationalPriceQty5) || 0,
              single: vp.internationalPrice?.qty1 || parseFloat(formData.internationalPriceQty1) || 0,
              double: vp.internationalPrice?.qty2 || parseFloat(formData.internationalPriceQty2) || 0
            }
          };
        });
      }
      
      const cleanedData = {
        name: formData.name,
        subtitle: formData.subtitle,
        description: formData.description,
        price: parseFloat(formData.price),
        internationalPrice: {
          qty1: parseFloat(formData.internationalPriceQty1) || 0,
          qty2: parseFloat(formData.internationalPriceQty2) || 0,
          qty3: parseFloat(formData.internationalPriceQty3) || 0,
          qty4: parseFloat(formData.internationalPriceQty4) || 0,
          qty5: parseFloat(formData.internationalPriceQty5) || 0,
          // Keep backward compatibility
          single: parseFloat(formData.internationalPriceQty1) || 0,
          double: parseFloat(formData.internationalPriceQty2) || 0
        },
        sku: formData.sku,
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating) || 5,
        icon: formData.icon.trim() || '/images/fallback.jpg',
        features: formData.features.filter(f => f.trim()),
        specifications: formData.specifications.filter(s => s.trim()),
        compatibility: formData.compatibility.filter(c => c.trim()),
        sizes: formData.sizes.filter(s => s.trim()),
        variant: formData.variant.filter(v => v.trim()),
        variantPricing: hasMultipleVariants() ? variantPricingData : undefined,
        isActive: formData.isActive
      };

      if (isEditing) {
        await api.put(`/admin/products/${id}`, cleanedData);
        showSuccess('Product updated successfully!');
      } else {
        await api.post('/admin/products', cleanedData);
        showSuccess('Product created successfully!');
      }
      
      navigate('/admin/products');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
  const labelClass = "block text-sm font-medium mb-2 text-gray-700";
  const cardClass = "bg-white rounded-2xl p-6 shadow-sm border border-gray-100";

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
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
            onClick={() => navigate('/admin/products')}
            className="p-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="mt-1 text-gray-500">
              {isEditing ? 'Update product information' : 'Create a new product for your catalog'}
            </p>
          </div>
        </div>
        <button
          type="submit"
          form="product-form"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            {/* Basic Information */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500">Product name and description</p>
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
                  <label className={labelClass}>Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Brief product subtitle"
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

            {/* Pricing & Inventory */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h2>
                  <p className="text-sm text-gray-500">Set prices and stock levels</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Price (₹) *</label>
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
                  <label className={labelClass}>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., BD-001"
                    required
                  />
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
                  <label className={labelClass}>Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className={inputClass}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* International Pricing */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">International Pricing (USD)</h2>
                  <p className="text-sm text-gray-500">Set prices for international customers by quantity</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass}>Qty 1 Price ($)</label>
                    <input
                      type="number"
                      name="internationalPriceQty1"
                      value={formData.internationalPriceQty1}
                      onChange={handleChange}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="e.g., 100"
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Qty 2 Price ($)</label>
                    <input
                      type="number"
                      name="internationalPriceQty2"
                      value={formData.internationalPriceQty2}
                      onChange={handleChange}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="e.g., 180"
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Qty 3 Price ($)</label>
                    <input
                      type="number"
                      name="internationalPriceQty3"
                      value={formData.internationalPriceQty3}
                      onChange={handleChange}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="e.g., 260"
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Qty 4 Price ($)</label>
                    <input
                      type="number"
                      name="internationalPriceQty4"
                      value={formData.internationalPriceQty4}
                      onChange={handleChange}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="e.g., 340"
                    />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Qty 5 Price ($)</label>
                    <input
                      type="number"
                      name="internationalPriceQty5"
                      value={formData.internationalPriceQty5}
                      onChange={handleChange}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="e.g., 420"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-50 rounded-xl">
                <p className="text-sm text-purple-700">
                  <strong>Note:</strong> International prices are shown to customers outside India. 
                  Set discounted prices for higher quantities to encourage bulk orders.
                </p>
              </div>
            </div>

            {/* Variant-Specific Pricing - Only shown when multiple variants exist */}
            {hasMultipleVariants() && (
              <div className={cardClass}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Variant-Specific Pricing</h2>
                    <p className="text-sm text-gray-500">Set different prices for each variant (e.g., LED vs Non-LED)</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {getNonEmptyVariants().map((variantName, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        {variantName} Variant
                      </h3>
                      
                      {/* Indian Price (INR) */}
                      <div className="mb-4">
                        <label className={labelClass}>Price (₹) for {variantName} *</label>
                        <input
                          type="number"
                          value={formData.variantPricing[variantName]?.price || ''}
                          onChange={(e) => handleVariantPriceChange(variantName, 'price', e.target.value)}
                          className={inputClass}
                          min="0"
                          step="0.01"
                          placeholder={`Enter price for ${variantName}`}
                        />
                      </div>
                      
                      {/* International Prices (USD) */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-3 text-gray-600">
                          International Prices (USD) for {variantName}
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Qty 1 ($)</label>
                            <input
                              type="number"
                              value={formData.variantPricing[variantName]?.internationalPrice?.qty1 || ''}
                              onChange={(e) => handleVariantPriceChange(variantName, 'intl_qty1', e.target.value)}
                              className={`${inputClass} text-sm py-2`}
                              min="0"
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Qty 2 ($)</label>
                            <input
                              type="number"
                              value={formData.variantPricing[variantName]?.internationalPrice?.qty2 || ''}
                              onChange={(e) => handleVariantPriceChange(variantName, 'intl_qty2', e.target.value)}
                              className={`${inputClass} text-sm py-2`}
                              min="0"
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Qty 3 ($)</label>
                            <input
                              type="number"
                              value={formData.variantPricing[variantName]?.internationalPrice?.qty3 || ''}
                              onChange={(e) => handleVariantPriceChange(variantName, 'intl_qty3', e.target.value)}
                              className={`${inputClass} text-sm py-2`}
                              min="0"
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Qty 4 ($)</label>
                            <input
                              type="number"
                              value={formData.variantPricing[variantName]?.internationalPrice?.qty4 || ''}
                              onChange={(e) => handleVariantPriceChange(variantName, 'intl_qty4', e.target.value)}
                              className={`${inputClass} text-sm py-2`}
                              min="0"
                              step="1"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Qty 5 ($)</label>
                            <input
                              type="number"
                              value={formData.variantPricing[variantName]?.internationalPrice?.qty5 || ''}
                              onChange={(e) => handleVariantPriceChange(variantName, 'intl_qty5', e.target.value)}
                              className={`${inputClass} text-sm py-2`}
                              min="0"
                              step="1"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-700">
                    <strong>Note:</strong> When a product has multiple variants, each variant can have its own price. 
                    The base price above is used as a fallback. Customers will see variant-specific prices when they select a variant.
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Features</h2>
                  <p className="text-sm text-gray-500">Highlight key product features</p>
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
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
                className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Feature
              </button>
            </div>

            {/* Specifications */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
                  <p className="text-sm text-gray-500">Technical details and specs</p>
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
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
                className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Specification
              </button>
            </div>

            {/* Compatibility */}
            <div className={cardClass}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Compatibility</h2>
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
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
                className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Compatibility
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Image className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Product Image</h2>
                  <p className="text-sm text-gray-500">Main product photo</p>
                </div>
              </div>
              
              {/* Image Preview */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 border-2 border-dashed border-gray-300 bg-gray-50">
                <img
                  src={formData.icon || '/images/fallback.jpg'}
                  alt={formData.name || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/images/fallback.jpg'; }}
                />
              </div>

              <div>
                <label className={labelClass}>Image URL</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter image URL"
                />
              </div>
            </div>

            {/* Status */}
            <div className={cardClass}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Status</h2>
              
              <label className="flex items-center p-3 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-700">Active</span>
                  <p className="text-xs mt-0.5 text-gray-500">Visible to customers</p>
                </div>
              </label>
            </div>

            {/* Sizes */}
            <div className={cardClass}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Sizes</h2>
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
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" /> Add Size
              </button>
            </div>

            {/* Variants */}
            <div className={cardClass}>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Variants</h2>
              <div className="space-y-3">
                {formData.variant.map((v, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => handleArrayChange('variant', index, e.target.value)}
                      className={`flex-1 ${inputClass} text-sm`}
                      placeholder="Enter variant"
                    />
                    {formData.variant.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('variant', index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addArrayItem('variant')}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" /> Add Variant
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
