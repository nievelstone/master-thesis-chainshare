import React from 'react';
import { Box, Container, CssBaseline } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          maxHeight: isLandingPage ? 'none' : '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <Navigation isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            display: 'flex',
            overflow: isLandingPage ? 'auto' : 'hidden',
          }}
        >
          <Container 
            maxWidth="lg" 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              py: 3,
              overflow: isLandingPage ? 'visible' : 'hidden'
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default MainLayout;