import React from 'react';
import { Box, Typography, LinearProgress, Fade } from '@mui/material';
import { Search, Lock, SwapHoriz } from '@mui/icons-material';

const LoadingIndicator = ({ step }) => {
  const steps = [
    { 
      icon: Search, 
      text: 'Searching knowledge base for relevant content...',
      gradient: '#ff8a00' 
    },
    { 
      icon: Lock, 
      text: 'Decrypting relevant content...',
      gradient: '#ff4d6b' 
    },
    { 
      icon: SwapHoriz, 
      text: 'Establishing secure blockchain transfer...',
      gradient: '#e52e71' 
    }
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      p: 4,
      mx: { xs: 6, sm: 8 },
      mb: 2,
      bgcolor: 'rgba(229, 46, 113, 0.05)',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <LinearProgress
        sx={{
          width: '100%',
          mb: 2,
          height: 6,
          borderRadius: 3,
          bgcolor: 'rgba(229, 46, 113, 0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
            borderRadius: 3,
          }
        }}
      />

      <Box sx={{ position: 'relative', width: '100%', height: '80px' }}>
        {steps.map((stepInfo, index) => (
          <Fade key={index} in={step === index} timeout={500}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              borderRadius: 2,
              width: '100%',
              transition: 'all 0.3s ease',
              transform: step === index ? 'scale(1.02)' : 'scale(1)',
              bgcolor: step === index ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
              boxShadow: step === index ? '0 2px 12px rgba(0,0,0,0.05)' : 'none',
              visibility: step === index ? 'visible' : 'hidden'
            }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${stepInfo.gradient}, rgba(229, 46, 113, 0.8))`,
                  boxShadow: `0 2px 10px ${stepInfo.gradient}40`
                }}
              >
                <stepInfo.icon sx={{ color: 'white' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  {stepInfo.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: 'text.secondary',
                    opacity: 0.8
                  }}
                >
                  Processing...
                </Typography>
              </Box>
            </Box>
          </Fade>
        ))}
      </Box>
    </Box>
  );
};

export default LoadingIndicator;