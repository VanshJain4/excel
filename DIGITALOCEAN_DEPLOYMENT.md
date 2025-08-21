# DigitalOcean App Platform Deployment Guide

## Overview
Complete deployment guide for SKOPEO.AI on DigitalOcean App Platform with Collabora Online integration.

## Prerequisites
- DigitalOcean account with credits
- MongoDB Atlas database (free tier)
- GitHub repository
- Firebase project (optional)

## Step-by-Step Deployment

### 1. Prepare Repository
```bash
# Create deployment branch
git checkout digital-ocean
git checkout -b digitalocean-deployment

# Push to GitHub
git add .
git commit -m "Add DigitalOcean deployment configuration"
git push origin digitalocean-deployment
```

### 2. Create DigitalOcean App
1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Choose "GitHub" as source
4. Select your repository and `digitalocean-deployment` branch
5. DigitalOcean will auto-detect the app spec from `.do/app.yaml`

### 3. Configure Environment Variables
In the DigitalOcean dashboard, set these environment variables:

**Required:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `SESSION_SECRET` - Random 32-character string
- `JWT_SECRET` - Random 32-character string
- `COLLABORA_PASSWORD` - Password for Collabora admin

**Optional:**
- `FIREBASE_API_KEY` - Firebase API key
- `AI_SERVICES_URL` - Your AI services endpoint
- `NLP_SERVICES_URL` - Your NLP services endpoint

### 4. Generate Secrets
```bash
# Generate required secrets
echo "SESSION_SECRET: $(openssl rand -base64 32)"
echo "JWT_SECRET: $(openssl rand -base64 32)"
echo "COLLABORA_PASSWORD: $(openssl rand -base64 16)"
```

### 5. Deploy
1. Review the app configuration
2. Click "Create Resources"
3. Wait for deployment (usually 5-10 minutes)
4. Access your app at the provided URL

## Architecture
- **Main App**: Node.js server with WOPI, Auth, and Frontend
- **Collabora Service**: Separate container for LibreOffice Online
- **MongoDB**: Managed database for user data
- **Static Assets**: Served directly by the app

## Monitoring
- Health check: `https://your-app.ondigitalocean.app/health`
- Status: `https://your-app.ondigitalocean.app/api/status`
- Logs: Available in DigitalOcean dashboard

## Scaling
- Automatic scaling based on CPU/memory usage
- Can manually adjust instance sizes
- Database scales independently

## Costs
- Basic app: ~$5/month
- Database: ~$15/month
- Collabora service: ~$12/month
- Total: ~$32/month for complete system

## Troubleshooting
1. Check deployment logs in DigitalOcean dashboard
2. Verify environment variables are set
3. Test health endpoints
4. Check MongoDB connection 