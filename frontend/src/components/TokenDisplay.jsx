import React, { useState, useEffect } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Coins } from 'lucide-react';
import { fetchUserTokenHolding } from '../functions/helpers';

const TokenDisplay = () => {
  const [balance, setBalance] = useState(null);
  
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const amount = await fetchUserTokenHolding();
        setBalance(amount);
      } catch (error) {
        console.error('Error fetching token balance:', error);
      }
    };
    
    loadBalance();
    
    // Refresh balance every 10 seconds
    const interval = setInterval(loadBalance, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const formatBalance = (amount) => {
    if (amount === null) return '...';
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };
  
  return (
    <Tooltip title="Available tokens" arrow>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          mr: 2,
          borderRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          cursor: 'default',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          }
        }}
      >
        <Coins size={18} style={{ marginRight: '8px' }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {formatBalance(balance)}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default TokenDisplay;