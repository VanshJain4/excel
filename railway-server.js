require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://localhost:3000', 
    'http://localhost:3002',
    'https://excel-production-45ef.up.railway.app',
    'https://*.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Import passport config
require('./auth-backend/config/passport');

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'auth-interface/build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    services: {
      auth: 'running',
      wopi: 'running',
      frontend: 'running'
    }
  });
});

// API routes - import and use auth backend routes
const authRoutes = require('./auth-backend/routes/auth');
const fileRoutes = require('./auth-backend/routes/files');
const userRoutes = require('./auth-backend/routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

// WOPI routes - create a simple WOPI server
const wopiRouter = express.Router();

// WOPI endpoint: return file info
wopiRouter.get('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    if (fileId === 'empty') {
      // Return info for empty file
      res.json({
        BaseFileName: "empty.xlsx",
        Size: 0,
        Version: "1.0",
        OwnerId: "anonymous",
        UserId: "anonymous",
        UserCanWrite: true,
        UserCanNotWriteRelative: false,
        UserCanRename: false,
        UserCanShare: false,
        UserCanPresent: false,
        PostMessageOrigin: "*",
        HidePrintOption: false,
        HideSaveOption: false,
        HideExportOption: false,
        DisablePrint: false,
        DisableExport: false,
        DisableCopy: false,
        DisableInactiveMessages: false,
        DownloadUrl: `${req.protocol}://${req.get('host')}/wopi/files/${fileId}/contents`,
        FileUrl: `${req.protocol}://${req.get('host')}/wopi/files/${fileId}/contents`
      });
    } else {
      // Return info for existing file
      res.json({
        BaseFileName: "sample.xlsx",
        Size: 1024,
        Version: "1.0",
        OwnerId: "user",
        UserId: "user",
        UserCanWrite: true,
        UserCanNotWriteRelative: false,
        UserCanRename: false,
        UserCanShare: false,
        UserCanPresent: false,
        PostMessageOrigin: "*",
        HidePrintOption: false,
        HideSaveOption: false,
        HideExportOption: false,
        DisablePrint: false,
        DisableExport: false,
        DisableCopy: false,
        DisableInactiveMessages: false,
        DownloadUrl: `${req.protocol}://${req.get('host')}/wopi/files/${fileId}/contents`,
        FileUrl: `${req.protocol}://${req.get('host')}/wopi/files/${fileId}/contents`
      });
    }
  } catch (error) {
    console.error('WOPI error:', error);
    res.status(500).json({ error: 'WOPI server error' });
  }
});

// WOPI endpoint: get file contents
wopiRouter.get('/files/:id/contents', (req, res) => {
  // Return empty Excel file or sample file
  const filePath = path.join(__dirname, 'gpt', 'sample-spreadsheet.xlsx');
  res.sendFile(filePath, (err) => {
    if (err) {
      // If file doesn't exist, return empty response
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// WOPI endpoint: put file contents
wopiRouter.put('/files/:id/contents', (req, res) => {
  // Handle file save
  console.log('Saving file:', req.params.id);
  res.status(200).json({ status: 'saved' });
});

app.use('/wopi', wopiRouter);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth-interface/build', 'index.html'));
});

// Connect to MongoDB first, then start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/libreoffice-auth')
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Railway server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`📁 WOPI API: http://localhost:${PORT}/wopi`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  // Still start the server even if MongoDB fails
  app.listen(PORT, () => {
    console.log(`🚀 Railway server running on port ${PORT} (MongoDB failed)`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
}); 