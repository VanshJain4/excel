const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const User = require('../models/User');

const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;
    const userDir = path.join(__dirname, '../uploads', userId.toString());
    
    // Create user directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only spreadsheet files
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'text/plain', // .csv (alternative MIME type)
    'application/csv', // .csv (alternative MIME type)
    'application/vnd.oasis.opendocument.spreadsheet' // .ods
  ];
  
  // Also check file extension as fallback
  const allowedExtensions = ['.xlsx', '.xls', '.csv', '.ods'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}. Received: ${file.mimetype} (${fileExtension})`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// WOPI endpoint: return file info (no authentication required)
router.get('/wopi/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      BaseFileName: file.originalName,
      Size: file.fileSize,
      OwnerId: file.userId.toString(),
      Version: "1",
      SupportsUpdate: true,
      UserCanWrite: true
    });
  } catch (error) {
    console.error('Error fetching file info for WOPI:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WOPI endpoint: return file content (no authentication required)
router.get('/wopi/:fileId/contents', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../uploads', file.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Error fetching file content for WOPI:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all files for current user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select('-filePath'); // Don't send file path for security

    res.json({
      success: true,
      files: files.map(file => file.toFileInfo())
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Upload a new file
router.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { filename, originalname, path: filePath, size } = req.file;
    const { description, tags } = req.body;

    // Determine file type from extension
    const ext = path.extname(originalname).toLowerCase();
    let fileType = 'xlsx';
    if (ext === '.xls') fileType = 'xls';
    else if (ext === '.csv') fileType = 'csv';
    else if (ext === '.ods') fileType = 'ods';

    // Create file record
    const file = new File({
      userId: req.user.id,
      filename: filename,
      originalName: originalname,
      filePath: path.relative(path.join(__dirname, '../uploads'), filePath),
      fileSize: size,
      mimeType: req.file.mimetype,
      fileType: fileType,
      description: description || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await file.save();

    res.json({
      success: true,
      file: file.toFileInfo(),
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get a specific file
router.get('/:fileId', isAuthenticated, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      success: true,
      file: file.toFileInfo()
    });

  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// Download a file
router.get('/:fileId/download', isAuthenticated, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../uploads', file.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, file.originalName);

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Update file metadata
router.put('/:fileId', isAuthenticated, async (req, res) => {
  try {
    const { filename, description, tags, isPublic } = req.body;

    const file = await File.findOneAndUpdate(
      {
        _id: req.params.fileId,
        userId: req.user.id
      },
      {
        filename: filename,
        description: description,
        tags: tags,
        isPublic: isPublic,
        lastModified: Date.now()
      },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      success: true,
      file: file.toFileInfo(),
      message: 'File updated successfully'
    });

  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Delete a file
router.delete('/:fileId', isAuthenticated, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      userId: req.user.id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', file.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete file record from database
    await File.findByIdAndDelete(req.params.fileId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  next(error);
});

module.exports = router;
