import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import { 
  ArrowLeft, 
  Save, 
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    isActive: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch user data if editing
  const { data: userData, isLoading: userLoading } = useQuery(
    ['user', id],
    () => usersAPI.getById(id),
    {
      enabled: isEditMode,
      onSuccess: (response) => {
        const user = response.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          role: user.role || 'customer',
          phone: user.phone || '',
          address: {
            street: user.address?.street || '',
            city: user.address?.city || '',
            state: user.address?.state || '',
            zipCode: user.address?.zipCode || '',
            country: user.address?.country || ''
          },
          isActive: user.isActive !== undefined ? user.isActive : true
        });
      }
    }
  );

  // Create mutation
  const createMutation = useMutation(usersAPI.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User created successfully!');
      navigate('/users');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });

  // Update mutation
  const updateMutation = useMutation(
    (data) => usersAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries(['user', id]);
        toast.success('User updated successfully!');
        navigate('/users');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user');
      }
    }
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditMode) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    const submitData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      address: formData.address,
      isActive: formData.isActive
    };

    // Only include password if provided
    if (formData.password) {
      submitData.password = formData.password;
    }

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  if (isEditMode && userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/users"
            className={`p-2 rounded-xl transition-colors ${
              isDark 
                ? 'hover:bg-dark-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isEditMode 
                ? 'bg-accent-500/20' 
                : 'bg-primary-500/20'
            }`}>
              {isEditMode ? (
                <Edit className={`h-6 w-6 ${isEditMode ? 'text-accent-400' : 'text-primary-400'}`} />
              ) : (
                <UserPlus className="h-6 w-6 text-primary-400" />
              )}
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {isEditMode ? 'Edit User' : 'Add New User'}
              </h1>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {isEditMode ? 'Update user information' : 'Create a new user account'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Basic Information
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    User's personal details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name <span className="text-error-400">*</span>
                  </label>
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } ${errors.name ? 'border-error-500' : ''}`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-error-400">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address <span className="text-error-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } ${errors.email ? 'border-error-500' : ''}`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-error-400">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role <span className="text-error-400">*</span>
                  </label>
                  <div className="relative">
                    <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
                  <Lock className="h-5 w-5 text-warning-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {isEditMode ? 'Change Password' : 'Set Password'}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {isEditMode ? 'Leave blank to keep current password' : 'Set the user\'s login password'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Password {!isEditMode && <span className="text-error-400">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } ${errors.password ? 'border-error-500' : ''}`}
                      placeholder={isEditMode ? 'Enter new password' : 'Enter password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-error-400">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Confirm Password {!isEditMode && <span className="text-error-400">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } ${errors.confirmPassword ? 'border-error-500' : ''}`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-error-400">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-accent-400" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Address Information
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    User's shipping address (optional)
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Street */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                      isDark 
                        ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* City */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Enter city"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Enter state"
                    />
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Enter ZIP code"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        isDark 
                          ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Account Status
              </h3>
              
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Active</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    User can log in and access the platform
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 rounded-full peer-focus:ring-4 peer-focus:ring-primary-500/25 transition-colors ${
                    formData.isActive 
                      ? 'bg-success-500' 
                      : isDark ? 'bg-dark-600' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.isActive ? 'translate-x-5' : ''
                    }`} />
                  </div>
                </div>
              </label>
            </div>

            {/* Actions Card */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary justify-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? 'Update User' : 'Create User'}
                    </>
                  )}
                </button>
                
                <Link
                  to="/users"
                  className={`w-full btn justify-center ${
                    isDark 
                      ? 'bg-dark-700 hover:bg-dark-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
              isDark 
                ? 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/20' 
                : 'bg-gradient-to-br from-primary-500/5 to-accent-500/5 border-primary-500/10'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                💡 Tips
              </h3>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Use a strong password with at least 6 characters</li>
                <li>• Admin users have full access to the admin panel</li>
                <li>• Customer role is for regular website users</li>
                <li>• Inactive users cannot log in</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
