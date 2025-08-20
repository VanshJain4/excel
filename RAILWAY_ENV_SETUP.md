# 🚀 Railway Environment Variables Setup

## Required Environment Variables for Railway

Go to your Railway dashboard → **Variables** and add these:

### 🔐 Authentication & Security
```bash
# Session Secret (generate a random string)
SESSION_SECRET=skopeo-session-secret-123456789

# JWT Secret (generate a random string)
JWT_SECRET=skopeo-jwt-secret-987654321

# Environment
NODE_ENV=production
```

### 🗄️ MongoDB Database
```bash
# MongoDB Connection (replace with your Atlas connection string)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/libreoffice-auth?retryWrites=true&w=majority
```

### 🔥 Firebase Configuration (your existing config)
```bash
FIREBASE_API_KEY=AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ
FIREBASE_AUTH_DOMAIN=skopeo-ai.firebaseapp.com
FIREBASE_PROJECT_ID=skopeo-ai
FIREBASE_STORAGE_BUCKET=skopeo-ai.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=295265049654
FIREBASE_APP_ID=1:295265049654:web:486856ccde50928efe8c97
FIREBASE_MEASUREMENT_ID=G-S7Y1FDBM6L
```

### 🔑 Google OAuth (Optional)
```bash
# Google OAuth (add your own credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🎯 How to Set Up MongoDB Atlas

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create free account**
3. **Create new cluster** (M0 Free tier)
4. **Create database user**:
   - Username: `skopeo-user`
   - Password: `your-secure-password`
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

## 🔧 Testing Your Setup

After adding environment variables:

1. **Redeploy your app** in Railway
2. **Check health endpoint**: `https://excel-production-45ef.up.railway.app/health`
3. **Test authentication**: Try to register/login
4. **Test file upload**: Upload a spreadsheet file

## 🚨 Common Issues

### MongoDB Connection Failed
- Check if MONGODB_URI is correct
- Verify username/password in connection string
- Make sure IP whitelist allows Railway IPs (use 0.0.0.0/0 for testing)

### Authentication Not Working
- Verify SESSION_SECRET and JWT_SECRET are set
- Check if NODE_ENV=production
- Ensure CORS origins include your Railway domain

### File Upload Issues
- Check if Firebase credentials are correct
- Verify file size limits
- Check if uploads directory exists

## 📞 Need Help?

- **Railway Logs**: Check deployment logs in Railway dashboard
- **Health Check**: Visit `/health` endpoint to see service status
- **MongoDB Status**: Check if database connection is successful 