import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminAssemblyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sortOrder: 0,
    isActive: true
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/assembly-videos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setVideos(data.data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      showError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10GB = 10737418240 bytes)
      if (file.size > 10737418240) {
        showError('File size must be less than 10GB');
        e.target.value = '';
        return;
      }
      
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/x-ms-wmv', 'video/x-flv', 'video/webm'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv|wmv|flv|webm)$/i)) {
        showError('Invalid video format. Supported: mp4, avi, mov, mkv, wmv, flv, webm');
        e.target.value = '';
        return;
      }
      
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingVideo && !videoFile) {
      showError('Please select a video file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem('adminToken');
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('sortOrder', formData.sortOrder);
      submitData.append('isActive', formData.isActive);
      
      if (videoFile) {
        submitData.append('video', videoFile);
      }

      const url = editingVideo 
        ? `${API_URL}/admin/assembly-videos/${editingVideo._id}`
        : `${API_URL}/admin/assembly-videos`;
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentCompleted = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      const response = await new Promise((resolve, reject) => {
        xhr.open(editingVideo ? 'PUT' : 'POST', url);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.onload = () => {
          try {
            const data = JSON.parse(xhr.response);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data);
            } else {
              reject({ response: { data } });
            }
          } catch (e) {
            // If response is not JSON, return raw response
            reject({ 
              response: { 
                data: { 
                  message: `Server error: ${xhr.statusText || 'Unknown error'}. Status: ${xhr.status}` 
                } 
              } 
            });
          }
        };
        
        xhr.onerror = () => reject({ response: { data: { message: 'Network error. Check if server is running.' } } });
        xhr.send(submitData);
      });
      
      showSuccess(editingVideo ? 'Video updated successfully' : 'Video uploaded successfully');

      fetchVideos();
      closeModal();
    } catch (error) {
      console.error('Error saving video:', error);
      showError(error.response?.data?.message || 'Failed to save video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      sortOrder: video.sortOrder || 0,
      isActive: video.isActive
    });
    setVideoFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/assembly-videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      showSuccess('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      showError('Failed to delete video');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/assembly-videos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!response.ok) throw new Error('Failed to update');
      showSuccess(`Video ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchVideos();
    } catch (error) {
      console.error('Error toggling video status:', error);
      showError('Failed to update video status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      sortOrder: 0,
      isActive: true
    });
    setVideoFile(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Assembly Videos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Add New Video
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No assembly videos found. Add your first video to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{video.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      video.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {video.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{video.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">File Size:</span>
                      <p>{formatFileSize(video.fileSize)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p>{formatDuration(video.duration)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Sort Order:</span>
                      <p>{video.sortOrder}</p>
                    </div>
                    <div>
                      <span className="font-medium">Uploaded:</span>
                      <p>{new Date(video.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(video)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(video._id, video.isActive)}
                    className={`${
                      video.isActive ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'
                    } text-white px-4 py-2 rounded transition-colors`}
                  >
                    {video.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {video.videoPath && (
                <div className="mt-4">
                  <video
                    controls
                    className="w-full max-w-2xl rounded-lg"
                    src={`${API_URL}${video.videoPath}`}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter video description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video File {!editingVideo && '*'}
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/avi,video/quicktime,video/x-matroska,video/x-ms-wmv,video/x-flv,video/webm"
                    onChange={handleFileChange}
                    required={!editingVideo}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supported formats: mp4, avi, mov, mkv, wmv, flv, webm (Max: 10GB)
                  </p>
                  {editingVideo && (
                    <p className="text-sm text-blue-500 mt-1">Leave empty to keep current video</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Active (Show on website)
                  </label>
                </div>

                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                    <p className="text-center text-sm text-gray-600 mt-2">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={uploading}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : editingVideo ? 'Update Video' : 'Upload Video'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssemblyVideos;
