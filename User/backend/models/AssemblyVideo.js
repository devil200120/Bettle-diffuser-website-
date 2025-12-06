const mongoose = require('mongoose');

const assemblyVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  videoType: {
    type: String,
    enum: ['file', 'youtube'],
    default: 'file'
  },
  videoPath: {
    type: String,
    required: function() {
      return this.videoType === 'file';
    }
  },
  youtubeId: {
    type: String,
    required: function() {
      return this.videoType === 'youtube';
    },
    trim: true
  },
  duration: {
    type: Number // Duration in seconds
  },
  fileSize: {
    type: Number // File size in bytes
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AssemblyVideo', assemblyVideoSchema);
