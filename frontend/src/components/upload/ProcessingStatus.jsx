import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingIcon from '@mui/icons-material/Pending';
import LockIcon from '@mui/icons-material/Lock';
import { Circle } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

const ProcessingStatus = ({ progress, processingSteps, isSharing }) => (
  <Box sx={{ width: '100%', mt: 4 }}>
    <Box sx={{ 
      position: 'relative', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      mb: 4,
      height: 120 
    }}>
      <CircularProgress
        variant="determinate"
        value={progress}
        size={120}
        thickness={4}
        sx={{
          color: '#ff8a00',
          position: 'absolute'
        }}
      />
      <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
        {`${Math.round(progress)}%`}
      </Typography>
    </Box>

    <List>
      {processingSteps.map((step, index) => (
        <ListItem
          key={index}
          sx={{
            bgcolor: step.status !== 'pending' ? 'rgba(255, 138, 0, 0.05)' : 'transparent',
            borderRadius: 2,
            mb: 1,
            transition: 'all 0.3s ease',
          }}
        >
          <ListItemIcon>
            {step.status === 'complete' ? (
              <CheckCircle color="#4CAF50" size={24} />
            ) : step.status === 'in-progress' ? (
              <CircularProgress size={24} sx={{ color: '#ff8a00' }} />
            ) : (
              <Circle color="#9e9e9e" size={24} />
            )}
          </ListItemIcon>
          <ListItemText
            primary={step.name}
            sx={{
              '& .MuiListItemText-primary': {
                color: step.status === 'pending' ? 'text.secondary' : 'text.primary',
                fontWeight: step.status === 'in-progress' ? 600 : 400
              }
            }}
          />
        </ListItem>
      ))}
    </List>

    {isSharing && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mt: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: 'rgba(25, 118, 210, 0.05)',
        }}
      >
        <Typography variant="body2" color="primary">
          Securely encrypting and sharing document...
        </Typography>
      </Box>
    )}
  </Box>
);

export default ProcessingStatus;