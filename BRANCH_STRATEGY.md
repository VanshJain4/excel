# 🌿 Branch Strategy for SKOPEO.AI

This document outlines the branch strategy for managing different deployment environments and features.

## 📋 Branch Overview

### Current Branches

| Branch | Purpose | Status | Deployment |
|--------|---------|--------|------------|
| `main` | Production-ready code | Stable | - |
| `digital-ocean` | Digital Ocean deployment | ✅ Working | Digital Ocean |
| `render-deployment` | Render deployment | 🚧 In Progress | Render |
| `frontend` | Frontend development | Development | - |
| `vansh` | Personal development | Development | - |

## 🎯 Branch Purposes

### `digital-ocean` Branch
- **Purpose**: Digital Ocean App Platform deployment
- **Features**: 
  - Docker-based deployment
  - Collabora integration
  - Complete system with auth backend
- **Startup**: Uses `start-complete-system.sh`
- **Status**: ✅ Production ready

### `render-deployment` Branch
- **Purpose**: Render.com deployment
- **Features**:
  - Docker-free startup
  - AI integration endpoints
  - Simplified deployment
- **Startup**: Uses `npm start` (builds React + starts server)
- **Status**: 🚧 Ready for testing

### `main` Branch
- **Purpose**: Clean, stable codebase
- **Features**: Core functionality only
- **Status**: 📋 Needs cleanup

## 🔄 Workflow

### For Digital Ocean (Current Working Setup)
```bash
# Stay on digital-ocean branch
git checkout digital-ocean

# Make changes for Digital Ocean
git add .
git commit -m "Digital Ocean improvements"
git push origin digital-ocean
```

### For Render Deployment
```bash
# Switch to render-deployment branch
git checkout render-deployment

# Make Render-specific changes
git add .
git commit -m "Render deployment fixes"
git push origin render-deployment
```

### For New Features
```bash
# Create feature branch from appropriate base
git checkout digital-ocean  # or render-deployment
git checkout -b feature/new-feature

# Develop and test
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Merge back to appropriate branch
git checkout digital-ocean
git merge feature/new-feature
```

## 🚀 Deployment Commands

### Digital Ocean Deployment
```bash
# On digital-ocean branch
./start-complete-system.sh
```

### Render Deployment
```bash
# On render-deployment branch
npm start
```

## 📁 Key Files by Branch

### `digital-ocean` Branch
- `start-complete-system.sh` - Main startup script
- `docker-compose.simple.yml` - Docker services
- `auth-backend/` - Express backend
- `auth-interface/` - React frontend

### `render-deployment` Branch
- `railway-server.js` - Production server
- `railway.json` - Render configuration
- `package.json` - Updated scripts
- `RENDER_DEPLOYMENT.md` - Deployment guide
- `render-start.sh` - Render startup script

## 🔧 Environment Variables

### Digital Ocean
```bash
# Set in Digital Ocean dashboard
MONGODB_URI=your-mongodb-uri
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Render
```bash
# Set in Render dashboard
MONGODB_URI=your-mongodb-uri
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
AI_SERVICES_URL=https://your-ai-services.onrender.com
NLP_SERVICES_URL=https://your-nlp-services.onrender.com
```

## 🎯 Next Steps

### Immediate Actions
1. **Test Render Deployment**: Deploy `render-deployment` branch to Render
2. **Verify Digital Ocean**: Ensure `digital-ocean` branch still works
3. **Clean Main Branch**: Merge stable features to `main`

### Future Planning
1. **Feature Development**: Use feature branches
2. **Environment Sync**: Keep common features in sync between branches
3. **Documentation**: Update deployment guides for each environment

## 🚨 Important Notes

### Don't Break Digital Ocean
- Always test changes on `render-deployment` first
- Keep `digital-ocean` branch stable
- Use feature branches for major changes

### AI Integration
- AI features are only in `render-deployment` branch
- Digital Ocean branch focuses on core LibreOffice functionality
- Consider adding AI features to Digital Ocean later

### Collaboration
- Coordinate with team members on which branch to use
- Document any branch-specific configurations
- Keep deployment guides updated

## 📞 Support

- **Digital Ocean Issues**: Check `digital-ocean` branch logs
- **Render Issues**: Check `render-deployment` branch and Render logs
- **General Issues**: Check `main` branch for core functionality 