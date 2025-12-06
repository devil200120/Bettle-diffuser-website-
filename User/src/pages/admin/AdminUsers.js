import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Search,
  Trash2,
  Users as UsersIcon,
  Calendar,
  Mail,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { useToast } from '../../components/Toast';

const AdminUsers = () => {
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [banModal, setBanModal] = useState({ isOpen: false, user: null, reason: '' });
  const [createAdminModal, setCreateAdminModal] = useState({ 
    isOpen: false, 
    formData: { name: '', email: '', password: '', phone: '' }
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter })
      });
      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      showSuccess('User status updated');
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;
    try {
      await api.delete(`/admin/users/${deleteModal.user._id}`);
      showSuccess('User deleted successfully');
      setDeleteModal({ isOpen: false, user: null });
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBan = async () => {
    if (!banModal.user) return;
    try {
      await api.patch(`/admin/users/${banModal.user._id}/ban`, {
        reason: banModal.reason
      });
      showSuccess(`User ${banModal.user.isBanned ? 'unbanned' : 'banned'} successfully`);
      setBanModal({ isOpen: false, user: null, reason: '' });
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to ban/unban user');
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-admin`);
      showSuccess('Admin status updated');
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update admin status');
    }
  };

  const handleCreateAdmin = async () => {
    const { name, email, password, phone } = createAdminModal.formData;
    
    if (!name || !email || !password || !phone) {
      showError('Please fill all required fields');
      return;
    }

    try {
      await api.post('/admin/users/create-admin', {
        name,
        email,
        password,
        phone
      });
      showSuccess('Admin user created successfully');
      setCreateAdminModal({ isOpen: false, formData: { name: '', email: '', password: '', phone: '' } });
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-gray-500">Manage user accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateAdminModal({ isOpen: true, formData: { name: '', email: '', password: '', phone: '' } })}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Admin</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl">
            <UsersIcon className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600">{pagination.total || 0} total users</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            />
          </div>
          <select
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Users will appear here when they register.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Last Login</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                            <span className="text-sm font-semibold text-white">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {user.name}
                              {user.isAdmin && (
                                <Shield className="h-4 w-4 text-green-500" title="Admin" />
                              )}
                              {user.isBanned && (
                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">BANNED</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{user.phone || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {user.isActive ? (
                            <>
                              <ToggleRight className="h-5 w-5 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-500">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleAdmin(user._id)}
                            className={`p-2 rounded-lg transition-all ${
                              user.isAdmin 
                                ? 'text-green-500 hover:text-green-700 hover:bg-green-50' 
                                : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setBanModal({ isOpen: true, user, reason: '' })}
                            className={`p-2 rounded-lg transition-all ${
                              user.isBanned 
                                ? 'text-green-500 hover:text-green-700 hover:bg-green-50' 
                                : 'text-orange-500 hover:text-orange-700 hover:bg-orange-50'
                            }`}
                            title={user.isBanned ? 'Unban User' : 'Ban User'}
                          >
                            {user.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, user })}
                            className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
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
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {pagination.total > 0 
                  ? `Showing ${((pagination.page - 1) * 10) + 1} to ${Math.min(pagination.page * 10, pagination.total)} of ${pagination.total} users`
                  : 'No users found'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  Page {pagination.page} of {pagination.pages || 1}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Ban Modal */}
      {banModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                banModal.user?.isBanned ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {banModal.user?.isBanned ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Ban className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {banModal.user?.isBanned ? 'Unban' : 'Ban'} "{banModal.user?.name}"?
                </h3>
                <p className="text-sm text-gray-500">
                  {banModal.user?.isBanned 
                    ? 'This user will be able to access their account again.'
                    : 'This user will not be able to login or access their account.'}
                </p>
              </div>
            </div>
            {!banModal.user?.isBanned && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for ban (optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Enter reason for banning this user..."
                  value={banModal.reason}
                  onChange={(e) => setBanModal(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBanModal({ isOpen: false, user: null, reason: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                className={`px-4 py-2 text-white rounded-lg ${
                  banModal.user?.isBanned 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {banModal.user?.isBanned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Delete "{deleteModal.user?.name}"?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All user data will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {createAdminModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Admin User</h3>
                <p className="text-sm text-gray-500">Add a new administrator</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createAdminModal.formData.name}
                  onChange={(e) => setCreateAdminModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, name: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={createAdminModal.formData.email}
                  onChange={(e) => setCreateAdminModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, email: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={createAdminModal.formData.password}
                  onChange={(e) => setCreateAdminModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, password: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={createAdminModal.formData.phone}
                  onChange={(e) => setCreateAdminModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setCreateAdminModal({ isOpen: false, formData: { name: '', email: '', password: '', phone: '' } })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
