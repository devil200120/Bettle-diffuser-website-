import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Users as UsersIcon,
  Calendar,
  Mail,
  X,
  Shield,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import Pagination from '../components/UI/Pagination';
import Modal from '../components/UI/Modal';
import { useTheme } from '../contexts/ThemeContext';

const Users = () => {
  const { isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['users', { 
      page: currentPage, 
      search: searchQuery, 
      role: roleFilter,
      isActive: statusFilter
    }],
    () => usersAPI.getAll({
      page: currentPage,
      limit: 10,
      search: searchQuery,
      role: roleFilter,
      isActive: statusFilter
    }),
    {
      keepPreviousData: true,
      onSuccess: (response) => {
        console.log('Users API Response:', response);
      },
      onError: (err) => {
        console.error('Users API Error:', err);
      }
    }
  );

  const toggleStatusMutation = useMutation(
    usersAPI.toggleStatus,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update user status');
      }
    }
  );

  const deleteMutation = useMutation(
    usersAPI.delete,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
        setDeleteModal({ isOpen: false, user: null });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  );

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || roleFilter || statusFilter;

  const handleToggleStatus = (userId) => {
    toggleStatusMutation.mutate(userId);
  };

  const handleDelete = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const confirmDelete = () => {
    if (deleteModal.user) {
      deleteMutation.mutate(deleteModal.user._id);
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'success',
      customer: 'default'
    };
    return <Badge variant={variants[role] || 'default'} dot>{role}</Badge>;
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'customer', label: 'Customer' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className={`text-center backdrop-blur-sm border rounded-2xl p-8 max-w-md ${
          isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
        }`}>
          <div className="w-16 h-16 bg-error-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="h-8 w-8 text-error-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error loading users</h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Users</h1>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 backdrop-blur-sm border rounded-xl ${
            isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
          }`}>
            <UserCheck className="h-4 w-4 text-primary-400" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{pagination.total || 0} total</span>
          </div>
          <Link to="/users/new" className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Link>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {roleOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => { setRoleFilter(opt.value === roleFilter ? '' : opt.value); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              roleFilter === opt.value
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : isDark 
                  ? 'bg-dark-800/50 text-gray-400 border border-dark-700/50 hover:bg-dark-700/50 hover:text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className={`backdrop-blur-sm border rounded-2xl p-4 ${
        isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
      }`}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className={`w-full px-4 py-3 pl-11 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                  isDark 
                    ? 'bg-dark-700/50 border-dark-600 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <select
            className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer ${
              isDark 
                ? 'bg-dark-700/50 border-dark-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          <button type="submit" className="btn btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </form>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-sm">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="hover:text-primary-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {roleFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-500/20 text-accent-400 rounded-lg text-sm capitalize">
                Role: {roleFilter}
                <button onClick={() => setRoleFilter('')} className="hover:text-accent-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-500/20 text-success-400 rounded-lg text-sm">
                Status: {statusFilter === 'true' ? 'Active' : 'Inactive'}
                <button onClick={() => setStatusFilter('')} className="hover:text-success-300">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className={`backdrop-blur-sm border rounded-2xl overflow-hidden ${
        isDark ? 'bg-dark-800/50 border-dark-700/50' : 'bg-white/70 border-gray-200'
      }`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-dark-700/50' : 'bg-gray-100'
              }`}>
                <UsersIcon className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No users found</h3>
              <p className={`text-sm max-w-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {hasActiveFilters
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating a new user account.'}
              </p>
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="btn btn-secondary">
                  Clear Filters
                </button>
              ) : (
                <Link to="/users/new" className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>User</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Role</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Joined</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Login</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-dark-700/30' : 'divide-gray-100'}`}>
                  {users.map((user) => (
                    <tr key={user._id} className={`transition-colors ${isDark ? 'hover:bg-dark-700/30' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="text-sm font-semibold text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {user.name}
                            </div>
                            <div className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' && <Shield className="h-4 w-4 text-success-400" />}
                          {getRoleBadge(user.role)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Calendar className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {user.lastLogin ? 
                            new Date(user.lastLogin).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Never</span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          disabled={toggleStatusMutation.isLoading}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-dark-700/50' : 'hover:bg-gray-100'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <ToggleRight className="h-5 w-5 text-success-400" />
                              <span className="text-sm text-success-400 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/users/${user._id}`}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark 
                                ? 'text-gray-400 hover:text-white hover:bg-dark-700/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/users/${user._id}/edit`}
                            className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-error-400 hover:text-error-300 hover:bg-error-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className={`border-t ${isDark ? 'border-dark-700/50' : 'border-gray-200'}`}>
              <Pagination
                currentPage={pagination.page || 1}
                totalPages={pagination.pages || 1}
                onPageChange={setCurrentPage}
                totalItems={pagination.total || 0}
                itemsPerPage={pagination.limit || 10}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        title="Delete User"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-error-500/10 border border-error-500/20 rounded-xl">
            <div className="w-12 h-12 bg-error-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 className="h-6 w-6 text-error-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                Delete "{deleteModal.user?.name}"?
              </p>
              <p className="text-gray-400 text-sm mt-1">
                This action cannot be undone. All data will be permanently removed.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteModal({ isOpen: false, user: null })}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
              className="btn btn-danger"
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

export default Users;