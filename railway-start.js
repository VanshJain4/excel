const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Railway deployment...');
console.log('📁 Serving from:', path.resolve('auth-interface/build'));
console.log('🌐 Port:', PORT);

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Express server is working!', 
    timestamp: new Date().toISOString(),
    port: PORT,
    envPort: process.env.PORT,
    host: '0.0.0.0'
  });
});

// Start WOPI server in background
let wopiServer = null;

async function startWopiServer() {
  console.log('📁 Starting WOPI server...');
  try {
    wopiServer = spawn('node', ['gpt/server.js'], {
      env: {
        ...process.env,
        PORT: '3002',
        WOPI_PORT: '3002'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    wopiServer.on('error', (err) => {
      console.error('WOPI server error:', err);
    });

    wopiServer.on('exit', (code) => {
      console.error('WOPI server exited with code:', code);
    });

    // Wait for WOPI server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ WOPI server started successfully');
  } catch (error) {
    console.error('Error starting WOPI server:', error);
    throw error;
  }
}

// Start WOPI server (non-blocking) - DISABLED FOR TESTING
console.log('⚠️ WOPI server startup disabled for testing');
// setTimeout(() => {
//   startWopiServer().catch(error => {
//     console.error('Failed to start WOPI server:', error);
//     // Don't crash the app if WOPI server fails
//   });
// }, 1000); // Start WOPI server after main server is running

// Proxy WOPI requests to WOPI server - DISABLED FOR TESTING
app.use('/wopi', async (req, res) => {
  console.log('WOPI request:', req.method, req.originalUrl);
  
    // WOPI server disabled for testing
  return res.status(503).json({ 
    error: 'WOPI service not available',
    message: 'WOPI server disabled for testing'
  });
});

// Serve static files from React build
app.use(express.static(path.resolve('auth-interface/build')));

// Health check for Railway
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ 
    status: 'OK', 
    port: PORT, 
    timestamp: new Date().toISOString(),
    message: 'Railway app is running',
    wopiServer: wopiServer && !wopiServer.killed ? 'running' : 'starting',
    uptime: process.uptime()
  });
});

// Root health check (Railway default) - Respond immediately
app.get('/', (req, res) => {
  console.log('Root request received');
  
  // Always respond immediately, don't check files
  res.status(200).json({ 
    status: 'OK', 
    message: 'Express server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime()
  });
});

// Debug endpoint to check if React build exists
app.get('/debug', (req, res) => {
  const fs = require('fs');
  const buildPath = path.resolve('auth-interface/build');
  const indexPath = path.resolve('auth-interface/build/index.html');
  
  res.json({
    buildPath,
    indexPath,
    buildExists: fs.existsSync(buildPath),
    indexExists: fs.existsSync(indexPath),
    buildContents: fs.existsSync(buildPath) ? fs.readdirSync(buildPath) : 'N/A'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.resolve('auth-interface/build/index.html');
  console.log('Serving React app from:', indexPath);
  
  if (!require('fs').existsSync(indexPath)) {
    console.error('React build not found at:', indexPath);
    return res.status(404).json({ error: 'React build not found' });
  }
  
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server running on port', PORT);
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('📁 WOPI server: Starting...');
  console.log('🌐 App URL: http://0.0.0.0:' + PORT);
  console.log('🔧 Environment PORT:', process.env.PORT);
  
  // Add a small delay to ensure app is fully ready
  setTimeout(() => {
    console.log('🚀 App is fully ready for requests!');
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  if (wopiServer) {
    wopiServer.kill();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  if (wopiServer) {
    wopiServer.kill();
  }
  process.exit(0);
});
