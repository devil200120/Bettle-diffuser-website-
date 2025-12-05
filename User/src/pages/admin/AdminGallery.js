import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  Search,
  Trash2,
  Plus,
  Image,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '../../components/Toast';

const AdminGallery = () => {
  const { showSuccess, showError } = useToast();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, image: null });
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, image: null });
  const [formData, setFormData] = useState({ title: '', category: '', image: null, preview: null });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
    fetchCategories();
  }, [pagination.page, searchTerm, categoryFilter]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      });
      
      const response = await api.get(`/admin/gallery?${params}`);
      setImages(response.data.data.images);
      setPagination(prev => ({
        ...prev,
        ...response.data.data.pagination
      }));
    } catch (err) {
      showError('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/gallery/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showError('File size should be less than 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result,
          preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = async () => {
    if (!formData.title.trim()) {
      showError('Please enter a title');
      return;
    }
    if (!formData.image) {
      showError('Please select an image');
      return;
    }

    try {
      setSaving(true);
      await api.post('/admin/gallery', {
        title: formData.title,
        category: formData.category || 'Featured',
        image: formData.image
      });
      showSuccess('Image added successfully');
      setAddModal(false);
      setFormData({ title: '', category: '', image: null, preview: null });
      fetchImages();
      fetchCategories();
    } catch (err) {
      showError('Failed to add image');
    } finally {
      setSaving(false);
    }
  };

  const handleEditImage = async () => {
    if (!formData.title.trim()) {
      showError('Please enter a title');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/admin/gallery/${editModal.image._id}`, {
        title: formData.title,
        category: formData.category || 'Featured',
        ...(formData.image && formData.image.startsWith('data:') && { image: formData.image })
      });
      showSuccess('Image updated successfully');
      setEditModal({ isOpen: false, image: null });
      setFormData({ title: '', category: '', image: null, preview: null });
      fetchImages();
      fetchCategories();
    } catch (err) {
      showError('Failed to update image');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (image) => {
    try {
      await api.put(`/admin/gallery/${image._id}`, {
        isActive: !image.isActive
      });
      showSuccess(`Image ${image.isActive ? 'hidden' : 'shown'} successfully`);
      fetchImages();
    } catch (err) {
      showError('Failed to update image status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/gallery/${deleteModal.image._id}`);
      showSuccess('Image deleted successfully');
      setDeleteModal({ isOpen: false, image: null });
      fetchImages();
    } catch (err) {
      showError('Failed to delete image');
    }
  };

  const openEditModal = (image) => {
    setFormData({
      title: image.title,
      category: image.category,
      image: null,
      preview: image.imageUrl
    });
    setEditModal({ isOpen: true, image });
  };

  const openAddModal = () => {
    setFormData({ title: '', category: '', image: null, preview: null });
    setAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="mt-1 text-gray-500">Manage photo gallery images</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Image
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Image className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {images.filter(img => img.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Filter className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center">
            <Image className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">No images found</p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Add First Image
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div 
                  key={image._id} 
                  className={`relative group rounded-xl overflow-hidden aspect-square bg-gray-100 ${!image.isActive ? 'opacity-50' : ''}`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleToggleActive(image)}
                        className={`p-1.5 rounded-lg ${image.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white hover:opacity-80`}
                        title={image.isActive ? 'Hide' : 'Show'}
                      >
                        {image.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(image)}
                        className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, image })}
                        className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium text-sm truncate">{image.title}</h4>
                      <span className="text-orange-400 text-xs">{image.category}</span>
                    </div>
                  </div>
                  
                  {/* Active Badge */}
                  {!image.isActive && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 text-white text-xs rounded">
                      Hidden
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} images
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Image</h3>
              <button
                onClick={() => setAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-orange-500 transition-colors"
                >
                  {formData.preview ? (
                    <img src={formData.preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <div className="py-8">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400 mt-1">Max size: 10MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter image title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Featured, Spiders, Insects"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImage}
                disabled={saving}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Uploading...' : 'Add Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Image</h3>
              <button
                onClick={() => setEditModal({ isOpen: false, image: null })}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-orange-500 transition-colors"
                >
                  {formData.preview ? (
                    <img src={formData.preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <div className="py-8">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Click to upload new image</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter image title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Featured, Spiders, Insects"
                  list="category-suggestions-edit"
                />
                <datalist id="category-suggestions-edit">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setEditModal({ isOpen: false, image: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditImage}
                disabled={saving}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Image</h3>
              <button
                onClick={() => setDeleteModal({ isOpen: false, image: null })}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <img 
                src={deleteModal.image?.imageUrl} 
                alt={deleteModal.image?.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-600">
                Are you sure you want to delete "<strong>{deleteModal.image?.title}</strong>"? This will also remove the image from Cloudinary. This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ isOpen: false, image: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
