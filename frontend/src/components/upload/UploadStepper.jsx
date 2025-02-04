import React from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Button, Paper, TextField, IconButton, Tooltip, Collapse } from '@mui/material';
import { CheckCircle, Lock, Info } from 'lucide-react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Pending from '@mui/icons-material/Pending';
import { CloudUpload } from 'lucide-react';


const UploadStepper = ({ activeStep }) => {
  const steps = ['Select PDF', 'Document Details', 'Process', 'Complete'];

  return (
    <Box sx={{ width: '100%', mb: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '20px',
          left: '10%',
          right: '10%',
          height: '2px',
          background: '#eee',
          zIndex: 0
        }
      }}>
        {steps.map((label, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeStep >= index
                  ? 'linear-gradient(135deg, #ff8a00, #e52e71)'
                  : '#fff',
                border: '2px solid',
                borderColor: activeStep >= index ? '#ff8a00' : '#eee',
                mb: 1,
                transition: 'all 0.3s ease',
                color: activeStep >= index ? 'white' : '#999',
              }}
            >
              {activeStep > index ? <CheckCircle size={20} /> : index + 1}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: activeStep >= index ? 'text.primary' : 'text.secondary',
                fontWeight: activeStep === index ? 600 : 400
              }}
            >
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default UploadStepper;