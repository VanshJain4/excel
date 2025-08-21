require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Railway server...');
console.log('📍 Port:', PORT);

// Basic middleware
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

// Serve static files from gpt directory
app.use('/gpt', express.static(path.join(__dirname, 'gpt')));

// Health check endpoint (MUST be simple and fast)
app.get('/health', (req, res) => {
  console.log('🔧 Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'Server is healthy'
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

// Simple status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK',
    services: ['wopi', 'health'],
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
      message: 'SKOPEO.AI WOPI Server is running',
      status: 'OK',
      endpoints: {
        health: '/health',
        wopi: '/wopi',
        status: '/api/status'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Start server immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Railway server successfully started!`);
  console.log(`🌐 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔧 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📁 WOPI API: http://0.0.0.0:${PORT}/wopi`);
  console.log(`📊 Status: http://0.0.0.0:${PORT}/api/status`);
  console.log(`🤝 Collabora URL: ${process.env.COLLABORA_URL || 'Not configured'}`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
}); 