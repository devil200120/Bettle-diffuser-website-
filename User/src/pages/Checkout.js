import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRegion } from '../context/RegionContext';
import { useToast } from '../components/Toast';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBecpP3O2kfTa0z-lLIiShmsZE6e1kDmOk';

// Countries list for dropdown
const COUNTRIES = [
  'India',
  'USA',
  'UK',
  'Canada',
  'Australia',
  'Afghanistan',
  'Albania',
  'Algeria',
  'Andorra',
  'Angola',
  'Argentina',
  'Armenia',
  'Austria',
  'Azerbaijan',
  'Bahamas',
  'Bahrain',
  'Bangladesh',
  'Barbados',
  'Belarus',
  'Belgium',
  'Belize',
  'Benin',
  'Bhutan',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Botswana',
  'Brazil',
  'Brunei',
  'Bulgaria',
  'Burkina Faso',
  'Burundi',
  'Cambodia',
  'Cameroon',
  'Cape Verde',
  'Central African Republic',
  'Chad',
  'Chile',
  'China',
  'Colombia',
  'Comoros',
  'Congo',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Djibouti',
  'Dominica',
  'Dominican Republic',
  'East Timor',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Equatorial Guinea',
  'Eritrea',
  'Estonia',
  'Ethiopia',
  'Fiji',
  'Finland',
  'France',
  'Gabon',
  'Gambia',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Grenada',
  'Guatemala',
  'Guinea',
  'Guinea-Bissau',
  'Guyana',
  'Haiti',
  'Honduras',
  'Hungary',
  'Iceland',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Ivory Coast',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kiribati',
  'Kuwait',
  'Kyrgyzstan',
  'Laos',
  'Latvia',
  'Lebanon',
  'Lesotho',
  'Liberia',
  'Libya',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Macedonia',
  'Madagascar',
  'Malawi',
  'Malaysia',
  'Maldives',
  'Mali',
  'Malta',
  'Marshall Islands',
  'Mauritania',
  'Mauritius',
  'Mexico',
  'Micronesia',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Montenegro',
  'Morocco',
  'Mozambique',
  'Myanmar',
  'Namibia',
  'Nauru',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nicaragua',
  'Niger',
  'Nigeria',
  'North Korea',
  'Norway',
  'Oman',
  'Pakistan',
  'Palau',
  'Palestine',
  'Panama',
  'Papua New Guinea',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Rwanda',
  'Saint Kitts and Nevis',
  'Saint Lucia',
  'Saint Vincent and the Grenadines',
  'Samoa',
  'San Marino',
  'Sao Tome and Principe',
  'Saudi Arabia',
  'Senegal',
  'Serbia',
  'Seychelles',
  'Sierra Leone',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'Solomon Islands',
  'Somalia',
  'South Africa',
  'South Korea',
  'South Sudan',
  'Spain',
  'Sri Lanka',
  'Sudan',
  'Suriname',
  'Swaziland',
  'Sweden',
  'Switzerland',
  'Syria',
  'Taiwan',
  'Tajikistan',
  'Tanzania',
  'Thailand',
  'Togo',
  'Tonga',
  'Trinidad and Tobago',
  'Tunisia',
  'Turkey',
  'Turkmenistan',
  'Tuvalu',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'Uruguay',
  'Uzbekistan',
  'Vanuatu',
  'Vatican City',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zambia',
  'Zimbabwe'
];

// Helper to get correct image source
const getImageSrc = (icon) => {
  if (!icon) return '/images/placeholder.jpg';
  // If it's a full URL (starts with http/https), use it directly
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return icon;
  }
  // If it already starts with /images/, use it directly
  if (icon.startsWith('/images/')) {
    return icon;
  }
  // Otherwise, prepend /images/
  return `/images/${icon}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const { cart, clearCart } = useCart();
  const { getCartPrice, isIndia, currencySymbol, region, loading: regionLoading } = useRegion();
  const { showSuccess, showError, showWarning } = useToast();
  
  // Step management: 'email' -> 'shipping' -> 'payment'
  const [currentStep, setCurrentStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  // Email step
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [signUpForNews, setSignUpForNews] = useState(false);
  
  // Login state (if email exists)
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  
  // Shipping form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    country: '',
    postalCode: '',
    city: '',
    state: '',
    phone: ''
  });

  // Google Maps autocomplete state
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const addressInputRef = useRef(null);

  // Load Google Maps Script
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setMapsLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setMapsLoaded(true);
        }
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setMapsLoaded(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Places services
  useEffect(() => {
    if (mapsLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        const mapDiv = document.createElement('div');
        const map = new window.google.maps.Map(mapDiv);
        placesService.current = new window.google.maps.places.PlacesService(map);
      } catch (error) {
        console.error('Error initializing Google Maps services:', error);
      }
    }
  }, [mapsLoaded]);

  // Handle address input change
  const handleAddressInputChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);

    if (value.length > 2 && autocompleteService.current && window.google && window.google.maps) {
      try {
        autocompleteService.current.getPlacePredictions(
          {
            input: value,
            types: ['address']
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setAddressSuggestions(predictions);
              setShowSuggestions(true);
            } else {
              setAddressSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
      } catch (error) {
        console.error('Error fetching address predictions:', error);
      }
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle address selection from suggestions
  const handleSelectAddress = (placeId, description) => {
    setAddressInput(description);
    setShowSuggestions(false);

    if (placesService.current && window.google && window.google.maps) {
      try {
        placesService.current.getDetails(
          { placeId, fields: ['formatted_address', 'geometry', 'address_components', 'place_id'] },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              const addressComponents = place.address_components || [];
              
              let street = '', city = '', state = '', zipCode = '', country = '';
              
              addressComponents.forEach(component => {
                const types = component.types;
                if (types.includes('street_number')) {
                  street = component.long_name + ' ';
                }
                if (types.includes('route')) {
                  street += component.long_name;
                }
                if (types.includes('sublocality_level_1') || types.includes('locality')) {
                  if (!city) city = component.long_name;
                }
                if (types.includes('administrative_area_level_1')) {
                  state = component.long_name;
                }
                if (types.includes('postal_code')) {
                  zipCode = component.long_name;
                }
                if (types.includes('country')) {
                  country = component.long_name;
                }
              });

              // Map country to dropdown options
              const countryMap = {
                'India': 'India',
                'Australia': 'Australia',
                'United States': 'USA',
                'United Kingdom': 'UK',
                'Canada': 'Canada'
              };
              const mappedCountry = countryMap[country] || country;

              setFormData(prev => ({
                ...prev,
                address1: street.trim() || place.formatted_address?.split(',')[0] || '',
                city: city,
                state: state,
                postalCode: zipCode,
                country: mappedCountry || prev.country
              }));
            }
          }
        );
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    }
  };

  // Map detected country to dropdown options
  const mapCountryToOption = (detectedCountry) => {
    const countryMap = {
      'India': 'India',
      'Australia': 'Australia',
      'United States': 'USA',
      'USA': 'USA',
      'United Kingdom': 'UK',
      'UK': 'UK',
      'Canada': 'Canada'
    };
    return countryMap[detectedCountry] || 'USA';
  };

  // Set default country based on detected region
  useEffect(() => {
    if (!regionLoading && !formData.country) {
      const detectedCountry = isIndia ? 'India' : mapCountryToOption(region);
      setFormData(prev => ({
        ...prev,
        country: detectedCountry
      }));
    }
  }, [region, isIndia, regionLoading]);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    cart.forEach(item => {
      const priceInfo = getCartPrice(
        { price: item.price, internationalPrice: item.internationalPrice },
        item.quantity
      );
      subtotal += priceInfo.totalPrice;
    });
    
    const tax = 0;
    const shipping = 0;
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const total = subtotal - discount;
    
    return { subtotal, tax, shipping, discount, total };
  };

  const { subtotal, tax, shipping, discount, total } = calculateTotals();

  const formatPrice = (amount) => {
    return `${currencySymbol}${amount.toLocaleString(isIndia ? 'en-IN' : 'en-US')}`;
  };

  // Check if user is already logged in
  useEffect(() => {
    if (orderPlaced) return;
    
    if (cart.length === 0) {
      showWarning('Your cart is empty');
      navigate('/');
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      // User is already logged in, skip email step
      fetchUserData(token);
    }
  }, [cart, navigate, showWarning, orderPlaced]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const user = data.user || data;
        setUserData(user);
        setIsLoggedIn(true);
        setEmail(user.email);
        setCurrentStep('shipping');
        
        // Pre-fill shipping form
        setFormData(prev => ({
          ...prev,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          address1: user.address?.street || user.address?.formattedAddress || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.zipCode || '',
          country: user.address?.country || 'India',
          phone: user.phone || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Load Razorpay
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Check if email exists
  const handleEmailContinue = async () => {
    if (!email.trim()) {
      showError('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await fetch(`${API_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.exists) {
        setEmailExists(true);
        setShowLoginForm(true);
      } else {
        // Email doesn't exist, proceed to shipping (guest checkout or create account later)
        setEmailExists(false);
        setCurrentStep('shipping');
      }
    } catch (error) {
      console.error('Email check error:', error);
      // If API fails, just proceed to shipping
      setCurrentStep('shipping');
    } finally {
      setCheckingEmail(false);
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!loginPassword) {
      showError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: loginPassword })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to update navbar
        window.dispatchEvent(new Event('userLogin'));
        
        showSuccess('Logged in successfully!');
        setIsLoggedIn(true);
        await fetchUserData(data.token);
        setShowLoginForm(false);
        setCurrentStep('shipping');
      } else {
        showError(data.message || 'Invalid password');
      }
    } catch (error) {
      showError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Continue as guest (skip login)
  const handleContinueAsGuest = () => {
    setShowLoginForm(false);
    setCurrentStep('shipping');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal })
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedCoupon(data.coupon);
        showSuccess(data.message);
      } else {
        showError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      showError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    showSuccess('Coupon removed');
  };

  const validateShipping = () => {
    // Only postal code, country, and phone are mandatory
    const required = ['postalCode', 'country', 'phone'];
    for (const field of required) {
      if (!formData[field]?.trim()) {
        const fieldName = field === 'postalCode' ? 'postal code' : field;
        showError(`Please fill in ${fieldName}`);
        return false;
      }
    }
    if (formData.phone.length < 10) {
      showError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleShippingContinue = () => {
    if (validateShipping()) {
      setCurrentStep('payment');
    }
  };

  const handleRazorpayPayment = async (orderData, token) => {
    try {
      // Validate minimum order amount before payment
      const currency = isIndia ? 'INR' : 'USD';
      const minAmount = currency === 'INR' ? 1 : 0.50;
      
      if (total < minAmount) {
        showError(`Minimum order amount is ${currencySymbol}${minAmount} for ${currency}. Please add more items to your cart.`);
        return;
      }

      const paymentResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          amount: parseFloat(total.toFixed(2)),
          currency: isIndia ? 'INR' : 'USD',
          receipt: `order_${Date.now()}`
        })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || 'Failed to create payment order');
      }

      const options = {
        key: paymentData.key_id,
        amount: paymentData.order.amount,
        currency: paymentData.order.currency,
        name: 'Beetle Diffuser',
        description: 'Order Payment',
        order_id: paymentData.order.id,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: email,
          contact: formData.phone
        },
        theme: { color: '#E8C547' },
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              const updatedOrderData = {
                ...orderData,
                paymentStatus: 'paid',
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                discount: discount
              };

              const orderResponse = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(updatedOrderData)
              });

              const orderResult = await orderResponse.json();

              if (orderResponse.ok) {
                if (appliedCoupon) {
                  await fetch(`${API_URL}/coupons/use`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: appliedCoupon.code })
                  });
                }
                
                setOrderPlaced(true);
                clearCart();
                showSuccess('Payment successful! Order placed.');
                navigate('/order-success', { 
                  state: { 
                    order: orderResult.order,
                    accountCreated: orderResult.accountCreated,
                    email: email
                  } 
                });
              } else {
                showError(orderResult.message || 'Failed to create order');
              }
            } else {
              showError('Payment verification failed');
            }
          } catch (error) {
            showError('Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            showWarning('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showError(error.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
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
            price: itemPriceInfo.unitPrice,
            quantity: parseInt(item.quantity) || 1,
            size: item.size,
            cameraModel: item.cameraModel,
            lensModel: item.lensModel,
            flashModel: item.flashModel
          };
        }),
        shippingAddress: {
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Customer',
          street: formData.address1 + (formData.address2 ? ', ' + formData.address2 : ''),
          city: formData.city,
          state: formData.state,
          zipCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        email: email,
        paymentMethod: 'razorpay',
        currency: isIndia ? 'INR' : 'USD',
        region: region,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        // Include guest info if not logged in
        ...(!token && {
          guestInfo: {
            firstName: formData.firstName || '',
            lastName: formData.lastName || '',
            name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Customer',
            email: email,
            phone: formData.phone
          }
        })
      };

      if (!window.Razorpay || !razorpayLoaded) {
        showError('Payment gateway is loading. Please wait.');
        setLoading(false);
        return;
      }
      
      await handleRazorpayPayment(orderData, token);
    } catch (error) {
      showError('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  // Render Order Summary (right side)
  const renderOrderSummary = () => (
    <div className="bg-zinc-800 p-6 rounded-2xl h-fit">
      <h2 className="text-yellow-400 text-xl font-semibold mb-6 pb-2 border-b border-zinc-700">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {cart.map((item) => {
          const itemPriceInfo = getCartPrice(
            { price: item.price, internationalPrice: item.internationalPrice },
            item.quantity
          );
          
          return (
            <div key={item.id} className="flex gap-3 pb-4 border-b border-zinc-700 last:border-b-0">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-700">
                <img src={getImageSrc(item.icon)} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 bg-zinc-600 text-white text-xs px-1.5 py-0.5 rounded-tl">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-zinc-400 text-xs">Qty {item.quantity}</span>
                  <span className="text-yellow-400 font-semibold text-sm">{itemPriceInfo.formatted}</span>
                </div>
                <button 
                  onClick={() => navigate('/cart')}
                  className="text-zinc-400 text-xs hover:text-yellow-400 mt-1"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Section */}
      <div className="border-t border-zinc-700 pt-4 mb-4">
        <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Gift or Discount Code</h3>
        {!appliedCoupon ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Gift or Discount Code"
              className="flex-1 px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 text-sm uppercase"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="px-4 py-2 bg-zinc-700 border border-zinc-600 text-white font-medium rounded-lg hover:bg-zinc-600 transition-colors text-sm disabled:opacity-50"
            >
              {couponLoading ? '...' : 'APPLY'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div>
              <p className="text-green-400 font-semibold text-sm">{appliedCoupon.code}</p>
              <p className="text-green-400 text-xs">
                {appliedCoupon.discountType === 'percentage' 
                  ? `${appliedCoupon.discountValue}% off` 
                  : `${currencySymbol}${appliedCoupon.discountValue} off`}
              </p>
            </div>
            <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-300 text-xs">
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-700 pt-4 space-y-2">
        <div className="flex justify-between text-zinc-300 text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {appliedCoupon && discount > 0 && (
          <div className="flex justify-between text-green-400 text-sm">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-zinc-300 text-sm">
          <span>Tax</span>
          <span>{formatPrice(0)}</span>
        </div>
        <div className="flex justify-between text-zinc-300 text-sm">
          <span>Shipping</span>
          <span className="text-green-400">FREE</span>
        </div>
        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-zinc-600 mt-2">
          <span>Total</span>
          <span className="text-yellow-400">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );

  // Email Step
  const renderEmailStep = () => (
    <div className="bg-zinc-800 p-6 rounded-2xl">
      <h2 className="text-white text-xl font-semibold mb-6">Your Email</h2>
      
      {!showLoginForm ? (
        <>
          <div className="mb-4">
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          
          <p className="text-zinc-400 text-sm mb-2">You'll receive receipts and notifications at this email</p>
          <p className="text-zinc-400 text-sm mb-4">
            Already have an account? <button onClick={() => setShowLoginForm(true)} className="text-yellow-400 hover:underline">Sign in</button>
          </p>
          
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={signUpForNews}
              onChange={(e) => setSignUpForNews(e.target.checked)}
              className="w-5 h-5 rounded border-zinc-600 bg-zinc-700 text-yellow-400 focus:ring-yellow-400"
            />
            <span className="text-zinc-300 text-sm">Sign up to receive news and updates</span>
          </label>
          
          <button
            onClick={handleEmailContinue}
            disabled={checkingEmail}
            className="w-full py-4 bg-zinc-700 text-white font-semibold text-lg rounded-lg hover:bg-zinc-600 transition-colors disabled:opacity-50"
          >
            {checkingEmail ? 'Checking...' : 'CONTINUE'}
          </button>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 bg-zinc-600 border border-zinc-600 rounded-lg text-zinc-300"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-yellow-400 text-black font-semibold text-lg rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 mb-3"
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>
          
          <p className="text-center text-zinc-400 text-sm mt-4">
            <button onClick={() => { setShowLoginForm(false); setEmail(''); }} className="text-yellow-400 hover:underline">
              Use a different email
            </button>
          </p>
        </>
      )}
      
      {/* Collapsed sections preview */}
      <div className="mt-6 pt-6 border-t border-zinc-700">
        <div className="flex items-center justify-between py-3 text-zinc-500">
          <span className="font-medium">Delivery</span>
          <span className="text-xs">Next step</span>
        </div>
        <div className="flex items-center justify-between py-3 text-zinc-500 border-t border-zinc-700">
          <span className="font-medium">Payment</span>
          <span className="text-xs">Final step</span>
        </div>
      </div>
    </div>
  );

  // Shipping Step
  const renderShippingStep = () => (
    <div className="bg-zinc-800 p-6 rounded-2xl">
      {/* Email summary */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-700">
        <div>
          <span className="text-zinc-400 text-xs uppercase tracking-wider">Contact</span>
          <p className="text-white">{email}</p>
        </div>
        <button 
          onClick={() => setCurrentStep('email')}
          className="text-yellow-400 text-sm hover:underline"
        >
          Change
        </button>
      </div>
      
      <h2 className="text-white text-xl font-semibold mb-6">Shipping Address</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            First Name <span className="text-zinc-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Last Name <span className="text-zinc-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
      </div>

      {/* <div className="mb-4 relative">
        <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">Search Address</label>
        <input
          type="text"
          ref={addressInputRef}
          value={addressInput}
          onChange={handleAddressInputChange}
          placeholder="Start typing your address..."
          autoComplete="off"
          className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
        />
        {showSuggestions && addressSuggestions.length > 0 && (
          <ul className="absolute z-20 w-full bg-zinc-700 border border-zinc-500 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-xl">
            {addressSuggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onClick={() => handleSelectAddress(suggestion.place_id, suggestion.description)}
                className="px-4 py-3 hover:bg-zinc-600 cursor-pointer text-white text-sm flex items-start gap-2"
              >
                <span className="text-yellow-400">📍</span>
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
        {formData.address1 && (
          <p className="text-green-400 text-xs mt-2">✓ Address selected</p>
        )}
      </div> */}

      <div className="mb-4">
        <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
          Street Address <span className="text-zinc-500 text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          name="address1"
          value={formData.address1}
          onChange={handleChange}
          placeholder="Street address"
          className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors mb-3"
        />
        <input
          type="text"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          placeholder="Apartment, suite, etc. (Optional)"
          className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            City <span className="text-zinc-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            State/Province <span className="text-zinc-500 text-xs">(Optional)</span>
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="State/Province"
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
          >
            <option value="">Select Country</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-zinc-400 text-xs uppercase tracking-wider mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
        />
      </div>

      <button
        onClick={handleShippingContinue}
        className="w-full py-4 bg-zinc-700 text-white font-semibold text-lg rounded-lg hover:bg-zinc-600 transition-colors"
      >
        CONTINUE
      </button>
      
      {/* Payment preview */}
      <div className="mt-6 pt-6 border-t border-zinc-700">
        <div className="flex items-center justify-between py-3 text-zinc-500">
          <span className="font-medium">Payment</span>
          <span className="text-xs">Next step</span>
        </div>
      </div>
    </div>
  );

  // Payment Step
  const renderPaymentStep = () => (
    <div className="bg-zinc-800 p-6 rounded-2xl">
      {/* Summary sections */}
      <div className="mb-6 pb-4 border-b border-zinc-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-zinc-400 text-xs uppercase tracking-wider">Contact</span>
            <p className="text-white text-sm">{email}</p>
          </div>
          <button onClick={() => setCurrentStep('email')} className="text-yellow-400 text-sm hover:underline">
            Change
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-xs uppercase tracking-wider">Ship to</span>
            <p className="text-white text-sm">
              {[formData.address1, formData.city, formData.state, formData.postalCode, formData.country].filter(Boolean).join(', ')}
            </p>
          </div>
          <button onClick={() => setCurrentStep('shipping')} className="text-yellow-400 text-sm hover:underline">
            Change
          </button>
        </div>
      </div>
      
      <h2 className="text-white text-xl font-semibold mb-6">Payment</h2>
      
      <p className="text-zinc-400 mb-6">All transactions are secure and encrypted via Razorpay.</p>
      
      {!razorpayLoaded && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400 text-sm">
          ⚠️ Payment gateway is loading...
        </div>
      )}
      
      <div className="bg-zinc-700 p-4 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L22.436 0zM14.26 10.098L3.389 17.166 1.564 24l9.008-3.321.219-.082 5.832-5.967-2.363-4.532z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">Pay with Razorpay</p>
            <p className="text-zinc-400 text-xs">Cards, UPI, NetBanking & more</p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading || !razorpayLoaded}
        className="w-full py-4 bg-yellow-400 text-black font-semibold text-lg rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `PAY ${formatPrice(total)}`}
      </button>
      
      <p className="text-center text-zinc-500 text-xs mt-4">
        By completing this purchase you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );

  return (
    <div>
      <div className="max-w-6xl mx-auto px-5 pt-24 pb-32 lg:pb-12">
        <Link to="/" className="text-yellow-400 text-2xl font-bold italic mb-8 block">Beetle Diffuser</Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-3">
            {currentStep === 'email' && renderEmailStep()}
            {currentStep === 'shipping' && renderShippingStep()}
            {currentStep === 'payment' && renderPaymentStep()}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            {renderOrderSummary()}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
