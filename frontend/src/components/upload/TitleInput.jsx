import React from 'react';
import { 
  TextField, 
  Box, 
  Typography, 
  IconButton, 
  Collapse, 
  Button, 
  Tooltip,
  Paper 
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FileText } from 'lucide-react';

const TitleInput = ({
  documentTitle,
  onTitleChange,
  showAdvancedOptions,
  onToggleAdvanced,
  keyServerLink,
  onKeyServerLinkChange,
  keyServerPublicKey,
  onKeyServerPublicKeyChange,
  onNext,
  selectedFile
}) => (
  <Box sx={{ mt: 2, width: '100%' }}>
    {selectedFile && (
      <Paper 
        elevation={1}
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'rgba(255, 138, 0, 0.05)',
          border: '1px solid',
          borderColor: 'rgba(255, 138, 0, 0.1)',
          borderRadius: 2
        }}
      >
        <FileText size={24} color="#ff8a00" />
        <Box sx={{ ml: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Selected PDF
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {selectedFile.name}
          </Typography>
        </Box>
      </Paper>
    )}

    <TextField
      fullWidth
      label="Document Title"
      variant="outlined"
      value={documentTitle}
      onChange={onTitleChange}
      sx={{ mb: 2 }}
    />
    
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="subtitle2">Advanced Options</Typography>
      <IconButton onClick={onToggleAdvanced} size="small">
        <ExpandMoreIcon />
      </IconButton>
    </Box>
    
    <Collapse in={showAdvancedOptions}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          label="Key Server Link"
          variant="outlined"
          value={keyServerLink}
          onChange={onKeyServerLinkChange}
          size="small"
        />
        <Tooltip title="The key server link is used for advanced security purposes. It specifies where the encryption keys for your document will be stored. Only change this if you're using a custom key server setup." arrow>
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          fullWidth
          label="Key Server Public Key"
          variant="outlined"
          value={keyServerPublicKey}
          onChange={onKeyServerPublicKeyChange}
          size="small"
        />
        <Tooltip title="The key server public key is used for advanced security purposes. It specifies which public key is allowed to publish secret keys to your document chunks in the smart contract. Only change this if you're using a custom key server setup." arrow>
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Collapse>
    
    <Button
      variant="contained"
      color="primary"
      onClick={onNext}
      disabled={!documentTitle.trim()}
    >
      Next
    </Button>
  </Box>
);

export default TitleInput;