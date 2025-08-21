# Railway Deployment Guide

## Overview
This guide helps you deploy the SKOPEO.AI application to Railway with Collabora Online integration.

## Prerequisites
- Railway account
- MongoDB Atlas database
- Firebase project setup

## Deployment Steps

### 1. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
```

### 2. Environment Variables
Set these in Railway dashboard:

**Required:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `SESSION_SECRET` - Random secret for sessions
- `JWT_SECRET` - Random secret for JWT tokens

**Optional:**
- `FIREBASE_API_KEY` - Firebase API key
- `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `FIREBASE_APP_ID` - Firebase app ID
- `FIREBASE_MEASUREMENT_ID` - Firebase measurement ID
- `COLLABORA_URL` - External Collabora service URL
- `AI_SERVICES_URL` - AI services endpoint
- `NLP_SERVICES_URL` - NLP services endpoint

### 3. Deploy Main Application
```bash
# Deploy from current directory
railway up
```

### 4. Deploy Collabora Service (Separate Service)
Create a second Railway service for Collabora:

1. Create new service in same project
2. Use `collabora.railway.Dockerfile`
3. Set environment variables:
   - `domain=your-main-app-domain`
   - `username=admin`
   - `password=collabora_password`

### 5. Connect Services
Update main app's `COLLABORA_URL` to point to Collabora service URL.

## Testing
- Access main app at your Railway URL
- Check `/health` endpoint for service status
- Test spreadsheet editing functionality

## Troubleshooting
- Check Railway logs for errors
- Verify environment variables are set
- Test Collabora service independently 