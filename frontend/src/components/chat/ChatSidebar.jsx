import React from 'react';
import { 
  Box, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Badge, 
  Typography 
} from '@mui/material';
import { 
  Add, 
  ChatBubbleOutline, 
  DeleteOutline 
} from '@mui/icons-material';

const ChatSidebar = ({ 
  conversations, 
  currentConversation, 
  onNewChat, 
  onSelectConversation, 
  onDeleteConversation 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={onNewChat}
          sx={{
            borderRadius: '12px',
            p: 1.5,
            background: 'linear-gradient(135deg, #ff8a00, #e52e71)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e52e71, #ff8a00)',
            }
          }}
        >
          New Chat
        </Button>
      </Box>

      <Divider />

      <List sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 2 }}>
        {conversations.length === 0 ? (
          <ListItem sx={{ justifyContent: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No conversations yet. Start a new chat!
            </Typography>
          </ListItem>
        ) : (
          conversations.map((conv) => (
            <ListItem
              key={conv.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => onDeleteConversation(conv.id, e)}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              }
              sx={{ mb: 1 }}
            >
              <ListItemButton
                selected={currentConversation?.id === conv.id}
                onClick={() => onSelectConversation(conv)}
                sx={{
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(255, 138, 0, 0.08)' },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255, 138, 0, 0.12)',
                    '&:hover': { bgcolor: 'rgba(255, 138, 0, 0.15)' }
                  }
                }}
              >
                <ListItemIcon>
                  <Badge color="primary" variant="dot">
                    <ChatBubbleOutline />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={conv.name}
                  secondary={conv.last_message || "No messages yet"}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  sx={{
                    '& .MuiListItemText-secondary': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default ChatSidebar;