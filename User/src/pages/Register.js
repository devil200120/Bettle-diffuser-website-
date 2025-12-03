import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const GOOGLE_MAPS_API_KEY = 'AIzaSyBecpP3O2kfTa0z-lLIiShmsZE6e1kDmOk';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [addressInput, setAddressInput] = useState('');
  const [addressData, setAddressData] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualPincode, setManualPincode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const addressInputRef = useRef(null);

  // Load Google Maps Script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript && existingScript.parentNode) {
        // Don't remove script, other components might need it
      }
    };
  }, []);

  // Initialize Places services when maps loaded
  useEffect(() => {
    if (mapsLoaded && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const mapDiv = document.createElement('div');
      const map = new window.google.maps.Map(mapDiv);
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  }, [mapsLoaded]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);
    setAddressData(null); // Clear selected address when typing

    if (value.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: 'in' } // Restrict to India
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
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAddress = (placeId, description) => {
    setAddressInput(description);
    setShowSuggestions(false);

    if (placesService.current) {
      placesService.current.getDetails(
        { placeId, fields: ['formatted_address', 'geometry', 'address_components', 'place_id'] },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const addressComponents = place.address_components || [];
            
            let street = '', city = '', state = '', zipCode = '', country = '';
            
            addressComponents.forEach(component => {
              const types = component.types;
              if (types.includes('street_number') || types.includes('route')) {
                street += (street ? ' ' : '') + component.long_name;
              }
              if (types.includes('locality') || types.includes('sublocality_level_1')) {
                city = component.long_name;
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

            setAddressData({
              formattedAddress: place.formatted_address,
              street,
              city,
              state,
              zipCode,
              country: country || 'India',
              placeId: place.place_id,
              coordinates: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
            });
            // Set manual pincode if Google provided one
            if (zipCode) {
              setManualPincode(zipCode);
            }
          }
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          ...(addressData && { 
            address: {
              ...addressData,
              zipCode: manualPincode || addressData.zipCode || ''
            }
          })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to home
      navigate('/');
      window.location.reload(); // Refresh to update navbar
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-800">
      <div className="flex items-center justify-center min-h-screen pt-24 pb-12 px-4">
        <div className="w-full max-w-md bg-zinc-700 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-2">Create Account</h1>
          <p className="text-zinc-400 text-center mb-8">Join Beetle Diffuser today</p>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-zinc-300 text-sm mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-zinc-300 text-sm mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-zinc-300 text-sm mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-zinc-300 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-zinc-300 text-sm mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div className="relative">
              <label htmlFor="address" className="block text-zinc-300 text-sm mb-2">
                Address (Optional)
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Start typing your address..."
                value={addressInput}
                onChange={handleAddressChange}
                ref={addressInputRef}
                autoComplete="off"
                className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
              />
              {showSuggestions && addressSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-zinc-700 border border-zinc-500 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-xl">
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
              {addressData && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ Address selected: {addressData.city}, {addressData.state}
                </p>
              )}
            </div>

            {addressData && (
              <div>
                <label htmlFor="pincode" className="block text-zinc-300 text-sm mb-2">
                  Pincode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  placeholder="Enter 6-digit pincode"
                  value={manualPincode}
                  onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 transition-colors"
                />
                {!manualPincode && (
                  <p className="text-yellow-400 text-xs mt-1">Please enter your pincode for accurate delivery</p>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-zinc-900 font-bold py-3 px-6 rounded-lg transition-colors mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-zinc-600"></div>
            <span className="text-zinc-500 text-sm">or</span>
            <div className="flex-1 h-px bg-zinc-600"></div>
          </div>

          <p className="text-center text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
