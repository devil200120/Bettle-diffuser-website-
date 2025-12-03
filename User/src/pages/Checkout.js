import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import { useToast } from '../components/Toast';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const Checkout = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { cart, clearCart, showSuccessMessage } = useCart();
  const { getCartPrice, isIndia, currencySymbol, region, loading: regionLoading } = useRegion();
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'cod'
  });

  // Calculate totals based on region
  const calculateTotals = () => {
    let subtotal = 0;
    
    cart.forEach(item => {
      const priceInfo = getCartPrice(
        { price: item.price, internationalPrice: item.internationalPrice },
        item.quantity
      );
      subtotal += priceInfo.totalPrice;
    });
    
    // 18% GST for India, no tax for international
    const taxRate = isIndia ? 0.18 : 0;
    const tax = subtotal * taxRate;
    
    // Free shipping for India, $20 for international
    const shipping = subtotal > 0 ? (isIndia ? 0 : 20) : 0;
    
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total, taxRate };
  };

  const { subtotal, tax, shipping, total, taxRate } = calculateTotals();

  const formatPrice = (amount) => {
    return `${currencySymbol}${amount.toLocaleString(isIndia ? 'en-IN' : 'en-US')}`;
  };

  useEffect(() => {
    // Don't redirect if order was just placed
    if (orderPlaced) return;
    
    // Redirect if cart is empty
    if (cart.length === 0) {
      showWarning('Your cart is empty');
      navigate('/');
      return;
    }

    // Fetch user data if logged in
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            const user = userData.user || userData;
            
            // Check if user has a saved address
            if (user.address && (user.address.formattedAddress || user.address.street || user.address.city)) {
              setSavedAddress({
                formattedAddress: user.address.formattedAddress || '',
                street: user.address.street || '',
                city: user.address.city || '',
                state: user.address.state || '',
                zipCode: user.address.zipCode || '',
                country: user.address.country || 'India'
              });
            }
            
            // Pre-fill form with user data
            setFormData(prev => ({
              ...prev,
              firstName: user.name?.split(' ')[0] || user.firstName || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || user.lastName || '',
              email: user.email || '',
              phone: user.phone || '',
              address: user.address?.street || user.address?.formattedAddress || '',
              city: user.address?.city || '',
              state: user.address?.state || '',
              zipCode: user.address?.zipCode || '',
              country: user.address?.country || 'India'
            }));
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    fetchUser();
  }, [cart, navigate, showWarning, orderPlaced]);

  // Handle using saved address
  const handleUseSavedAddress = (useIt) => {
    setUseSavedAddress(useIt);
    if (useIt && savedAddress) {
      // Fill with saved address
      setFormData(prev => ({
        ...prev,
        address: savedAddress.street || savedAddress.formattedAddress || '',
        city: savedAddress.city || '',
        state: savedAddress.state || '',
        zipCode: savedAddress.zipCode || '',
        country: savedAddress.country || 'India'
      }));
    } else {
      // Clear address fields for new address entry
      setFormData(prev => ({
        ...prev,
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!formData[field]?.trim()) {
        showError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address');
      return false;
    }
    // Phone validation
    if (formData.phone.length < 10) {
      showError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const orderData = {
        items: cart.map(item => {
          const itemPriceInfo = getCartPrice(
            { price: item.price, internationalPrice: item.internationalPrice },
            item.quantity
          );
          return {
            product: item.productId,
            name: item.name,
            price: itemPriceInfo.unitPrice, // Use region-appropriate unit price
            quantity: parseInt(item.quantity) || 1,
            size: item.size,
            cameraModel: item.cameraModel,
            lensModel: item.lensModel,
            flashModel: item.flashModel
          };
        }),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        currency: isIndia ? 'INR' : 'USD',
        region: region,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        guestInfo: !token ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        } : null
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        setOrderPlaced(true); // Prevent redirect on cart clear
        clearCart();
        showSuccess('Order placed successfully!');
        navigate('/order-success', { state: { order: data.order } });
      } else {
        showError(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-5 pt-24 pb-32 lg:pb-12">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary - Shows first on mobile */}
          <div className="lg:order-2 bg-zinc-800 p-6 rounded-2xl h-fit">
            <h2 className="text-yellow-400 text-xl font-semibold mb-6 pb-2 border-b border-zinc-700">Order Summary</h2>
            
            {/* Region indicator */}
            {!regionLoading && (
              <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${isIndia ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {isIndia ? '🇮🇳 Shipping to India' : '🌍 International Shipping'}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => {
                const itemPriceInfo = getCartPrice(
                  { price: item.price, internationalPrice: item.internationalPrice },
                  item.quantity
                );
                
                return (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-zinc-700 last:border-b-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-700">
                      <img src={`/images/${item.icon}`} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                      {item.size && <p className="text-zinc-400 text-xs">Size: {item.size}</p>}
                      <p className="text-zinc-400 text-xs">Qty: {item.quantity}</p>
                      {item.cameraModel && <p className="text-zinc-400 text-xs truncate">Camera: {item.cameraModel}</p>}
                      {item.lensModel && <p className="text-zinc-400 text-xs truncate">Lens: {item.lensModel}</p>}
                      {item.flashModel && <p className="text-zinc-400 text-xs truncate">Flash: {item.flashModel}</p>}
                      {itemPriceInfo.hasDiscount && (
                        <p className="text-green-400 text-xs">✓ Bundle discount</p>
                      )}
                    </div>
                    <div className="text-yellow-400 font-semibold text-sm">
                      {itemPriceInfo.formatted}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-zinc-700 pt-4 space-y-2">
              <div className="flex justify-between text-zinc-300">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {isIndia && (
                <div className="flex justify-between text-zinc-300">
                  <span>GST (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-300">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-400' : ''}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-yellow-400 font-bold text-xl pt-2 border-t border-zinc-600 mt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="w-full mt-6 py-3 bg-transparent border border-zinc-500 text-zinc-300 rounded-lg hover:border-yellow-400 hover:text-yellow-400 transition-colors"
            >
              ← Back to Cart
            </button>
          </div>

          {/* Shipping Form */}
          <div className="lg:order-1 lg:col-span-2 bg-zinc-800 p-6 rounded-2xl">
            <h2 className="text-yellow-400 text-xl font-semibold mb-6 pb-2 border-b border-zinc-700">Shipping Information</h2>
            
            {/* Saved Address Selection */}
            {isLoggedIn && savedAddress && (savedAddress.formattedAddress || savedAddress.city) && (
              <div className="mb-6">
                <p className="text-zinc-300 text-sm mb-3">Choose shipping address:</p>
                <div className="space-y-3">
                  {/* Use Saved Address Option */}
                  <label 
                    className={`flex items-start p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      useSavedAddress 
                        ? 'bg-yellow-400/10 border-yellow-400' 
                        : 'bg-zinc-700 border-transparent hover:border-zinc-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressChoice"
                      checked={useSavedAddress}
                      onChange={() => handleUseSavedAddress(true)}
                      className="w-5 h-5 accent-yellow-400 mr-4 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 font-semibold">📍 Saved Address</span>
                        <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">Default</span>
                      </div>
                      <p className="text-white text-sm">
                        {savedAddress.formattedAddress || `${savedAddress.street}, ${savedAddress.city}, ${savedAddress.state} ${savedAddress.zipCode}, ${savedAddress.country}`}
                      </p>
                    </div>
                  </label>

                  {/* Enter New Address Option */}
                  <label 
                    className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      !useSavedAddress 
                        ? 'bg-yellow-400/10 border-yellow-400' 
                        : 'bg-zinc-700 border-transparent hover:border-zinc-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressChoice"
                      checked={!useSavedAddress}
                      onChange={() => handleUseSavedAddress(false)}
                      className="w-5 h-5 accent-yellow-400 mr-4"
                    />
                    <span className="text-white">✏️ Enter a new address</span>
                  </label>
                </div>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-zinc-300 text-sm mb-2">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address"
                  className={`w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors ${useSavedAddress ? 'opacity-60 cursor-not-allowed' : ''}`}
                  required
                  disabled={useSavedAddress}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className={`w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors ${useSavedAddress ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={useSavedAddress}
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    className={`w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors ${useSavedAddress ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={useSavedAddress}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="400001"
                    className={`w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors ${useSavedAddress ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                    disabled={useSavedAddress}
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 text-sm mb-2">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors ${useSavedAddress ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={useSavedAddress}
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              <h2 className="text-yellow-400 text-xl font-semibold mb-4 pb-2 border-b border-zinc-700 mt-8">Payment Method</h2>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-center p-4 bg-zinc-700 rounded-xl cursor-pointer border-2 border-transparent hover:border-zinc-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-yellow-400 mr-4"
                  />
                  <span className="flex items-center gap-3 text-white">
                    <span className="text-2xl">💵</span>
                    Cash on Delivery
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-zinc-700 rounded-xl cursor-pointer border-2 border-transparent hover:border-zinc-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-yellow-400 mr-4"
                  />
                  <span className="flex items-center gap-3 text-white">
                    <span className="text-2xl">💳</span>
                    Credit/Debit Card
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-zinc-700 rounded-xl cursor-pointer border-2 border-transparent hover:border-zinc-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === 'upi'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-yellow-400 mr-4"
                  />
                  <span className="flex items-center gap-3 text-white">
                    <span className="text-2xl">📱</span>
                    UPI
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-yellow-400 text-black font-semibold text-lg rounded-xl hover:bg-yellow-500 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 hidden lg:block"
              >
                {loading ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Sticky Mobile Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 p-4 lg:hidden z-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400">Total Amount</span>
          <span className="text-yellow-400 font-bold text-xl">{formatPrice(total)}</span>
        </div>
        <button
          type="button"
          onClick={() => formRef.current?.requestSubmit()}
          disabled={loading}
          className="w-full py-4 bg-yellow-400 text-black font-semibold text-lg rounded-xl hover:bg-yellow-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
