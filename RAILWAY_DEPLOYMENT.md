# 🚀 Railway Deployment Guide

Complete guide to deploy your LibreOffice Calc web app to Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be on GitHub
3. **MongoDB Atlas**: Free cloud database (we'll set this up)
4. **Google OAuth**: For authentication (optional)

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin vansh
   ```

2. **Verify these files exist**:
   - ✅ `railway.json`
   - ✅ `Dockerfile`
   - ✅ `railway-server.js`
   - ✅ `package.json`

### Step 2: Set Up MongoDB Atlas

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create a free account**
3. **Create a new cluster** (M0 Free tier)
4. **Create a database user**:
   - Username: `skopeo-user`
   - Password: `your-secure-password`
5. **Get your connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

### Step 3: Deploy to Railway

1. **Go to [Railway Dashboard](https://railway.app/dashboard)**
2. **Click "New Project"**
3. **Choose "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will automatically detect the configuration**

### Step 4: Configure Environment Variables

In your Railway project dashboard, go to **Variables** and add:

```bash
# MongoDB Connection (replace with your Atlas connection string)
MONGODB_URI=mongodb+srv://skopeo-user:your-password@cluster0.xxxxx.mongodb.net/libreoffice-auth?retryWrites=true&w=majority

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-123456789

# JWT Secret (generate a random string)
JWT_SECRET=your-jwt-secret-key-987654321

# Google OAuth (optional - add your credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=production

# Firebase Configuration (your existing config)
FIREBASE_API_KEY=AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ
FIREBASE_AUTH_DOMAIN=skopeo-ai.firebaseapp.com
FIREBASE_PROJECT_ID=skopeo-ai
FIREBASE_STORAGE_BUCKET=skopeo-ai.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=295265049654
FIREBASE_APP_ID=1:295265049654:web:486856ccde50928efe8c97
FIREBASE_MEASUREMENT_ID=G-S7Y1FDBM6L
```

### Step 5: Deploy and Test

1. **Railway will automatically build and deploy**
2. **Wait for deployment to complete** (usually 2-5 minutes)
3. **Click on your deployment URL** to test
4. **Check the logs** if there are any issues

## 🔧 Troubleshooting

### Common Issues

1. **Build fails**:
   - Check Railway logs
   - Ensure all dependencies are in package.json
   - Verify Dockerfile syntax

2. **MongoDB connection fails**:
   - Verify MONGODB_URI is correct
   - Check if IP whitelist is needed (use 0.0.0.0/0 for testing)

3. **Port issues**:
   - Railway automatically sets PORT environment variable
   - Don't hardcode port numbers

4. **CORS errors**:
   - Update CORS_ORIGIN to your Railway domain
   - Add your domain to allowed origins

### Debug Commands

```bash
# Check Railway logs
railway logs

# Check deployment status
railway status

# Redeploy
railway up
```

## 🌐 Custom Domain (Optional)

1. **In Railway dashboard**, go to **Settings**
2. **Click "Custom Domains"**
3. **Add your domain** (e.g., `excel.yourdomain.com`)
4. **Update DNS records** as instructed

## 📊 Monitoring

Railway provides:
- **Real-time logs**
- **Performance metrics**
- **Error tracking**
- **Automatic restarts**

## 🔒 Security Checklist

- [ ] Change default secrets
- [ ] Use HTTPS (Railway provides this)
- [ ] Set up proper CORS
- [ ] Configure MongoDB security
- [ ] Add rate limiting (optional)

## 🚀 Production Optimizations

1. **Enable caching**:
   ```javascript
   // Add to railway-server.js
   app.use(express.static('build', { maxAge: '1d' }));
   ```

2. **Add compression**:
   ```bash
   npm install compression
   ```

3. **Set up monitoring**:
   - Railway provides basic monitoring
   - Consider adding Sentry for error tracking

## 📱 Your App URLs

After deployment, you'll have:
- **Main App**: `https://your-app-name.railway.app`
- **Health Check**: `https://your-app-name.railway.app/health`
- **API**: `https://your-app-name.railway.app/api`

## 🎉 Success!

Your LibreOffice Calc web app is now live on Railway! 🚀

**Next Steps**:
1. Test all features
2. Set up Google OAuth (optional)
3. Add custom domain
4. Monitor performance
5. Set up backups

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com) 