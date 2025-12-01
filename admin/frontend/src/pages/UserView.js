import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Clock,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';

const UserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const [deleteModal, setDeleteModal] = React.useState(false);

  const { data, isLoading, error } = useQuery(
    ['user', id],
    () => usersAPI.getById(id),
    {
      enabled: !!id,
    }
  );

  const toggleStatusMutation = useMutation(
    () => usersAPI.toggleStatus(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', id]);
        queryClient.invalidateQueries('users');
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    }
  );

  const deleteMutation = useMutation(
    () => usersAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
        navigate('/users');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );

  const user = data?.data;

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'success',
      customer: 'default'
    };
    return <Badge variant={variants[role] || 'default'} dot>{role}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`text-center backdrop-blur-sm border rounded-2xl p-8 max-w-md ${
          isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-error-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error loading user</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{error.message}</p>
          <Link to="/users" className="btn btn-primary mt-4">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`text-center backdrop-blur-sm border rounded-2xl p-8 max-w-md ${
          isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="w-16 h-16 bg-warning-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-warning-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>User not found</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>The user you're looking for doesn't exist.</p>
          <Link to="/users" className="btn btn-primary mt-4">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {getRoleBadge(user.role)}
                {user.isActive ? (
                  <Badge variant="success" dot>Active</Badge>
                ) : (
                  <Badge variant="error" dot>Inactive</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStatusMutation.mutate()}
            disabled={toggleStatusMutation.isLoading}
            className={`btn ${user.isActive ? 'btn-secondary' : 'btn-success'}`}
          >
            {user.isActive ? (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </button>
          <Link to={`/users/${id}/edit`} className="btn btn-primary">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="btn bg-error-500/10 text-error-400 hover:bg-error-500/20 border border-error-500/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
            isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Contact Information
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  User's personal details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? 'bg-dark-700/50' : 'bg-gray-100'
                  }`}>
                    <Mail className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Email Address</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? 'bg-dark-700/50' : 'bg-gray-100'
                  }`}>
                    <Phone className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Phone Number</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? 'bg-dark-700/50' : 'bg-gray-100'
                  }`}>
                    <Shield className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Role</p>
                    <p className={`font-medium capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? 'bg-dark-700/50' : 'bg-gray-100'
                  }`}>
                    {user.isActive ? (
                      <CheckCircle className="h-5 w-5 text-success-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-error-400" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Account Status</p>
                    <p className={`font-medium ${user.isActive ? 'text-success-400' : 'text-error-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
            isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Address
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Shipping address information
                </p>
              </div>
            </div>

            {user.address && (user.address.street || user.address.city || user.address.state || user.address.country) ? (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-gray-50'}`}>
                <div className="space-y-1">
                  {user.address.street && (
                    <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{user.address.street}</p>
                  )}
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {[user.address.city, user.address.state, user.address.zipCode].filter(Boolean).join(', ')}
                  </p>
                  {user.address.country && (
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.address.country}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 rounded-xl ${isDark ? 'bg-dark-700/30' : 'bg-gray-50'}`}>
                <MapPin className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No address provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity */}
          <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
            isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Activity
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-dark-700/50' : 'bg-gray-100'
                }`}>
                  <Calendar className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Joined</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-dark-700/50' : 'bg-gray-100'
                }`}>
                  <Clock className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Last Login</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(user.lastLogin)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-dark-700/50' : 'bg-gray-100'
                }`}>
                  <Calendar className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Last Updated</p>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`backdrop-blur-sm border rounded-2xl p-6 ${
            isDark 
              ? 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/20' 
              : 'bg-gradient-to-br from-primary-500/5 to-accent-500/5 border-primary-500/10'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <Link
                to={`/users/${id}/edit`}
                className="w-full btn btn-primary justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Link>
              
              <button
                onClick={() => toggleStatusMutation.mutate()}
                disabled={toggleStatusMutation.isLoading}
                className={`w-full btn justify-center ${
                  user.isActive 
                    ? isDark ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-success-500/20 text-success-400 hover:bg-success-500/30'
                }`}
              >
                {toggleStatusMutation.isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : user.isActive ? (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleRight className="h-4 w-4 mr-2" />
                )}
                {user.isActive ? 'Deactivate Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className={`flex items-center gap-4 p-4 rounded-xl ${
            isDark ? 'bg-error-500/10 border border-error-500/20' : 'bg-error-50 border border-error-200'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-error-500/20' : 'bg-error-100'
            }`}>
              <Trash2 className="h-6 w-6 text-error-400" />
            </div>
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
            </div>
          </div>
          
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Are you sure you want to delete this user? This action will deactivate the user account.
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setDeleteModal(false)}
              className={`btn ${isDark ? 'bg-dark-700 hover:bg-dark-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isLoading}
              className="btn bg-error-500 hover:bg-error-600 text-white"
            >
              {deleteMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserView;
