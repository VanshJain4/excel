# LibreOffice Calc Web App - Authentication System

A complete authentication and file management system for the LibreOffice Calc web application with Google OAuth support.

## 🚀 Features

### Authentication
- **Google OAuth 2.0** - Login with Google account
- **Email/Password Registration** - Traditional account creation
- **Email/Password Login** - Secure login with bcrypt hashing
- **Session Management** - Persistent login sessions
- **User Profiles** - Avatar, name, email management

### File Management
- **File Upload** - Upload spreadsheet files (.xlsx, .xls, .csv, .ods)
- **File Organization** - Tags and descriptions for files
- **File Download** - Download files to local machine
- **File Deletion** - Remove files from storage
- **File Metadata** - Track file size, type, creation date

### User Interface
- **Modern React UI** - Material-UI components
- **Responsive Design** - Works on desktop and mobile
- **Real-time Updates** - Live file list updates
- **Error Handling** - User-friendly error messages
- **Loading States** - Progress indicators

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express Backend│    │   MongoDB       │
│   (Port 3001)   │◄──►│   (Port 5000)   │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   User Interface         REST API & Auth         User & File Data
   File Management        Google OAuth           File Storage
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher)
- **npm** or **yarn**
- **Google Cloud Console** account (for OAuth)

## 🛠️ Installation

### 1. Install MongoDB

```bash
# macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

### 2. Clone and Setup

```bash
# Navigate to project directory
cd excel_cursor

# Install backend dependencies
cd auth-backend
npm install

# Install frontend dependencies
cd ../auth-interface
npm install

# Return to root
cd ..
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set application type to **Web application**
6. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**

### 4. Environment Configuration

Edit `auth-backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/libreoffice-auth

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)

```bash
# Start the entire system
./start-auth-system.sh

# Stop the system
./stop-auth-system.sh
```

### Option 2: Manual startup

```bash
# Terminal 1: Start backend
cd auth-backend
npm run dev

# Terminal 2: Start frontend
cd auth-interface
npm start
```

## 📱 Usage

### 1. Access the Application

Open your browser and go to: **http://localhost:3001**

### 2. Create an Account

- Click **"Sign up"** on the login page
- Fill in your name, email, and password
- Or use **"Continue with Google"** for OAuth login

### 3. Upload Files

- Click **"Upload New File"** in the dashboard
- Select a spreadsheet file (.xlsx, .xls, .csv, .ods)
- Add optional description and tags
- Click **"Upload"**

### 4. Manage Files

- View all your files in the dashboard
- Click the **edit icon** to open in LibreOffice
- Click the **download icon** to download
- Click the **delete icon** to remove

### 5. Open in LibreOffice

- Click the edit icon on any file
- This will open the file in your LibreOffice Calc web app
- Make changes and save

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Start Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/status` - Check authentication status

### Files
- `GET /api/files` - Get user's files
- `POST /api/files/upload` - Upload new file
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/stats` - Get user statistics

## 🗄️ Database Schema

### User Model
```javascript
{
  googleId: String,        // Google OAuth ID
  email: String,           // User email (unique)
  name: String,            // User's full name
  avatar: String,          // Profile picture URL
  provider: String,        // 'google' or 'email'
  password: String,        // Hashed password (email users only)
  isActive: Boolean,       // Account status
  lastLogin: Date,         // Last login timestamp
  createdAt: Date,         // Account creation date
  updatedAt: Date          // Last update date
}
```

### File Model
```javascript
{
  userId: ObjectId,        // Reference to User
  filename: String,        // Stored filename
  originalName: String,    // Original filename
  filePath: String,        // File path on disk
  fileSize: Number,        // File size in bytes
  mimeType: String,        // MIME type
  fileType: String,        // 'xlsx', 'xls', 'csv', 'ods'
  isPublic: Boolean,       // Public/private file
  tags: [String],          // File tags
  description: String,     // File description
  lastModified: Date,      // Last modification
  createdAt: Date,         // Upload date
  updatedAt: Date          // Last update date
}
```

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **Session Management** - Secure session cookies
- **CORS Protection** - Configured for localhost
- **File Type Validation** - Only spreadsheet files allowed
- **File Size Limits** - 10MB maximum file size
- **User Isolation** - Users can only access their own files
- **Input Validation** - Server-side validation

## 🎨 UI Components

### Material-UI Theme
- **Primary Color**: LibreOffice Green (#0f6803)
- **Secondary Color**: Dark Blue (#2c3e50)
- **Typography**: Roboto font family
- **Components**: Cards, Buttons, Dialogs, Lists

### Key Components
- **Login/Register Forms** - Authentication interface
- **Dashboard** - File management and user info
- **File Upload Dialog** - Drag & drop file upload
- **File List** - Organized file display with actions
- **User Menu** - Profile and logout options

## 🔗 Integration with LibreOffice

The authentication system is designed to integrate with your existing LibreOffice Calc web app:

1. **File URLs**: Files can be opened via `http://localhost:3000/collabora-with-chat.html?fileId=123`
2. **User Context**: User information is available in the session
3. **File Storage**: Files are stored in organized user directories
4. **Permissions**: Users can only access their own files

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Update `.env` with production values
2. **MongoDB**: Use MongoDB Atlas or production MongoDB instance
3. **Google OAuth**: Update redirect URIs for production domain
4. **HTTPS**: Enable HTTPS for secure cookie transmission
5. **File Storage**: Consider cloud storage (AWS S3, Google Cloud Storage)

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `brew services start mongodb-community`
   - Check connection string in `.env`

2. **Google OAuth Not Working**
   - Verify Client ID and Secret in `.env`
   - Check redirect URI matches exactly
   - Ensure Google+ API is enabled

3. **File Upload Fails**
   - Check file size (max 10MB)
   - Verify file type (.xlsx, .xls, .csv, .ods)
   - Ensure uploads directory exists

4. **Port Already in Use**
   - Kill existing processes: `./stop-auth-system.sh`
   - Check for other services using ports 3001/5000

### Logs

- **Backend logs**: Check terminal running `npm run dev`
- **Frontend logs**: Check browser console (F12)
- **MongoDB logs**: `tail -f /usr/local/var/log/mongodb/mongo.log`

## 📝 License

This project is part of the LibreOffice Calc Web App system.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy coding! 🎉**
