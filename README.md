# SKOPEO.AI - Web-Based LibreOffice with AI Assistant

A production-ready web application that provides LibreOffice Calc editing capabilities with an AI chat sidebar, deployed on DigitalOcean.

## 🚀 **Live Demo**
- **Frontend:** https://skopeo-njcr8.ondigitalocean.app/
- **Status:** ✅ Production Ready & Running 24/7

## ⚠️ **IMPORTANT: PRODUCTION PROTECTION**
**🚨 DO NOT TOUCH PRODUCTION WITHOUT PERMISSION! 🚨**

- **NEVER merge directly into `vansh-DO` branch** 
- **NEVER push code to production** without explicit approval
- **NEVER SSH into the droplet** and restart services without permission
- **Production is live and serving real users** - any changes can break the service

**For any production changes, contact Vansh Jain first!**

## ✨ **Features**
- 🔐 **Google OAuth Authentication**
- 📊 **LibreOffice Calc Web Editor** (Collabora Online)
- 🤖 **AI Chat Sidebar** (Echo functionality, ready for AI integration)
- 📁 **File Management** (Upload, Download, Create, Delete)
- 💾 **Real-time File Saving** (Firebase integration)
- 📱 **Responsive Design** (Material-UI)

## 🏗️ **Tech Stack**

### **Frontend (DigitalOcean App Platform)**
- React.js 18 + Material-UI
- Firebase Auth + Firestore
- Nginx (static serving)

### **Backend (DigitalOcean Droplet)**
- Node.js 18 + Express.js (WOPI Server)
- Collabora Online (Docker)
- Ubuntu 22.04 LTS

### **Infrastructure**
- **Frontend:** DigitalOcean App Platform ($24/month)
- **Backend:** DigitalOcean Droplet ($24/month)
- **Database:** Firebase (Free tier)

## 🚀 **Development Setup**

### **Prerequisites**
- Node.js 18+
- Docker & Docker Compose
- Git

### **Local Development**
```bash
# Clone repository
git clone https://github.com/VanshJain4/excel.git
cd excel

# Switch to development environment
cp .env.dev .env

# Start all services (WOPI Server + Collabora + Frontend)
./start-complete-system.sh
```

### **Development URLs**
- **Frontend:** http://localhost:3000
- **WOPI Server:** http://localhost:3002
- **Collabora:** http://localhost:9980

### **Development Workflow**
```bash
# Make your changes
# Test locally
# Commit to your feature branch
git add .
git commit -m "Your changes"
git push origin your-feature-branch

# Create PR to vansh-DO branch (requires approval)
```

## 🚀 **Production Deployment**

### **Current Production Status**
- ✅ **Frontend:** Deployed on DigitalOcean App Platform
- ✅ **Backend:** Running on DigitalOcean Droplet
- ✅ **Auto-restart:** Services survive reboots
- ✅ **24/7 Uptime:** Production ready

### **Production URLs**
- **Frontend:** https://skopeo-njcr8.ondigitalocean.app/
- **WOPI Server:** http://147.182.150.232:3002
- **Collabora:** http://147.182.150.232:9980

### **Production Environment Files**
- **Production:** `.env.prod` (contains production URLs)
- **Development:** `.env.dev` (contains localhost URLs)
- **Active:** `.env` (copied from either .env.prod or .env.dev)

## 🔧 **Environment Management**

### **Switching Environments**

#### **For Development:**
```bash
cp .env.dev .env
./start-complete-system.sh
```

#### **For Production:**
```bash
cp .env.prod .env
# Then deploy to SSH server (requires permission)
```

### **Environment Variables**
```bash
# Development (.env.dev)
WOPI_SERVER_URL=http://localhost:3002
COLLABORA_URL=http://localhost:9980

# Production (.env.prod)
WOPI_SERVER_URL=http://147.182.150.232:3002
COLLABORA_URL=http://147.182.150.232:9980
```

## 🔧 **Useful Commands**

### **Development**
```bash
# Start frontend only
cd auth-interface
npm start

# Start WOPI server only
cd gpt
node server.js

# Start Collabora only
docker-compose -f docker-compose.simple.yml up -d

# Stop all services
./stop-complete-system.sh
```

### **Production (Requires Permission)**
```bash
# SSH into droplet
ssh root@147.182.150.232

# Check WOPI server status
sudo systemctl status wopi-server

# Restart WOPI server
sudo systemctl restart wopi-server

# View WOPI server logs
sudo journalctl -u wopi-server -f

# Check Collabora container
docker ps

# Restart Collabora
cd excel
docker-compose -f docker-compose.instance2.yml restart

# Pull latest code and restart
cd excel
git pull origin vansh-DO
sudo systemctl restart wopi-server
```

## 📁 **Project Structure**
```
├── auth-interface/     # React frontend
├── gpt/               # WOPI server + Collabora HTML
├── auth-backend/      # Legacy auth (not used)
├── .env.dev          # Development environment
├── .env.prod         # Production environment
├── .env              # Active environment (copied from dev/prod)
└── docker-compose.*.yml # Deployment configs
```

## 🎯 **Current Status**
- ✅ **Production Deployed** - Running 24/7
- ✅ **Auto-restart Services** - Survives reboots
- ✅ **Google Auth Working** - User authentication
- ✅ **File Operations** - Upload, edit, save, delete
- ✅ **LibreOffice Integration** - Full spreadsheet editing
- ✅ **AI Chat Sidebar** - Fully functional with smooth resize
- ✅ **User Following Disabled** - No interface interference during resize
- ✅ **Environment Detection** - Automatic dev/prod URL switching

## 🏷️ **Checkpoints**
- **`CHECKPOINT-WORKING-RESIZE`** - All chat sidebar issues resolved
  - ✅ Smooth bidirectional resize (left/right)
  - ✅ User following completely disabled
  - ✅ Socket connection errors fixed
  - ✅ Event isolation working perfectly
  - **Commit:** `e77aeb5`

- **`CHECKPOINT-PRODUCTION-READY`** - Production deployment working
  - ✅ Environment detection working correctly
  - ✅ hideLoading function fixed
  - ✅ Production URLs working
  - ✅ Development environment working
  - **Commit:** `a434935`

## 💰 **Costs**
- **Total:** ~$48/month
- **Frontend:** $24/month (App Platform)
- **Backend:** $24/month (Droplet)
- **Firebase:** Free tier

## 🚀 **Next Steps**
- [ ] Add custom domain (skopeo.ai)
- [ ] Implement real AI functionality
- [ ] Add Word/PowerPoint support
- [ ] Add real-time collaboration

## ⚠️ **IMPORTANT REMINDERS**

### **🚨 PRODUCTION PROTECTION RULES:**
1. **NEVER merge to `vansh-DO`** without asking Vansh Jain
2. **NEVER push production changes** without permission
3. **NEVER SSH into droplet** without approval
4. **NEVER restart production services** without explicit permission
5. **Production is live** - any changes can break real users

### **✅ SAFE DEVELOPMENT PRACTICES:**
1. **Always work on feature branches**
2. **Test locally first** with `./start-complete-system.sh`
3. **Create PRs** for any changes to `vansh-DO`
4. **Ask for permission** before any production changes
5. **Document changes** in commit messages

---

**Built with ❤️ using React, Node.js, and Collabora Online**

