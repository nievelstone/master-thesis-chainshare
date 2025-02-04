import React from 'react';
import { Grid } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CallMadeIcon from '@mui/icons-material/CallMade';
import { ActionButton } from './styled/TokenComponents';

const TokenActions = ({ onBuyClick, onWithdrawClick }) => {
  return (
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
  );
};

export default TokenActions;