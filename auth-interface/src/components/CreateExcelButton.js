import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Box, Typography } from '@mui/material';
import { createEmptyExcelFile } from '../services/createEmptyExcel';

const CreateExcelButton = ({ user, onFileCreated }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateFile = async () => {
    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    if (fileName.length > 50) {
      setError('File name must be less than 50 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Add .xlsx extension if not present
      const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      
      const result = await createEmptyExcelFile(finalFileName, user.uid, user.email);
      
      if (result.success) {
        setDialogOpen(false);
        setFileName('');
        
        // Notify parent component that file was created
        if (onFileCreated) {
          onFileCreated(result);
        }
        
        // Success - no alert needed, file will open automatically
      }
    } catch (error) {
      setError(error.message || 'Failed to create file');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setFileName('');
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFileName('');
    setError('');
  };

  return (
    <>
      <Button
        variant="outlined"
        size="large"
        fullWidth
        sx={{ py: 2 }}
        onClick={handleOpenDialog}
      >
        Create New Excel File
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Excel File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFile}
            variant="contained" 
            disabled={loading || !fileName.trim()}
          >
            {loading ? 'Creating...' : 'Create File'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateExcelButton;
