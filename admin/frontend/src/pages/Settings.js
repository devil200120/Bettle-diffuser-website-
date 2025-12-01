import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { authAPI } from '../services/api';
import { 
  Settings as SettingsIcon,
  Lock,
  User,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';

const Settings = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const updateProfileMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('auth');
        toast.success('Profile updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  const updatePasswordMutation = useMutation(
    (data) => authAPI.changePassword(data),
    {
      onSuccess: () => {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update password');
      }
    }
  );

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    updatePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center">
          <SettingsIcon className="h-7 w-7 text-primary-400" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className={`backdrop-blur-sm border rounded-2xl p-6 ${isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-accent-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Information</h2>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Update your personal details</p>
            </div>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                  isDark 
                    ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                  isDark 
                    ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                required
              />
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="btn btn-primary"
              >
                {updateProfileMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className={`backdrop-blur-sm border rounded-2xl p-6 ${isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
              <Lock className="h-5 w-5 text-warning-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Password</h2>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Update your security credentials</p>
            </div>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                    isDark 
                      ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                    isDark 
                      ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Password must be at least 6 characters</p>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                    isDark 
                      ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatePasswordMutation.isLoading}
                className="btn btn-primary"
              >
                {updatePasswordMutation.isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Account Information */}
      <div className={`backdrop-blur-sm border rounded-2xl p-6 ${isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
            <Shield className="h-5 w-5 text-success-400" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Information</h2>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Your account details at a glance</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-xl p-4 ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Shield className="h-4 w-4" />
              <span className="text-sm">Account Type</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.role}</span>
              <Badge variant={user?.role === 'admin' ? 'success' : 'default'} dot>
                {user?.role === 'admin' ? 'Full Access' : 'Limited'}
              </Badge>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Member Since</span>
            </div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) 
                : 'N/A'}
            </p>
          </div>
          
          <div className={`rounded-xl p-4 ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
            <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock className="h-4 w-4" />
              <span className="text-sm">Last Login</span>
            </div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {user?.lastLogin 
                ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) 
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Security Status */}
        <div className={`mt-6 pt-6 border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success-400" />
              </div>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Account Security</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your account is protected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success" dot>Secure</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;