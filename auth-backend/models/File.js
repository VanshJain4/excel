const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    default: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  },
  fileType: {
    type: String,
    enum: ['xlsx', 'xls', 'csv', 'ods'],
    default: 'xlsx'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ userId: 1, filename: 1 });

// Update the updatedAt field on save
fileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for file URL
fileSchema.virtual('fileUrl').get(function() {
  return `/uploads/${this.filePath}`;
});

// Method to get file info for API response
fileSchema.methods.toFileInfo = function() {
  return {
    id: this._id,
    filename: this.filename,
    originalName: this.originalName,
    fileSize: this.fileSize,
    mimeType: this.mimeType,
    fileType: this.fileType,
    isPublic: this.isPublic,
    tags: this.tags,
    description: this.description,
    lastModified: this.lastModified,
    createdAt: this.createdAt,
    fileUrl: this.fileUrl
  };
};

module.exports = mongoose.model('File', fileSchema);
