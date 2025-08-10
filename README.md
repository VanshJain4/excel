# LibreOffice Calc Web App

A complete web-based LibreOffice Calc solution using Collabora Online and Nextcloud. This setup provides a fully-featured spreadsheet application accessible through your browser with real-time collaboration capabilities.

## 🚀 Features

- **Full LibreOffice Calc functionality** in your browser
- **Real-time collaboration** - multiple users can edit simultaneously
- **File management** through Nextcloud
- **Support for multiple formats**: .ods, .xlsx, .csv, .xls
- **Secure HTTPS access** with SSL/TLS encryption
- **Docker-based deployment** for easy setup and management

## 📋 Prerequisites

- Docker
- Docker Compose
- At least 4GB RAM available
- 10GB free disk space

## 🛠️ Quick Setup

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd excel_cursor
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Access your LibreOffice Calc web app**
   - Open https://localhost in your browser
   - Accept the self-signed certificate warning
   - Log in with: `admin` / `admin_password`

## 📁 Project Structure

```
excel_cursor/
├── docker-compose.yml      # Main Docker configuration
├── setup.sh               # Automated setup script
├── nginx/
│   ├── nginx.conf         # NGINX reverse proxy configuration
│   └── ssl/               # SSL certificates (auto-generated)
└── README.md              # This file
```

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

1. **Generate SSL certificates**
   ```bash
   mkdir -p nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
       -keyout nginx/ssl/nginx.key \
       -out nginx/ssl/nginx.crt \
       -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **Wait for services to initialize** (about 30 seconds)

## 🌐 Access URLs

- **Nextcloud (main interface)**: https://localhost
- **Direct Nextcloud**: http://localhost:8080
- **Collabora Online**: https://localhost:9980

## 📖 Usage Guide

### First Time Setup

1. **Access Nextcloud**
   - Go to https://localhost
   - Login: `admin` / `admin_password`

2. **Install Collabora Online app**
   - Go to Settings → Apps
   - Search for "Collabora Online"
   - Install the app

3. **Configure Collabora Online**
   - Go to Settings → Collabora Online
   - Enter Collabora Online server URL: `https://localhost:9980`
   - Save settings

### Using LibreOffice Calc

1. **Upload a spreadsheet**
   - Drag and drop a .ods, .xlsx, or .csv file into Nextcloud
   - Or use the "+" button to upload

2. **Open in Calc**
   - Click on the spreadsheet file
   - It will open in LibreOffice Calc in your browser

3. **Collaborate**
   - Share the file with others using Nextcloud sharing
   - Multiple users can edit simultaneously
   - Changes are saved automatically

## 🔧 Configuration

### Environment Variables

Edit `docker-compose.yml` to customize:

- **Database password**: Change `nextcloud_password`
- **Admin password**: Change `admin_password`
- **Collabora password**: Change `collabora_password`
- **Domain**: Update `domain` in Collabora service

### Production Deployment

For production use:

1. **Replace SSL certificates**
   - Replace `nginx/ssl/nginx.crt` and `nginx/ssl/nginx.key` with proper certificates
   - Update domain names in configurations

2. **Set strong passwords**
   - Update all passwords in `docker-compose.yml`
   - Use environment files for sensitive data

3. **Configure backup**
   - Set up regular backups of the `nextcloud_data` volume
   - Backup the PostgreSQL database

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart nextcloud

# Update images
docker-compose pull
docker-compose up -d
```

## 🔍 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   docker-compose logs
   ```

2. **SSL certificate errors**
   - Accept the self-signed certificate in your browser
   - For production, use proper SSL certificates

3. **Collabora not connecting**
   - Check if Collabora Online app is installed in Nextcloud
   - Verify the server URL in Nextcloud settings

4. **Performance issues**
   - Increase Docker memory allocation
   - Consider using SSD storage for volumes

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs nextcloud
docker-compose logs collabora

# Follow logs in real-time
docker-compose logs -f
```

## 🔒 Security Considerations

- Change default passwords immediately
- Use proper SSL certificates for production
- Regularly update Docker images
- Configure firewall rules appropriately
- Set up regular backups

## 📚 Additional Resources

- [Nextcloud Documentation](https://docs.nextcloud.com/)
- [Collabora Online Documentation](https://www.collaboraoffice.com/code/)
- [LibreOffice Documentation](https://www.libreoffice.org/get-help/documentation/)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE). 