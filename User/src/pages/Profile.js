import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBecpP3O2kfTa0z-lLIiShmsZE6e1kDmOk';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Address states
  const [addressInput, setAddressInput] = useState('');
  const [addressData, setAddressData] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualPincode, setManualPincode] = useState('');
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load Google Maps Script
  useEffect(() => {
    // Check if already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setMapsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.onload = () => setMapsLoaded(true);
      // If script exists and google is available, set loaded
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps');
    document.head.appendChild(script);
  }, []);

  // Initialize Places services
  useEffect(() => {
    if (mapsLoaded && window.google && window.google.maps && window.google.maps.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        // Create a hidden div for PlacesService
        const mapDiv = document.createElement('div');
        mapDiv.style.display = 'none';
        document.body.appendChild(mapDiv);
        const map = new window.google.maps.Map(mapDiv, {
          center: { lat: 0, lng: 0 },
          zoom: 1
        });
        placesService.current = new window.google.maps.places.PlacesService(map);
      } catch (error) {
        console.error('Error initializing Google Places:', error);
      }
    }
  }, [mapsLoaded]);

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/me', {
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
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        phone: data.user.phone || ''
      });
      if (data.user.address) {
        setAddressInput(data.user.address.formattedAddress || '');
        setAddressData(data.user.address);
        setManualPincode(data.user.address.zipCode || '');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddressInput(value);
    setAddressData(null);

    if (value.length > 2 && autocompleteService.current && window.google?.maps?.places) {
      try {
        autocompleteService.current.getPlacePredictions(
          { input: value, componentRestrictions: { country: 'in' } },
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
        console.error('Error getting place predictions:', error);
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAddress = (placeId, description) => {
    setAddressInput(description);
    setShowSuggestions(false);

    if (placesService.current && window.google?.maps?.places) {
      try {
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
                coordinates: place.geometry?.location ? {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                } : null
              });
              // Set manual pincode if Google provided one
              if (zipCode) {
                setManualPincode(zipCode);
              } else {
                setManualPincode('');
              }
            }
          }
        );
      } catch (error) {
        console.error('Error getting place details:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.name,
        phone: formData.phone
      };

      if (addressData) {
        updateData.address = {
          ...addressData,
          zipCode: manualPincode || addressData.zipCode || ''
        };
      }

      const response = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-800 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
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
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">My Profile</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-green-500/20 text-green-400 border border-green-500'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-zinc-700 rounded-2xl p-6 md:p-8 shadow-xl">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 pb-6 border-b border-zinc-600">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-3xl font-bold text-zinc-800">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
              <p className="text-zinc-400">{user?.email}</p>
            </div>
          </div>

          {!editing ? (
            <>
              {/* Profile Details View */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-600/50 p-4 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-1">Full Name</p>
                    <p className="text-white font-medium">{user?.name}</p>
                  </div>
                  <div className="bg-zinc-600/50 p-4 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div className="bg-zinc-600/50 p-4 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-1">Phone</p>
                    <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div className="bg-zinc-600/50 p-4 rounded-lg">
                    <p className="text-zinc-400 text-sm mb-1">Address</p>
                    <p className="text-white font-medium text-sm">
                      {user?.address?.formattedAddress || 'Not provided'}
                    </p>
                    {user?.address?.zipCode && (
                      <p className="text-yellow-400 text-sm mt-1">Pincode: {user.address.zipCode}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button 
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Password Change Form */}
              {showPasswordChange && (
                <form onSubmit={handlePasswordChange} className="mt-8 pt-6 border-t border-zinc-600">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        type="submit" 
                        disabled={saving}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-zinc-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {saving ? 'Changing...' : 'Change Password'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Edit Profile Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-300 text-sm mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-zinc-400 cursor-not-allowed"
                />
                <p className="text-zinc-500 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-zinc-300 text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                />
              </div>

              <div className="relative">
                <label className="block text-zinc-300 text-sm mb-2">Address</label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={handleAddressChange}
                  placeholder="Start typing your address..."
                  autoComplete="off"
                  className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
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
                  <label className="block text-zinc-300 text-sm mb-2">Pincode <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={manualPincode}
                    onChange={(e) => setManualPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    className="w-full bg-zinc-600 border border-zinc-500 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                  {!manualPincode && (
                    <p className="text-yellow-400 text-xs mt-1">Please enter your pincode for accurate delivery</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-zinc-900 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || ''
                    });
                    if (user?.address) {
                      setAddressInput(user.address.formattedAddress || '');
                      setAddressData(user.address);
                      setManualPincode(user.address.zipCode || '');
                    }
                  }}
                  className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
