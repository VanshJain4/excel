import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const CreateFileDialog = ({ open, onClose, onCreateFile, loading }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    if (fileName.length > 50) {
      setError('File name must be less than 50 characters');
      return;
    }

    // Add .xlsx extension if not present
    const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    
    onCreateFile(finalFileName);
    setFileName('');
    setError('');
  };

  const handleClose = () => {
    setFileName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Create New Excel File
          </Typography>
          <Button onClick={handleClose} color="inherit">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Enter a name for your new Excel spreadsheet. The file will be created empty and ready for editing.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            fullWidth
            label="File Name"
            placeholder="e.g., My Spreadsheet"
            value={fileName}
            onChange={(e) => {
              setFileName(e.target.value);
              if (error) setError('');
            }}
            disabled={loading}
            helperText="The .xlsx extension will be added automatically"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !fileName.trim()}
          >
            {loading ? 'Creating...' : 'Create File'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateFileDialog;
