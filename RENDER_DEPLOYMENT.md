# 🚀 Render Deployment Guide

Complete guide to deploy your SKOPEO.AI LibreOffice Calc web app to Render.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be on GitHub
3. **MongoDB Atlas**: Free cloud database (we'll set this up)
4. **Google OAuth**: For authentication (optional)

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Verify these files exist**:
   - ✅ `railway.json` (Render will use this)
   - ✅ `package.json` (with correct start script)
   - ✅ `railway-server.js` (production server)
   - ✅ `Dockerfile` (for containerization)

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

### Step 3: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `skopeo-ai` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (for testing)

### Step 4: Configure Environment Variables

In your Render service dashboard, go to **Environment** and add:

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

# AI Services (if you have them)
AI_SERVICES_URL=https://your-ai-services.onrender.com
NLP_SERVICES_URL=https://your-nlp-services.onrender.com
AI_SERVICES_API_KEY=your-ai-api-key
NLP_SERVICES_API_KEY=your-nlp-api-key
```

### Step 5: Deploy and Test

1. **Click "Create Web Service"**
2. **Wait for deployment to complete** (usually 5-10 minutes)
3. **Click on your deployment URL** to test
4. **Check the logs** if there are any issues

## 🔧 Troubleshooting

### Common Issues

1. **Build fails**:
   - Check Render logs
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **MongoDB connection fails**:
   - Verify MONGODB_URI is correct
   - Check if IP whitelist is needed (use 0.0.0.0/0 for testing)

3. **Port issues**:
   - Render automatically sets PORT environment variable
   - Don't hardcode port numbers

4. **CORS errors**:
   - Update CORS_ORIGIN to your Render domain
   - Add your domain to allowed origins

### Debug Commands

```bash
# Check Render logs
# Go to your service dashboard → Logs

# Check deployment status
# Go to your service dashboard → Events
```

## 🌐 Custom Domain (Optional)

1. **In Render dashboard**, go to your service
2. **Click "Settings"**
3. **Click "Custom Domains"**
4. **Add your domain** (e.g., `excel.yourdomain.com`)
5. **Update DNS records** as instructed

## 📊 Monitoring

Render provides:
- **Real-time logs**
- **Performance metrics**
- **Error tracking**
- **Automatic restarts**

## 🔒 Security Checklist

- [ ] Change default secrets
- [ ] Use HTTPS (Render provides this)
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
   - Render provides basic monitoring
   - Consider adding Sentry for error tracking

## 📱 Your App URLs

After deployment, you'll have:
- **Main App**: `https://your-app-name.onrender.com`
- **Health Check**: `https://your-app-name.onrender.com/health`
- **API**: `https://your-app-name.onrender.com/api`
- **WOPI**: `https://your-app-name.onrender.com/wopi`

## 🎉 Success!

Your SKOPEO.AI LibreOffice Calc web app is now live on Render! 🚀

**Next Steps**:
1. Test all features
2. Set up Google OAuth (optional)
3. Add custom domain
4. Monitor performance
5. Set up backups

## 📞 Support

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Render Discord**: [discord.gg/render](https://discord.gg/render)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

## 🔄 Collabora Integration

**Important Note**: The LibreOffice Collabora service needs to be deployed separately or use an external Collabora instance.

### Option 1: Deploy Collabora Separately
1. Create another Render service for Collabora
2. Use the `docker-compose.render.yml` configuration
3. Update your app to point to the Collabora service URL

### Option 2: Use External Collabora
1. Deploy Collabora on another platform (Railway, Heroku, etc.)
2. Update the Collabora URL in your app configuration

### Option 3: Use Collabora Cloud
1. Sign up for Collabora Online cloud service
2. Use their hosted Collabora instance
3. Update your app configuration accordingly 