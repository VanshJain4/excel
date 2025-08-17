import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Dashboard as DashboardIcon,
  TableChart,
  Settings,
  Add as AddIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Description
} from '@mui/icons-material';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { uploadFile, getUserFiles, deleteFile } from '../services/firebaseFileService';

const Dashboard = () => {
  const { user, logout } = useFirebaseAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState('');
  const [fileTags, setFileTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Set up real-time listener for user files
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    console.log('Setting up file listener for user:', user.uid);
    
    // Subscribe to real-time updates
    const unsubscribe = getUserFiles(user.uid, (files) => {
      console.log('Received files:', files.length);
      setFiles(files);
      setLoading(false);
    }, (error) => {
      console.error('Error in file listener:', error);
      setError('Failed to load files: ' + error.message);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up file listener');
      unsubscribe();
    };
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    // Validate file type
    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.ods'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError('File size too large. Maximum size is 10MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await uploadFile(selectedFile, user.uid, fileDescription);

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setFileDescription('');
      setFileTags('');
      setSuccess('File uploaded successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'An unexpected error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId);
        // File list will automatically update via real-time listener
      } catch (error) {
        setError(error.message || 'Failed to delete file');
      }
    }
  };

  const openFileInLibreOffice = (file) => {
    // Open file in LibreOffice with the file ID
    const libreOfficeUrl = `http://localhost:3002/collabora-with-chat.html?fileId=${file.id}`;
    window.open(libreOfficeUrl, '_blank');
  };

  const handleDownloadFile = (file) => {
    try {
      // Convert base64 to blob
      const base64Data = file.fileContent;
      if (!base64Data) {
        setError('File content not available');
        return;
      }

      // Remove data URL prefix if present
      const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      
      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('File downloaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    // Handle Firestore timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle regular date string
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SKOPEO.AI
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user?.displayName || user?.email}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                src={user?.photoURL}
                alt={user?.displayName}
                sx={{ width: 32, height: 32 }}
              >
                {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <Settings sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3} justifyContent="center">
          {/* Top Row - Welcome and Quick Actions */}
          <Grid container spacing={3} sx={{ width: { xs: '100%', md: '83.33%', lg: '66.67%' } }}>
            {/* Welcome Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', minHeight: 200 }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={user?.photoURL}
                      alt={user?.displayName}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    >
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Welcome back, {user?.displayName || 'User'}!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You're signed in as {user?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Provider: {user?.providerData?.[0]?.providerId || 'Unknown'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: '100%', minHeight: 200 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', height: 'calc(100% - 40px)' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    size="large"
                    fullWidth
                    sx={{ py: 2 }}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload New File
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TableChart />}
                    size="large"
                    fullWidth
                    sx={{ py: 2 }}
                    onClick={() => window.open('http://localhost:3002', '_blank')}
                  >
                    Open LibreOffice Calc
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Bottom Row - Your Files */}
          <Grid size={12} sx={{ width: { xs: '100%', md: '83.33%', lg: '66.67%' }, mt: 3 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Files
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : files.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No files yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Upload your first spreadsheet to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    Upload File
                  </Button>
                </Box>
              ) : (
                <List>
                  {files.map((file) => (
                    <ListItem key={file.id} divider sx={{ pr: 8 }}>
                      <ListItemIcon>
                        <TableChart color="primary" />
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1, ml: 2 }}>
                        <Typography variant="body1" component="div" fontWeight="medium">
                          {file.originalName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" component="div">
                          {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
                        </Typography>
                        {file.description && (
                          <Typography variant="body2" color="text.secondary" component="div">
                            {file.description}
                          </Typography>
                        )}
                        {file.tags && file.tags.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {file.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => openFileInLibreOffice(file)}
                          title="Open in LibreOffice"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadFile(file)}
                          title="Download"
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteFile(file.id)}
                          title="Delete"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Upload New File</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <input
                accept=".xlsx,.xls,.csv,.ods"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {selectedFile ? selectedFile.name : 'Choose File'}
                </Button>
              </label>
              
              {selectedFile && (
                <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    File Details:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Name:</strong> {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Type:</strong> {selectedFile.type || 'Unknown'}
                  </Typography>
                  {selectedFile.name.toLowerCase().endsWith('.csv') && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      CSV files are supported and will be properly handled.
                    </Alert>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                label="Description (optional)"
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Brief description of this file"
              />

              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={fileTags}
                onChange={(e) => setFileTags(e.target.value)}
                placeholder="work, finance, personal"
                helperText="Add tags to organize your files"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
