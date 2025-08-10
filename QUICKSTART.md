# Quick Start Guide

Get your LibreOffice Calc web app running in 5 minutes!

## 🚀 Super Quick Setup

1. **Make sure Docker is running** on your system

2. **Run the simple setup** (recommended for first time):
   ```bash
   ./setup-simple.sh
   ```

3. **Open your browser** and go to: `http://localhost:8080`

4. **Login to Nextcloud**:
   - Username: `admin`
   - Password: `admin_password`

5. **Install Collabora Online app**:
   - Go to Settings → Apps
   - Search for "Collabora Online"
   - Click Install

6. **Configure Collabora Online**:
   - Go to Settings → Collabora Online
   - Enter server URL: `http://localhost:9980`
   - Click Save

7. **Test with sample data**:
   - Upload the file `sample-data/sample-spreadsheet.csv`
   - Click on it to open in LibreOffice Calc

## 🎯 What You Get

- ✅ Full LibreOffice Calc in your browser
- ✅ Real-time collaboration
- ✅ Support for .ods, .xlsx, .csv files
- ✅ File management with Nextcloud
- ✅ No installation required (Docker-based)

## 🔧 Troubleshooting

**Services not starting?**
```bash
docker-compose -f docker-compose.simple.yml logs
```

**Can't access Nextcloud?**
- Make sure Docker is running
- Wait 30 seconds after running setup script
- Check if port 8080 is available

**Collabora not working?**
- Make sure you installed the Collabora Online app
- Verify the server URL is correct: `http://localhost:9980`

## 🛑 Stop the Services

```bash
docker-compose -f docker-compose.simple.yml down
```

## 📚 Next Steps

- Read the full [README.md](README.md) for advanced configuration
- Try the full setup with HTTPS: `./setup.sh`
- Explore Nextcloud features and apps
- Set up user accounts for collaboration

---

**Need help?** Check the main [README.md](README.md) for detailed documentation! 