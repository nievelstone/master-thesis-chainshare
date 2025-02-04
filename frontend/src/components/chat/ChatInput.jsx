import React from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import { SendRounded } from '@mui/icons-material';

const ChatInput = ({
  inputMessage,
  onInputChange,
  onSendMessage,
  disabled,
  loading
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Ask about blockchain or AI..."
          size="medium"
          value={inputMessage}
          onChange={onInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled || loading}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: 'background.default'
            }
          }}
        />
        <Button
          variant="contained"
          onClick={onSendMessage}
          disabled={disabled || loading || !inputMessage.trim()}
          sx={{
            minWidth: '50px',
            height: '50px',
            borderRadius: '12px',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #ff8a00, #e52e71)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e52e71, #ff8a00)',
            },
            boxShadow: '0 4px 12px rgba(229, 46, 113, 0.2)'
          }}
        >
          <SendRounded />
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatInput;