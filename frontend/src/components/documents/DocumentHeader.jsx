import React from 'react';
import { Typography, Tabs, Tab } from '@mui/material';
import { HeaderSection } from './styled/DocumentPageWrapper';

const DocumentHeader = ({ tabValue, onTabChange }) => (
  <HeaderSection>
    <Typography variant="h4" component="h1" gutterBottom>
      My Documents
    </Typography>
    <Tabs 
      value={tabValue} 
      onChange={onTabChange}
      aria-label="document tabs"
    >
      <Tab label="My Documents" />
      <Tab label="Purchases" />
    </Tabs>
  </HeaderSection>
);

export default DocumentHeader;