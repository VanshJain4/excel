# 🚀 DigitalOcean App Platform Deployment Guide

This guide will help you deploy the complete SKOPEO.AI system on DigitalOcean App Platform with Collabora Online integration.

## 📋 Prerequisites

- DigitalOcean account with App Platform access
- GitHub repository with your code
- MongoDB Atlas database (or DigitalOcean managed MongoDB)

## 🔧 Step 1: Prepare Your Repository

### 1.1 Create a new branch for DigitalOcean deployment
```bash
git checkout -b digitalocean-deployment
git push origin digitalocean-deployment
```

### 1.2 Ensure all files are committed
```bash
git add .
git commit -m "Prepare for DigitalOcean deployment"
git push origin digitalocean-deployment
```

## 🌊 Step 2: Deploy on DigitalOcean App Platform

### 2.1 Create New App
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Choose "GitHub" as source
4. Select your repository and `digitalocean-deployment` branch

### 2.2 Configure App Settings
- **App Name**: `skopeo-ai-complete`
- **Region**: Choose closest to your users
- **Environment**: Production

### 2.3 Add Environment Variables

#### Required Environment Variables:
```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_session_secret_key
JWT_SECRET=your_jwt_secret_key
COLLABORA_PASSWORD=your_collabora_admin_password
APP_DOMAIN=your-app-name.ondigitalocean.app
FIREBASE_API_KEY=your_firebase_api_key
```

#### Generate Secrets:
```bash
# Generate session secret
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32

# Generate Collabora password
openssl rand -base64 16
```

### 2.4 Configure Services

The app will automatically create two services:

1. **Main App Service** (`main-app`)
   - Source: Your GitHub repository
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Instance Size: Basic XS
   - Instance Count: 1

2. **Collabora Service** (`collabora-service`)
   - Image: `collabora/code:latest`
   - Instance Size: Basic S
   - Instance Count: 1
   - Port: 9980
   - Route: `/collabora`

### 2.5 Add Database (Optional)
- Click "Add Resource" → "Database"
- Choose "MongoDB"
- Version: 6.0
- Production: No (for development)

## 🔍 Step 3: Verify Deployment

### 3.1 Check Health Endpoints
```bash
# Main app health
curl https://your-app-name.ondigitalocean.app/health

# Collabora health
curl https://your-app-name.ondigitalocean.app/wopi/collabora-health

# API status
curl https://your-app-name.ondigitalocean.app/api/status
```

### 3.2 Expected Responses

**Health Check:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "server": "running",
    "mongodb": "connected",
    "collabora": "configured"
  }
}
```

**Collabora Health:**
```json
{
  "status": "OK",
  "collabora": "connected",
  "url": "https://your-app-name.ondigitalocean.app/collabora"
}
```

## 🎯 Step 4: Test Spreadsheet Functionality

### 4.1 Access the Application
1. Go to `https://your-app-name.ondigitalocean.app`
2. Login with your credentials
3. Create a new spreadsheet or upload an existing one

### 4.2 Test Collabora Integration
1. Click "Edit" on any spreadsheet
2. Should open in Collabora Online editor
3. Make changes and save
4. Verify changes are persisted

## 🔧 Step 5: Troubleshooting

### 5.1 Common Issues

**Collabora Connection Failed:**
- Check if Collabora service is running
- Verify `COLLABORA_URL` environment variable
- Check Collabora service logs

**MongoDB Connection Failed:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access
- Ensure IP whitelist includes DigitalOcean

**Build Failures:**
- Check if all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

### 5.2 Logs and Monitoring
- Go to your app in DigitalOcean dashboard
- Click on each service to view logs
- Monitor resource usage and performance

### 5.3 Environment Variable Issues
```bash
# Check if variables are set correctly
curl https://your-app-name.ondigitalocean.app/api/status
```

## 🔄 Step 6: Continuous Deployment

### 6.1 Automatic Deployments
- DigitalOcean will automatically deploy when you push to `digitalocean-deployment` branch
- Monitor deployment status in the dashboard

### 6.2 Manual Deployments
- Go to your app dashboard
- Click "Deploy" to trigger manual deployment
- Useful for testing changes

## 📊 Step 7: Monitoring and Scaling

### 7.1 Performance Monitoring
- Monitor CPU and memory usage
- Check response times
- Set up alerts for high resource usage

### 7.2 Scaling Options
- Increase instance count for high traffic
- Upgrade instance sizes for better performance
- Add load balancers if needed

## 🔒 Step 8: Security Considerations

### 8.1 Environment Variables
- Use DigitalOcean's encrypted environment variables
- Never commit secrets to Git
- Rotate secrets regularly

### 8.2 Network Security
- Use HTTPS (automatic with DigitalOcean)
- Configure CORS properly
- Monitor for suspicious activity

## 🎉 Success!

Your SKOPEO.AI system is now deployed on DigitalOcean with:
- ✅ Main application with authentication
- ✅ WOPI server for file operations
- ✅ Collabora Online for spreadsheet editing
- ✅ MongoDB database integration
- ✅ Firebase integration
- ✅ AI service endpoints ready

## 📞 Support

If you encounter issues:
1. Check the logs in DigitalOcean dashboard
2. Verify all environment variables are set
3. Test endpoints individually
4. Check Collabora service status

## 🔗 Useful Links

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Collabora Online Documentation](https://docs.collabora.com/)
- [WOPI Protocol Reference](https://docs.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/online/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
