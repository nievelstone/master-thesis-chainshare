import React, { useState, useCallback } from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CloudUpload, FileText, Check } from 'lucide-react';

const ResponsivePaper = styled(Paper)(({ theme, isDragging }) => ({
  border: '2px dashed',
  borderColor: isDragging ? theme.palette.primary.dark : theme.palette.primary.main,
  borderRadius: theme.spacing(2),
  backgroundColor: isDragging ? 'rgba(229, 46, 113, 0.05)' : 'rgba(255, 138, 0, 0.05)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  width: '100%',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  transform: isDragging ? 'scale(1.02)' : 'scale(1)',
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: 'rgba(229, 46, 113, 0.05)',
    transform: 'translateY(-2px)'
  },
  [theme.breakpoints.up('sm')]: {
    padding: 'min(6vh, 48px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: 'min(4vh, 32px)',
  },
  '@media (max-height: 600px)': {
    padding: '16px',
  },
  '@media (max-height: 400px)': {
    padding: '12px',
  }
}));

const SelectedFilePaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: 'rgba(76, 175, 80, 0.05)',
  border: '1px solid rgba(76, 175, 80, 0.2)',
  borderRadius: theme.spacing(1),
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  }
}));

const FileSelection = ({ onFileChange, file }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileChange({ target: { files: [file] } });
        e.dataTransfer.clearData();
      }
    }
  }, [onFileChange]);

  return (
    <Box sx={{ 
      width: '100%', 
      textAlign: 'center',
      py: { xs: 1, sm: 2, md: 3 }
    }}>
      <input
        accept=".pdf"
        id="file-upload"
        type="file"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <label 
        htmlFor="file-upload" 
        style={{ width: '100%', display: 'block' }}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <ResponsivePaper isDragging={isDragging}>
          <CloudUpload 
            size={window.innerHeight < 600 ? 32 : 48} 
            color={isDragging ? "#e52e71" : "#ff8a00"}
          />
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary" 
            sx={{ 
              mt: { xs: 1, sm: 2 },
              fontSize: {
                xs: '1rem',
                sm: '1.25rem'
              },
              '@media (max-height: 600px)': {
                fontSize: '1rem',
                marginTop: '8px'
              }
            }}
          >
            {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: { 
                xs: window.innerHeight < 400 ? 'none' : 'block' 
              },
              fontSize: {
                xs: '0.75rem',
                sm: '0.875rem'
              }
            }}
          >
            or click to browse
          </Typography>
        </ResponsivePaper>
      </label>

      {file && (
        <SelectedFilePaper elevation={1}>
          <Box sx={{ mr: 2 }}>
            <Check size={24} color="#4CAF50" />
          </Box>
          <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Selected PDF
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {file.name}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => document.getElementById('file-upload').click()}
            sx={{ ml: 2 }}
          >
            Change
          </Button>
        </SelectedFilePaper>
      )}
    </Box>
  );
};

export default FileSelection;