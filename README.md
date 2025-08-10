# LibreOffice Calc Web App

A complete web-based LibreOffice Calc solution using Collabora Online and a custom WOPI host server. This setup provides a fully-featured spreadsheet application accessible through your browser with real-time editing capabilities.

## 🚀 Features

- **Full LibreOffice Calc functionality** in your browser
- **Excel-compatible** - supports .xlsx, .ods, .csv files
- **Multiple sheets** - add, rename, and manage worksheets
- **Real-time saving** - changes saved automatically
- **All Excel formulas** - SUM, AVERAGE, VLOOKUP, and more
- **Charts and graphs** - create visual data representations
- **Formatting tools** - colors, fonts, borders, cell styles
- **Pivot tables** - advanced data analysis
- **Docker-based deployment** for easy setup and management

## ✅ What You CAN Do

### 📊 Core Spreadsheet Features
- ✅ **Multiple sheets** - Add unlimited worksheets
- ✅ **All Excel formulas** - Mathematical, statistical, lookup functions
- ✅ **Cell formatting** - Colors, fonts, borders, alignment
- ✅ **Conditional formatting** - Dynamic cell styling
- ✅ **Data validation** - Input restrictions and rules
- ✅ **Charts and graphs** - Bar, line, pie, scatter plots
- ✅ **Pivot tables** - Advanced data analysis
- ✅ **Sorting and filtering** - Organize data easily
- ✅ **Find and replace** - Search and modify content
- ✅ **Print preview** - View and print documents

### 🔄 Real-time Features
- ✅ **Auto-save** - Changes saved automatically
- ✅ **File management** - Upload and download files
- ✅ **Version tracking** - Track document changes
- ✅ **Comments** - Add notes and annotations

## ⚠️ What You CANNOT Do

### 🔒 System Limitations
- ❌ **No local file system access** - Can't browse local files
- ❌ **No external data connections** - Can't connect to databases
- ❌ **No macro execution** - VBA macros disabled for security
- ❌ **No add-ins** - Can't install LibreOffice extensions

### 🌐 Browser Limitations
- ⚠️ **Limited keyboard shortcuts** - Some advanced shortcuts may not work
- ⚠️ **No right-click context menu** - Some features require menu navigation
- ⚠️ **Screen size dependent** - Interface adapts to browser window
- ⚠️ **No offline mode** - Requires internet connection

### 🔧 Advanced Features
- ⚠️ **Limited drawing tools** - Basic shapes only
- ⚠️ **No custom themes** - Uses default LibreOffice theme
- ⚠️ **No external links** - Can't link to external files
- ⚠️ **No embedded objects** - Limited OLE support

## 📋 Prerequisites

- Docker
- Node.js (for WOPI server)
- At least 2GB RAM available
- 5GB free disk space

## 🛠️ Quick Setup

### Option 1: Automated Script (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/VanshJain4/excel.git
   cd excel
   ```

2. **Run the startup script**
   ```bash
   ./start-libreoffice-app.sh
   ```

3. **Access your LibreOffice Calc web app**
   - The script will automatically open http://localhost:3000
   - Click "Open Excel File in LibreOffice Calc"

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   cd gpt
   npm install
   ```

2. **Start Collabora container**
   ```bash
   docker run -d --name collabora -p 9980:9980 \
     -e "domain=localhost" \
     -e "extra_params=--o:ssl.enable=false --o:ssl.termination=false --o:net.frame_ancestors=localhost:3000 --o:net.post_allow.host=host.docker.internal:3000 --o:wopi.host.allowlist=host.docker.internal:3000" \
     --cap-add MKNOD \
     collabora/code:latest
   ```

3. **Start WOPI server**
   ```bash
   cd gpt
   node server.js
   ```

4. **Open web interface**
   - Visit http://localhost:3000
   - Click "Open Excel File in LibreOffice Calc"

## 📁 Project Structure

```
excel_cursor/
├── gpt/                           # Main application directory
│   ├── server.js                  # WOPI host server
│   ├── index.html                 # Web interface
│   ├── package.json               # Node.js dependencies
│   ├── sample-spreadsheet.xlsx    # Sample Excel file with 3 sheets
│   └── node_modules/              # Dependencies (ignored by git)
├── start-libreoffice-app.sh       # Automated startup script
├── stop-libreoffice-app.sh        # Stop all services
├── docker-compose.simple.yml      # Docker configuration (legacy)
└── README.md                      # This file
```

## 📊 Sample Data

The included `sample-spreadsheet.xlsx` contains:

- **Employees Sheet**: Staff information with names, ages, salaries, departments
- **Products Sheet**: Inventory data with prices, stock levels, categories
- **Financials Sheet**: Monthly revenue, expenses, and profit tracking

## 🎯 Usage Guide

### Getting Started

1. **Start the application**
   ```bash
   ./start-libreoffice-app.sh
   ```

2. **Open the web interface**
   - Browser will open automatically to http://localhost:3000
   - Or manually visit the URL

3. **Edit your spreadsheet**
   - Click "Open Excel File in LibreOffice Calc"
   - Full LibreOffice interface opens in new tab
   - Edit cells, add formulas, create charts
   - Changes save automatically

### Adding New Sheets

1. **In LibreOffice Calc interface**
   - Look for sheet tabs at bottom (Employees, Products, Financials)
   - **Right-click** on any sheet tab
   - Select **"Insert Sheet"**
   - Or use **Insert → Sheet** from menu

2. **Renaming sheets**
   - Double-click on sheet tab name
   - Type new name and press Enter

### Using Formulas

- **Basic math**: `=SUM(A1:A10)`, `=AVERAGE(B1:B20)`
- **Lookup functions**: `=VLOOKUP(A1, B1:C10, 2, FALSE)`
- **Conditional**: `=IF(A1>100, "High", "Low")`
- **Date functions**: `=TODAY()`, `=NOW()`

## 🐳 Docker Commands

```bash
# Start all services
./start-libreoffice-app.sh

# Stop all services
./stop-libreoffice-app.sh

# Check running containers
docker ps

# View Collabora logs
docker logs collabora

# Restart Collabora
docker restart collabora
```

## 🔍 Troubleshooting

### Common Issues

1. **"Unauthorized WOPI host" error**
   - Run `./stop-libreoffice-app.sh` then `./start-libreoffice-app.sh`
   - This restarts with proper configuration

2. **Port 3000 or 9980 already in use**
   - The startup script automatically handles this
   - If manual setup, use `lsof -ti:3000 | xargs kill -9`

3. **Collabora not connecting**
   - Check if Docker is running
   - Verify Collabora container is up: `docker ps | grep collabora`

4. **Changes not saving**
   - Check WOPI server logs: `tail -f wopi-server.log`
   - Ensure file permissions are correct

### Logs and Debugging

```bash
# View WOPI server logs
tail -f wopi-server.log

# View Collabora logs
docker logs collabora

# Check service status
curl http://localhost:3000/wopi/files/123
curl http://localhost:9980/hosting/capabilities
```

## 🔒 Security Considerations

- **Local development only** - Not configured for production
- **No authentication** - Anyone with access can edit files
- **File permissions** - Ensure proper file ownership
- **Network access** - Services bound to localhost only

## 🚀 Production Deployment

For production use:

1. **Add authentication** to WOPI server
2. **Use HTTPS** with proper SSL certificates
3. **Configure firewall** rules
4. **Set up backups** for data files
5. **Add user management** system
6. **Implement file sharing** and permissions

## 📚 Additional Resources

- [Collabora Online Documentation](https://www.collaboraoffice.com/code/)
- [LibreOffice Calc Guide](https://www.libreoffice.org/get-help/documentation/)
- [WOPI Protocol Specification](https://docs.microsoft.com/en-us/microsoft-365/cloud-storage-partner-program/online/)
- [Node.js WOPI Host Examples](https://github.com/collaboraonline/online-wopi-host)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE). 