import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { CheckCircle } from 'lucide-react';
import { Upload } from 'lucide-react';

const CompletionStatus = ({ documentTitle, onUploadAnother }) => (
  <Box
    sx={{
      mt: 4,
      p: 4,
      borderRadius: 4,
      bgcolor: 'rgba(76, 175, 80, 0.05)',
      border: '1px solid',
      borderColor: 'success.light',
      textAlign: 'center',
      width: '100%'
    }}
  >
    <CheckCircle size={48} color="#4CAF50" />
    <Typography variant="h6" sx={{ mt: 2, mb: 1, color: 'success.main' }}>
      Upload Complete!
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Your document "{documentTitle}" has been successfully processed and securely shared.
    </Typography>
    <Button
      variant="contained"
      startIcon={<Upload size={18} />}
      onClick={onUploadAnother}
      sx={{
        background: 'linear-gradient(135deg, #ff8a00, #e52e71)',
        color: 'white',
        '&:hover': {
          background: 'linear-gradient(135deg, #e52e71, #ff8a00)',
        }
      }}
    >
      Upload Another Document
    </Button>
  </Box>
);

export default CompletionStatus;