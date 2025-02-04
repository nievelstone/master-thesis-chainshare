import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const ErrorState = ({ error, onRetry }) => (
  <Box textAlign="center" mt={4}>
    <Typography color="error" gutterBottom>{error}</Typography>
    <Button variant="contained" color="primary" onClick={onRetry}>
      Try Again
    </Button>
  </Box>
);

export default ErrorState;