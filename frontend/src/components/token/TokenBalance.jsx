import React from 'react';
import { Box, Grid, Typography, CardContent } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { ActionButton, TokenValueCard } from './styled/TokenComponents';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CallMadeIcon from '@mui/icons-material/CallMade';

const TokenBalance = ({ tokenAmount, onBuyClick, onWithdrawClick }) => {
  const formatNumber = (number) => {
    if (number === undefined || number === null) return '0';
    
    const num = Number(number);
    if (num < 0.000001) {
      return '0';
    }
    
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const renderTokenActions = () => (
    <CardContent sx={{ pt: 0 }}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <ActionButton
            variant="contained"
            color="secondary"
            onClick={onBuyClick}
            startIcon={<SwapHorizIcon />}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              color: 'primary.main',
              height: '36px'
            }}
          >
            Buy
          </ActionButton>
        </Grid>
        <Grid item xs={6}>
          <ActionButton
            variant="outlined"
            onClick={onWithdrawClick}
            startIcon={<CallMadeIcon />}
            sx={{ 
              borderColor: 'rgba(255,255,255,0.9)', 
              color: 'white',
              height: '36px'
            }}
          >
            Withdraw
          </ActionButton>
        </Grid>
      </Grid>
    </CardContent>
  );

  return (
    <TokenValueCard elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600 }}>
          Token Balance
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
          <Typography variant="h3" component="div" ml={2} sx={{ fontWeight: 700 }}>
            {formatNumber(tokenAmount)}
          </Typography>
        </Box>
        <Typography variant="h6" component="div" sx={{ opacity: 0.9 }}>
          Value: €{formatNumber(tokenAmount/100)}
        </Typography>
      </CardContent>
      {renderTokenActions()}
    </TokenValueCard>
  );
};

export default TokenBalance;