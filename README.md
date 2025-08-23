# SKOPEO.AI - Web-Based LibreOffice with AI Assistant

A production-ready web application that provides LibreOffice Calc editing capabilities with an AI chat sidebar, deployed on DigitalOcean.

## 🚀 **Live Demo**
- **Frontend:** https://skopeo-njcr8.ondigitalocean.app/
- **Status:** ✅ Production Ready & Running 24/7

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

## 🚀 **Quick Start**

### **Local Development**
```bash
# Clone repository
git clone https://github.com/VanshJain4/excel.git
cd excel

# Start all services
./start-complete-system.sh
```

### **Production Deployment**
The application is currently deployed and running on DigitalOcean.

## 🔧 **Useful Commands**

### **Droplet Management**
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
```

### **Development**
```bash
# Start frontend only
cd auth-interface
npm start

# Start WOPI server only
cd gpt
node server.js

# Start Collabora only
docker-compose -f docker-compose.instance2.yml up -d
```

## 📁 **Project Structure**
```
├── auth-interface/     # React frontend
├── gpt/               # WOPI server + Collabora HTML
├── auth-backend/      # Legacy auth (not used)
└── docker-compose.*.yml # Deployment configs
```

## 🔗 **Service URLs**
- **Frontend:** https://skopeo-njcr8.ondigitalocean.app/
- **WOPI Server:** http://147.182.150.232:3002
- **Collabora:** http://147.182.150.232:9980

## 🎯 **Current Status**
- ✅ **Production Deployed** - Running 24/7
- ✅ **Auto-restart Services** - Survives reboots
- ✅ **Google Auth Working** - User authentication
- ✅ **File Operations** - Upload, edit, save, delete
- ✅ **LibreOffice Integration** - Full spreadsheet editing
- ✅ **AI Chat Sidebar** - Fully functional with smooth resize
- ✅ **User Following Disabled** - No interface interference during resize

## 🏷️ **Checkpoints**
- **`CHECKPOINT-WORKING-RESIZE`** - All chat sidebar issues resolved
  - ✅ Smooth bidirectional resize (left/right)
  - ✅ User following completely disabled
  - ✅ Socket connection errors fixed
  - ✅ Event isolation working perfectly
  - **Commit:** `e77aeb5`

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

---

**Built with ❤️ using React, Node.js, and Collabora Online** 