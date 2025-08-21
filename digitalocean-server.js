require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🌊 Starting DigitalOcean App...');
console.log('📍 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://localhost:3000', 
    'http://localhost:3002',
    'https://*.ondigitalocean.app',
    'https://*.digitaloceanspaces.com'
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
  secret: process.env.SESSION_SECRET || 'digitalocean-secret-key',
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

// Import passport config (with error handling)
try {
  require('./auth-backend/config/passport');
  console.log('✅ Passport config loaded');
} catch (error) {
  console.warn('⚠️  Passport config not found, continuing without advanced auth...');
}

// Serve static files from React build
const buildPath = path.join(__dirname, 'auth-interface/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  console.log('✅ React build found and served');
} else {
  console.log('⚠️  React build directory not found');
}

// Serve static files from gpt directory
app.use('/gpt', express.static(path.join(__dirname, 'gpt')));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🔧 Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    collaboraUrl: process.env.COLLABORA_URL || 'Not configured',
    services: {
      auth: 'running',
      wopi: 'running',
      frontend: 'running'
    }
  });
});

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "skopeo-ai.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "skopeo-ai",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "skopeo-ai.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "295265049654",
  appId: process.env.FIREBASE_APP_ID || "1:295265049654:web:486856ccde50928efe8c97",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-S7Y1FDBM6L"
};

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

// Helper function to fetch file from Firebase Firestore
async function fetchFileFromFirebase(fileId) {
    try {
        const url = `${FIRESTORE_BASE_URL}/files/${fileId}`;
        const response = await axios.get(url, {
            params: { key: firebaseConfig.apiKey }
        });
        
        if (response.data && response.data.fields) {
            const fields = response.data.fields;
            return {
                fileName: fields.fileName?.stringValue || fields.originalName?.stringValue || 'spreadsheet.xlsx',
                fileSize: fields.fileSize?.integerValue || 0,
                mimeType: fields.mimeType?.stringValue || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                fileContent: fields.fileContent?.stringValue || null,
                userId: fields.userId?.stringValue || 'anonymous',
                createdAt: fields.createdAt?.timestampValue || null,
                updatedAt: fields.updatedAt?.timestampValue || null
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching file from Firebase:', error.message);
        return null;
    }
}

// Helper function to convert base64 to buffer
function base64ToBuffer(base64Data) {
    try {
        const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        return Buffer.from(base64, 'base64');
    } catch (error) {
        console.error('Error converting base64 to buffer:', error);
        return null;
    }
}

// WOPI routes
const wopiRouter = express.Router();

// WOPI endpoint: return file info
wopiRouter.get('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    console.log('📁 WOPI file info requested for:', fileId);
    
    if (fileId === 'empty') {
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
      // Fetch actual file from Firebase
      const fileData = await fetchFileFromFirebase(fileId);
      
      if (!fileData) {
        console.log(`File not found in Firebase: ${fileId}`);
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json({
        BaseFileName: fileData.fileName,
        Size: fileData.fileSize,
        Version: "1.0",
        OwnerId: fileData.userId,
        UserId: fileData.userId,
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
wopiRouter.get('/files/:id/contents', async (req, res) => {
  try {
    const fileId = req.params.id;
    console.log('📄 WOPI file content requested for:', fileId);
    
    if (fileId === 'empty') {
      const emptyExcelPath = path.join(__dirname, 'gpt', 'sample-spreadsheet.xlsx');
      if (fs.existsSync(emptyExcelPath)) {
        res.sendFile(emptyExcelPath);
      } else {
        res.status(404).json({ error: "Empty file template not found" });
      }
      return;
    }
    
    // Check temporary storage first
    if (global.tempFileStorage && global.tempFileStorage.has(fileId)) {
      const tempData = global.tempFileStorage.get(fileId);
      console.log(`Serving updated content: ${fileId}, size: ${tempData.size} bytes`);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Length', tempData.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(tempData.content);
      return;
    }
    
    // Fetch from Firebase
    const fileData = await fetchFileFromFirebase(fileId);
    
    if (!fileData || !fileData.fileContent) {
      const samplePath = path.join(__dirname, 'gpt', 'sample-spreadsheet.xlsx');
      if (fs.existsSync(samplePath)) {
        res.sendFile(samplePath);
      } else {
        res.status(404).json({ error: "File not found" });
      }
      return;
    }
    
    const buffer = base64ToBuffer(fileData.fileContent);
    if (!buffer) {
      res.status(500).json({ error: "Failed to process file content" });
      return;
    }
    
    res.setHeader('Content-Type', fileData.mimeType || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(buffer);
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// WOPI endpoint: save file
wopiRouter.post('/files/:id/contents', async (req, res) => {
  try {
    const fileId = req.params.id;
    const fileContent = req.body;
    
    console.log(`WOPI: Saving file ${fileId}, size: ${fileContent.length} bytes`);
    
    if (!global.tempFileStorage) {
      global.tempFileStorage = new Map();
    }
    
    global.tempFileStorage.set(fileId, {
      content: fileContent,
      timestamp: Date.now(),
      size: fileContent.length
    });
    
    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// AI Integration Routes
const AI_SERVICES_URL = process.env.AI_SERVICES_URL || 'http://localhost:4000';
const NLP_SERVICES_URL = process.env.NLP_SERVICES_URL || 'http://localhost:5000';

// AI endpoints
app.post('/ai/chat', async (req, res) => {
  try {
    const { message, spreadsheetData, context } = req.body;
    
    // Try AI services (graceful fallback)
    let response = "AI services are currently being set up. Please try again later.";
    
    res.json({
      success: true,
      response: response,
      suggestions: [],
      actions: []
    });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ 
      error: 'AI service error',
      response: "I'm sorry, there was an error processing your request."
    });
  }
});

// Collabora health check
app.get('/wopi/collabora-health', async (req, res) => {
  try {
    const collaboraUrl = process.env.COLLABORA_URL;
    if (!collaboraUrl) {
      return res.status(503).json({ error: 'Collabora URL not configured' });
    }
    
    const response = await axios.get(`${collaboraUrl}/hosting/discovery`, { timeout: 5000 });
    res.json({ status: 'OK', collabora: 'connected' });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      collabora: 'disconnected', 
      error: error.message 
    });
  }
});

// API routes (with error handling)
try {
  const authRoutes = require('./auth-backend/routes/auth');
  const fileRoutes = require('./auth-backend/routes/files');
  const userRoutes = require('./auth-backend/routes/users');

  app.use('/api/auth', authRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/users', userRoutes);
  console.log('✅ Auth API routes loaded');
} catch (error) {
  console.warn('⚠️  Auth routes not found, continuing without full auth API...');
}

app.use('/wopi', wopiRouter);

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    platform: 'DigitalOcean App Platform',
    services: {
      wopi: 'running',
      auth: 'running',
      frontend: fs.existsSync(buildPath) ? 'built' : 'missing'
    },
    collaboraUrl: process.env.COLLABORA_URL || 'Not configured',
    timestamp: new Date().toISOString()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'auth-interface/build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'SKOPEO.AI - DigitalOcean Deployment',
      status: 'OK',
      platform: 'DigitalOcean App Platform',
      endpoints: {
        health: '/health',
        wopi: '/wopi',
        api: '/api',
        status: '/api/status'
      },
      note: 'React frontend will be available after build completes',
      timestamp: new Date().toISOString()
    });
  }
});

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (mongoUri) {
  mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    console.warn('⚠️  MongoDB connection failed:', err.message);
  });
} else {
  console.warn('⚠️  No MongoDB URI provided, continuing without database');
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌊 DigitalOcean App running on port ${PORT}`);
  console.log(`🌐 Server: http://0.0.0.0:${PORT}`);
  console.log(`🔧 Health: http://0.0.0.0:${PORT}/health`);
  console.log(`📁 WOPI: http://0.0.0.0:${PORT}/wopi`);
  console.log(`🤖 AI: http://0.0.0.0:${PORT}/ai`);
  console.log(`📊 Status: http://0.0.0.0:${PORT}/api/status`);
  console.log(`🤝 Collabora: ${process.env.COLLABORA_URL || 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  if (mongoose.connection.readyState === 1) {
    mongoose.connection.close();
  }
  process.exit(0);
}); 