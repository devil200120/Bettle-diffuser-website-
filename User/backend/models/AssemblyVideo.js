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
  videoPath: {
    type: String,
    required: true
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
