
import React from 'react';
import { Box, Typography } from '@mui/material';
import MessageCard from './MessageCard';
import LoadingIndicator from './LoadingIndicator';

const ChatMessages = ({ 
  messages, 
  handleChunkClick, 
  handleRateChunk, 
  handleBuyDocument,
  expandedMessages,
  toggleMessageDocuments,
  tooltipContent,
  loadingTooltip,
  handleTooltipOpen,
  isWaitingForResponse,
  loadingStep,
  messagesEndRef 
}) => {
  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        py: 3 
      }}
    >
      {!messages || messages.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <Typography color="text.secondary">
            Start a conversation by sending a message!
          </Typography>
        </Box>
      ) : (
        <>
          {messages.map((msg, index) => (
            <React.Fragment key={index}>
              {msg.sender_pk === 'AI' && msg.body === '' && isWaitingForResponse && (
                <LoadingIndicator step={loadingStep} />
              )}
              <MessageCard
                messageIndex={index}
                message={msg}
                onChunkClick={handleChunkClick}
                onRateChunk={handleRateChunk}
                onBuyDocument={handleBuyDocument}
                isExpanded={expandedMessages[index]}
                onToggleDocuments={() => toggleMessageDocuments(index)}
                tooltipContent={tooltipContent}
                loadingTooltip={loadingTooltip}
                onTooltipOpen={handleTooltipOpen}
              />
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </Box>
  );
};

export default ChatMessages;