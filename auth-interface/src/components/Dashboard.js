import React, { useState, useEffect, useCallback } from 'react';
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
  ListItemSecondaryAction,
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
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { currentUser, logout, getUserFiles, uploadFile, deleteFile } = useAuth();
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

  const loadUserFiles = useCallback(async () => {
    setLoading(true);
    const result = await getUserFiles();
    if (result.success) {
      setFiles(result.files);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [getUserFiles]);

  useEffect(() => {
    loadUserFiles();
  }, [loadUserFiles]);

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
      const tags = fileTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const result = await uploadFile(selectedFile, fileDescription, tags);

      if (result.success) {
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setFileDescription('');
        setFileTags('');
        setSuccess('File uploaded successfully!');
        loadUserFiles(); // Refresh file list
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('An unexpected error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      const result = await deleteFile(fileId);
      if (result.success) {
        loadUserFiles(); // Refresh file list
      } else {
        setError(result.error);
      }
    }
  };

  const openFileInLibreOffice = (file) => {
    // This will be integrated with your LibreOffice app
    const libreOfficeUrl = `http://localhost:3000/collabora-with-chat.html?fileId=${file.id}`;
    window.open(libreOfficeUrl, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
              Welcome, {currentUser?.name}
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
                src={currentUser?.avatar}
                alt={currentUser?.name}
                sx={{ width: 32, height: 32 }}
              >
                {currentUser?.name?.charAt(0)}
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
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Top Row - Welcome and Quick Actions */}
          <Grid container item spacing={3}>
            {/* Welcome Card */}
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={currentUser?.avatar}
                      alt={currentUser?.name}
                      sx={{ width: 64, height: 64, mr: 2 }}
                    >
                      {currentUser?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        Welcome back, {currentUser?.name}!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        You're signed in as {currentUser?.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Provider: {currentUser?.provider}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                    onClick={() => window.open('http://localhost:3000', '_blank')}
                  >
                    Open LibreOffice Calc
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Bottom Row - Your Files */}
          <Grid item xs={12}>
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
                    <ListItem key={file.id} divider>
                      <ListItemIcon>
                        <TableChart color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.originalName}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatFileSize(file.fileSize)} • {formatDate(file.createdAt)}
                            </Typography>
                            {file.description && (
                              <Typography variant="body2" color="text.secondary">
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
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openFileInLibreOffice(file)}
                            title="Open in LibreOffice"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => window.open(`http://localhost:5000/api/files/${file.id}/download`, '_blank')}
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
                      </ListItemSecondaryAction>
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
