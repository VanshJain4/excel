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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://localhost:3000', 
    'http://localhost:3002',
    'https://*.railway.app',
    'https://*.up.railway.app'
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
const buildPath = path.join(__dirname, 'auth-interface/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
} else {
  console.log('⚠️  React build directory not found. Make sure to run "npm run build" before starting the server.');
}

// Serve static files from gpt directory
app.use('/gpt', express.static(path.join(__dirname, 'gpt')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
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

// Check Collabora health
app.get('/wopi/collabora-health', async (req, res) => {
  try {
    const collaboraUrl = process.env.COLLABORA_URL;
    if (!collaboraUrl) {
      return res.status(503).json({ error: 'Collabora URL not configured' });
    }
    
    const response = await axios.get(`${collaboraUrl}/hosting/discovery`, { timeout: 5000 });
    res.json({ status: 'OK', collabora: 'connected', discovery: response.data });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      collabora: 'disconnected', 
      error: error.message 
    });
  }
});

// API routes
const authRoutes = require('./auth-backend/routes/auth');
const fileRoutes = require('./auth-backend/routes/files');
const userRoutes = require('./auth-backend/routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

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
            params: {
                key: firebaseConfig.apiKey
            }
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
        const buffer = Buffer.from(base64, 'base64');
        return buffer;
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
    
    if (fileId === 'empty') {
      const emptyExcelPath = path.join(__dirname, 'gpt', 'sample-spreadsheet.xlsx');
      if (fs.existsSync(emptyExcelPath)) {
        res.sendFile(emptyExcelPath);
      } else {
        res.status(404).json({ error: "Empty file template not found" });
      }
      return;
    }
    
    // Check if we have updated content from WOPI save
    if (global.tempFileStorage && global.tempFileStorage.has(fileId)) {
      const tempData = global.tempFileStorage.get(fileId);
      console.log(`Serving updated content from WOPI save: ${fileId}, size: ${tempData.size} bytes`);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Length', tempData.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(tempData.content);
      return;
    }
    
    // Fetch actual file from Firebase
    const fileData = await fetchFileFromFirebase(fileId);
    
    if (!fileData || !fileData.fileContent) {
      const sampleExcelPath = path.join(__dirname, 'gpt', 'sample-spreadsheet.xlsx');
      if (fs.existsSync(sampleExcelPath)) {
        res.sendFile(sampleExcelPath);
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
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
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
    
    console.log(`WOPI: Saving file ${fileId}, content length: ${fileContent.length} bytes`);
    
    if (!global.tempFileStorage) {
      global.tempFileStorage = new Map();
    }
    
    global.tempFileStorage.set(fileId, {
      content: fileContent,
      timestamp: Date.now(),
      size: fileContent.length
    });
    
    console.log(`WOPI: Stored updated content for ${fileId}, size: ${fileContent.length} bytes`);
    
    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// AI Integration Routes
const AI_SERVICES_URL = process.env.AI_SERVICES_URL || 'http://localhost:4000';
const NLP_SERVICES_URL = process.env.NLP_SERVICES_URL || 'http://localhost:5000';

// AI Copilot endpoint
app.post('/ai/copilot/analyze', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICES_URL}/copilot/analyze`, req.body, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('AI Copilot error:', error.message);
    res.status(500).json({ 
      error: 'AI service unavailable', 
      message: 'AI Copilot service is not available' 
    });
  }
});

// NLP Processing endpoint
app.post('/ai/nlp/process', async (req, res) => {
  try {
    const response = await axios.post(`${NLP_SERVICES_URL}/nlp/process`, req.body, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('NLP service error:', error.message);
    res.status(500).json({ 
      error: 'NLP service unavailable', 
      message: 'NLP service is not available' 
    });
  }
});

// Combined AI Chat endpoint
app.post('/ai/chat', async (req, res) => {
  try {
    const { message, spreadsheetData, context } = req.body;
    
    // First try NLP processing
    let nlpResult = null;
    try {
      const nlpResponse = await axios.post(`${NLP_SERVICES_URL}/nlp/process`, {
        text: message,
        context: context
      }, { timeout: 15000 });
      nlpResult = nlpResponse.data;
    } catch (nlpError) {
      console.warn('NLP service unavailable:', nlpError.message);
    }
    
    // Then try AI Copilot analysis
    let aiResult = null;
    try {
      const aiResponse = await axios.post(`${AI_SERVICES_URL}/copilot/analyze`, {
        query: message,
        spreadsheetData: spreadsheetData,
        nlpContext: nlpResult
      }, { timeout: 15000 });
      aiResult = aiResponse.data;
    } catch (aiError) {
      console.warn('AI Copilot service unavailable:', aiError.message);
    }
    
    // Return combined response
    res.json({
      success: true,
      response: aiResult?.response || nlpResult?.response || "AI services are currently unavailable. Please try again later.",
      suggestions: aiResult?.suggestions || [],
      actions: aiResult?.actions || [],
      nlpAnalysis: nlpResult,
      aiAnalysis: aiResult
    });
    
  } catch (error) {
    console.error('Combined AI chat error:', error.message);
    res.status(500).json({ 
      error: 'AI services unavailable', 
      response: "I'm sorry, but the AI services are currently unavailable. Please try again later."
    });
  }
});

app.use('/wopi', wopiRouter);

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
            params: {
                key: firebaseConfig.apiKey
            }
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
        const buffer = Buffer.from(base64, 'base64');
        return buffer;
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
    
    if (fileId === 'empty') {
      const emptyExcelPath = path.join(__dirname, 'gpt', 'sample-spreadsheet.xlsx');
      if (fs.existsSync(emptyExcelPath)) {
        res.sendFile(emptyExcelPath);
      } else {
        res.status(404).json({ error: "Empty file template not found" });
      }
      return;
    }
    
    // Check if we have updated content from WOPI save
    if (global.tempFileStorage && global.tempFileStorage.has(fileId)) {
      const tempData = global.tempFileStorage.get(fileId);
      console.log(`Serving updated content from WOPI save: ${fileId}, size: ${tempData.size} bytes`);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Length', tempData.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.send(tempData.content);
      return;
    }
    
    // Fetch actual file from Firebase
    const fileData = await fetchFileFromFirebase(fileId);
    
    if (!fileData || !fileData.fileContent) {
      const sampleExcelPath = path.join(__dirname, 'gpt', 'sample-spreadsheet.xlsx');
      if (fs.existsSync(sampleExcelPath)) {
        res.sendFile(sampleExcelPath);
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
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
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
    
    console.log(`WOPI: Saving file ${fileId}, content length: ${fileContent.length} bytes`);
    
    if (!global.tempFileStorage) {
      global.tempFileStorage = new Map();
    }
    
    global.tempFileStorage.set(fileId, {
      content: fileContent,
      timestamp: Date.now(),
      size: fileContent.length
    });
    
    console.log(`WOPI: Stored updated content for ${fileId}, size: ${fileContent.length} bytes`);
    
    res.sendStatus(200);
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use('/wopi', wopiRouter);

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'auth-interface/build', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'SKOPEO.AI API is running',
      note: 'React frontend not built. Run "npm run build" to build the frontend.',
      endpoints: {
        health: '/health',
        api: '/api',
        wopi: '/wopi',
        ai: '/ai'
      }
    });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/libreoffice-auth')
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  app.listen(PORT, () => {
    console.log(`🚀 Railway server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`📁 WOPI API: http://localhost:${PORT}/wopi`);
    console.log(`🤖 AI API: http://localhost:${PORT}/ai`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`🤝 Collabora URL: ${process.env.COLLABORA_URL || 'Not configured'}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  app.listen(PORT, () => {
    console.log(`🚀 Railway server running on port ${PORT} (MongoDB failed)`);
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