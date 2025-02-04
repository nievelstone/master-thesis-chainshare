import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TokenRequirementAlert = () => {
  const navigate = useNavigate();

  const handleGetTokens = (e) => {
    e.preventDefault();
    navigate('/token');
  };

  const handleLearnMore = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <Box 
        sx={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        {/* Gradient top border */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #ff8a00, #e52e71)'
        }} />
        
        <Box sx={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
              borderRadius: '50%',
              padding: '16px',
            }}>
              <Coins className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <Typography 
            variant="h6" 
            sx={{
              textAlign: 'center',
              marginBottom: '16px',
              color: '#1a1a1a',
              fontWeight: 600,
              fontSize: '1.25rem'
            }}
          >
            Token Requirement Needed
          </Typography>
          
          <Typography 
            sx={{
              textAlign: 'center',
              marginBottom: '24px',
              color: '#1a1a1a',
              fontSize: '1rem',
              lineHeight: 1.6
            }}
          >
            To access our AI-powered chat feature, you'll need at least 5 tokens in your wallet. This helps ensure high-quality interactions and maintains our community standards.
          </Typography>
          
          <Box sx={{
            display: 'flex',
            flexDirection: {xs: 'column', sm: 'row'},
            gap: '12px',
            justifyContent: 'center'
          }}>
            <Button 
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
                color: 'white',
                padding: '10px 24px',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  background: 'linear-gradient(90deg, #ff7600, #d41e61)',
                }
              }}
              onClick={handleGetTokens}
            >
              Get Tokens
            </Button>
            
            <Button 
              variant="outlined"
              sx={{
                borderColor: '#e52e71',
                color: '#e52e71',
                padding: '10px 24px',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#d41e61',
                  background: 'rgba(229, 46, 113, 0.04)',
                }
              }}
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default TokenRequirementAlert;