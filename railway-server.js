const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'auth-interface/build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API routes - proxy to auth backend
app.use('/api/auth', require('./auth-backend/routes/auth'));
app.use('/api/files', require('./auth-backend/routes/files'));
app.use('/api/users', require('./auth-backend/routes/users'));

// WOPI routes - proxy to WOPI server
app.use('/wopi', require('./gpt/server'));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth-interface/build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Railway server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📁 WOPI API: http://localhost:${PORT}/wopi`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
}); 