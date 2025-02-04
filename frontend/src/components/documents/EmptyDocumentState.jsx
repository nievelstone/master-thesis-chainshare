import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Upload, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyDocumentState = ({ type = 'uploads' }) => {
  const navigate = useNavigate();

  const content = {
    uploads: {
      title: "No Documents Yet",
      description: "Start sharing your knowledge with the community by uploading your first document.",
      buttonText: "Upload Document",
      icon: <Upload size={48} />,
      path: '/upload'
    },
    purchases: {
      title: "No Purchased Documents",
      description: "Explore our AI chat to discover and purchase relevant documents from the community.",
      buttonText: "Explore Documents",
      icon: <ShoppingCart size={48} />,
      path: '/chat'
    }
  };

  const { title, description, buttonText, icon, path } = content[type];
  const gradient = 'linear-gradient(135deg, #ff8a00, #e52e71)';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
        py: 6,
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 4,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradient,
          zIndex: 1
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '0',
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle at center, #ff8a00 0%, transparent 70%)`,
          opacity: 0.05,
          zIndex: 1
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '100%'
        }}
      >
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: '50%',
            background: 'rgba(255, 138, 0, 0.1)',
            color: '#ff8a00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'fit-content',
            mx: 'auto'
          }}
        >
          {icon}
        </Box>
        
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 2,
            background: gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ 
            mb: 4,
            maxWidth: '500px',
            mx: 'auto'
          }}
        >
          {description}
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate(path)}
          sx={{
            background: gradient,
            px: 4,
            py: 1.5,
            borderRadius: '30px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 2,
            '&:hover': {
              background: gradient,
              filter: 'brightness(1.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}
        >
          {buttonText}
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyDocumentState;