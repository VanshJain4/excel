# 🚀 Render Environment Variables - Quick Reference

## ✅ Essential Variables (Must Have)

```bash
# Core
NODE_ENV=production
SESSION_SECRET=K8mP9vN2qR5sT8uW1xY4zA7bC0dE3fG6hI9jK2lM5nO8pQ1rS4tU7vW0xY3z
JWT_SECRET=H7kL4mN8oP2qR5sT8uW1xY4zA7bC0dE3fG6hI9jK2lM5nO8pQ1rS4tU7vW

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Firebase (use your existing values)
FIREBASE_API_KEY=AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ
FIREBASE_AUTH_DOMAIN=skopeo-ai.firebaseapp.com
FIREBASE_PROJECT_ID=skopeo-ai
FIREBASE_STORAGE_BUCKET=skopeo-ai.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=295265049654
FIREBASE_APP_ID=1:295265049654:web:486856ccde50928efe8c97
FIREBASE_MEASUREMENT_ID=G-S7Y1FDBM6L
```

## ⚠️ Optional Variables (Nice to Have)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback

# AI Services (for future)
AI_SERVICES_URL=https://your-ai-services.onrender.com
NLP_SERVICES_URL=https://your-nlp-services.onrender.com
AI_SERVICES_API_KEY=your-ai-api-key
NLP_SERVICES_API_KEY=your-nlp-api-key

# Frontend
REACT_APP_WOPI_SERVER_URL=https://your-app.onrender.com
```

## 🔐 Generate Secure Secrets

```bash
# Generate session secret
openssl rand -base64 32

# Generate JWT secret  
openssl rand -base64 32
```

## 📍 Where to Add in Render

1. Go to your Render service dashboard
2. Click **Environment** tab
3. Click **"Add Environment Variable"**
4. Add each variable one by one

## 🧪 Test Your Setup

Visit: `https://your-app.onrender.com/health`

Should show:
```json
{
  "status": "OK",
  "environment": "production",
  "mongodb": "connected"
}
``` 