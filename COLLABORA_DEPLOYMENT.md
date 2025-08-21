# 🚀 Collabora Online Deployment Guide

Guide for deploying Collabora Online service to work with your SKOPEO.AI app.

## 🎯 The Problem

Your current Render deployment has:
- ✅ WOPI server (running)
- ❌ Collabora Online service (missing)

When you click "edit", it tries to connect to Collabora but there's no service running.

## 🔧 Solution Options

### Option 1: Deploy Collabora as Separate Render Service (Recommended)

#### Step 1: Create New Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +" → "Web Service"**
3. Connect to your GitHub repository
4. Configure:
   - **Name**: `skopeo-collabora`
   - **Environment**: `Docker`
   - **Branch**: `render-deployment`
   - **Dockerfile Path**: `collabora-render.yml`
   - **Plan**: `Free` (for testing)

#### Step 2: Create Collabora Dockerfile
Create a new file `collabora.Dockerfile`:

```dockerfile
FROM collabora/code:latest

# Expose port
EXPOSE 9980

# Set environment variables
ENV domain=localhost
ENV username=admin
ENV password=collabora_password
ENV dictionaries=en_US
ENV extra_params=--o:ssl.enable=false --o:ssl.termination=true --o:net.frame_ancestors=* --o:net.post_allow.host=* --o:wopi.host.allowlist=*

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9980/hosting/capabilities || exit 1

# Start Collabora
CMD ["/usr/bin/coolwsd", "--version"]
```

#### Step 3: Update Environment Variables
In your main app's Render service, add:
```bash
COLLABORA_URL=https://your-collabora-service.onrender.com
```

### Option 2: Use External Collabora Service

#### Option 2A: Collabora Cloud (Paid)
1. Sign up at [Collabora Online](https://www.collaboraoffice.com/code/)
2. Get your service URL
3. Add to environment variables:
```bash
COLLABORA_URL=https://your-collabora-cloud-url.com
```

#### Option 2B: Railway Deployment
1. Deploy Collabora to Railway using `docker-compose.render.yml`
2. Get the service URL
3. Add to environment variables:
```bash
COLLABORA_URL=https://your-collabora-railway-url.up.railway.app
```

### Option 3: Local Development Setup

For local testing, you can run Collabora locally:

```bash
# Start Collabora locally
docker run -d \
  --name collabora \
  -p 9980:9980 \
  -e "domain=localhost" \
  -e "extra_params=--o:ssl.enable=false --o:ssl.termination=false" \
  --cap-add MKNOD \
  collabora/code:latest

# Set environment variable
export COLLABORA_URL=http://localhost:9980
```

## 🔍 Testing Collabora Connection

### Check Collabora Health
Visit: `https://your-app.onrender.com/wopi/collabora-health`

Should show:
```json
{
  "status": "Collabora Online is running",
  "url": "https://your-collabora-service.onrender.com",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Check WOPI Status
Visit: `https://your-app.onrender.com/wopi/status`

Should show:
```json
{
  "status": "WOPI server running",
  "collaboraUrl": "https://your-collabora-service.onrender.com",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚨 Troubleshooting

### Collabora Not Responding
1. Check if Collabora service is running
2. Verify the URL in `COLLABORA_URL` environment variable
3. Check Collabora service logs
4. Ensure Collabora service is accessible from your main app

### CORS Issues
If you see CORS errors:
1. Update Collabora's `extra_params` to allow your domain
2. Add your domain to `--o:net.frame_ancestors`
3. Add your domain to `--o:wopi.host.allowlist`

### SSL Issues
For HTTPS deployments:
1. Set `--o:ssl.termination=true` in Collabora
2. Ensure your domain is properly configured
3. Check SSL certificate validity

## 📋 Quick Setup Checklist

### For Render Deployment
- [ ] Create Collabora service on Render
- [ ] Set `COLLABORA_URL` in main app environment variables
- [ ] Test Collabora health endpoint
- [ ] Test WOPI status endpoint
- [ ] Try editing a file

### For External Collabora
- [ ] Set up Collabora service (Railway, Cloud, etc.)
- [ ] Set `COLLABORA_URL` environment variable
- [ ] Test connection
- [ ] Verify SSL/HTTPS configuration

## 🎯 Recommended Approach

1. **Start with Option 1** (Separate Render service) for testing
2. **Move to Option 2A** (Collabora Cloud) for production
3. **Use Option 3** (Local) for development

## 📞 Support

- **Collabora Docs**: [docs.collaboraonline.com](https://docs.collaboraonline.com)
- **Render Docs**: [docs.render.com](https://docs.render.com)
- **WOPI Protocol**: [Microsoft WOPI Docs](https://docs.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/online/) 