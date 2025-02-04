import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const PageContainer = ({ children, title }) => (
  <Paper elevation={0} sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h4" gutterBottom color="primary" sx={{ mb: 3 }}>{title}</Typography>
    <Box sx={{ flexGrow: 1 }}>{children}</Box>
  </Paper>
);

export default PageContainer;