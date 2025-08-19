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

    // Wait for WOPI server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ WOPI server started successfully');
  } catch (error) {
    console.error('Error starting WOPI server:', error);
  }
}

// Start WOPI server
startWopiServer();

// Proxy WOPI requests to WOPI server
app.use('/wopi', async (req, res) => {
  if (!wopiServer) {
    return res.status(503).json({ 
      error: 'WOPI service not available',
      message: 'File editing service not running'
    });
  }
  
  try {
    const axios = require('axios');
    const url = `http://localhost:3002${req.originalUrl}`;
    
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: req.headers,
      responseType: req.originalUrl.includes('/contents') ? 'arraybuffer' : 'json',
      timeout: 30000
    });
    
    // Forward response
    res.status(response.status);
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    res.send(response.data);
  } catch (error) {
    console.error('WOPI proxy error:', error.message);
    res.status(error.response?.status || 500).json({
      error: 'WOPI service error',
      message: error.message
    });
  }
});

// Serve static files from React build
app.use(express.static(path.resolve('auth-interface/build')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    port: PORT, 
    timestamp: new Date().toISOString(),
    message: 'Railway app is running',
    wopiServer: wopiServer && !wopiServer.killed ? 'running' : 'starting'
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve('auth-interface/build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server running on port', PORT);
  console.log('🔗 Health check: http://localhost:' + PORT + '/health');
  console.log('📁 WOPI server: Starting...');
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
