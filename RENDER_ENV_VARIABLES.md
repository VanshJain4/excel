# 🔧 Environment Variables for Render Deployment

Complete guide for setting up environment variables in your Render deployment.

## 📋 Required Environment Variables

### 🔐 Core Application Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Port for the application | `3000` | ✅ Auto-set by Render |
| `NODE_ENV` | Environment mode | `production` | ✅ |
| `SESSION_SECRET` | Secret for session encryption | `your-super-secret-key-123456789` | ✅ |
| `JWT_SECRET` | Secret for JWT tokens | `your-jwt-secret-key-987654321` | ✅ |

### 🗄️ Database Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` | ✅ |

### 🔑 Authentication (Google OAuth)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc.apps.googleusercontent.com` | ⚠️ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-your-secret-here` | ⚠️ Optional |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `https://your-app.onrender.com/api/auth/google/callback` | ⚠️ Optional |

### 🔥 Firebase Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `FIREBASE_API_KEY` | Firebase API key | `AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ` | ✅ |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `skopeo-ai.firebaseapp.com` | ✅ |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `skopeo-ai` | ✅ |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `skopeo-ai.firebasestorage.app` | ✅ |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `295265049654` | ✅ |
| `FIREBASE_APP_ID` | Firebase app ID | `1:295265049654:web:486856ccde50928efe8c97` | ✅ |
| `FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | `G-S7Y1FDBM6L` | ✅ |

### 🤖 AI Services (Optional - for AI integration)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `AI_SERVICES_URL` | AI services endpoint | `https://your-ai-services.onrender.com` | ⚠️ Optional |
| `NLP_SERVICES_URL` | NLP services endpoint | `https://your-nlp-services.onrender.com` | ⚠️ Optional |
| `AI_SERVICES_API_KEY` | AI services API key | `your-ai-api-key` | ⚠️ Optional |
| `NLP_SERVICES_API_KEY` | NLP services API key | `your-nlp-api-key` | ⚠️ Optional |

### 🌐 Frontend Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REACT_APP_WOPI_SERVER_URL` | WOPI server URL for frontend | `https://your-app.onrender.com` | ⚠️ Optional |

## 🚀 How to Set Environment Variables in Render

### Step 1: Go to Your Render Service
1. Navigate to your Render dashboard
2. Click on your web service
3. Go to **Environment** tab

### Step 2: Add Environment Variables
Click **"Add Environment Variable"** and add each variable:

```bash
# Core Application
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-123456789
JWT_SECRET=your-jwt-secret-key-987654321

# MongoDB (replace with your actual connection string)
MONGODB_URI=mongodb+srv://skopeo-user:your-password@cluster0.xxxxx.mongodb.net/libreoffice-auth?retryWrites=true&w=majority

# Google OAuth (optional - replace with your credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback

# Firebase Configuration (use your existing values)
FIREBASE_API_KEY=AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ
FIREBASE_AUTH_DOMAIN=skopeo-ai.firebaseapp.com
FIREBASE_PROJECT_ID=skopeo-ai
FIREBASE_STORAGE_BUCKET=skopeo-ai.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=295265049654
FIREBASE_APP_ID=1:295265049654:web:486856ccde50928efe8c97
FIREBASE_MEASUREMENT_ID=G-S7Y1FDBM6L

# AI Services (optional - for future AI integration)
AI_SERVICES_URL=https://your-ai-services.onrender.com
NLP_SERVICES_URL=https://your-nlp-services.onrender.com
AI_SERVICES_API_KEY=your-ai-api-key
NLP_SERVICES_API_KEY=your-nlp-api-key

# Frontend Configuration
REACT_APP_WOPI_SERVER_URL=https://your-app.onrender.com
```

## 🔐 Security Best Practices

### Generate Secure Secrets
```bash
# Generate a secure session secret
openssl rand -base64 32

# Generate a secure JWT secret
openssl rand -base64 32
```

### Example Secure Values
```bash
SESSION_SECRET=K8mP9vN2qR5sT8uW1xY4zA7bC0dE3fG6hI9jK2lM5nO8pQ1rS4tU7vW0xY3z
JWT_SECRET=H7kL4mN8oP2qR5sT8uW1xY4zA7bC0dE3fG6hI9jK2lM5nO8pQ1rS4tU7vW
```

## 📝 Step-by-Step Setup

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Add to `MONGODB_URI`

### 2. Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-app.onrender.com/api/auth/google/callback`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### 3. Firebase Setup
1. Use your existing Firebase project
2. Copy the configuration values
3. Add all Firebase environment variables

### 4. AI Services Setup (Optional)
1. Deploy your AI services to Render
2. Get the service URLs
3. Add AI service environment variables

## 🔍 Testing Your Environment Variables

### Check if variables are loaded
```javascript
// Add this to your railway-server.js for debugging
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  AI_SERVICES_URL: process.env.AI_SERVICES_URL || 'Not set'
});
```

### Health Check Endpoint
Visit `https://your-app.onrender.com/health` to see if your app is running correctly.

## 🚨 Common Issues

### 1. MongoDB Connection Failed
- Check if `MONGODB_URI` is correct
- Ensure IP whitelist allows Render IPs (use `0.0.0.0/0` for testing)
- Verify username/password in connection string

### 2. Firebase Not Working
- Ensure all Firebase variables are set
- Check if Firebase project is active
- Verify API keys are correct

### 3. Google OAuth Not Working
- Check redirect URI matches exactly
- Ensure OAuth credentials are for web application
- Verify client ID and secret are correct

### 4. Session Issues
- Generate a new `SESSION_SECRET`
- Ensure `NODE_ENV=production` for secure cookies
- Check if HTTPS is enabled (Render provides this)

## 📞 Support

If you encounter issues:
1. Check Render logs in your service dashboard
2. Verify all environment variables are set correctly
3. Test locally with the same environment variables
4. Check the health endpoint: `/health`

## 🎯 Quick Setup Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate and set `SESSION_SECRET`
- [ ] Generate and set `JWT_SECRET`
- [ ] Set `MONGODB_URI` (MongoDB Atlas connection string)
- [ ] Set all Firebase variables
- [ ] Set Google OAuth variables (optional)
- [ ] Set AI service variables (optional)
- [ ] Test deployment
- [ ] Check health endpoint 