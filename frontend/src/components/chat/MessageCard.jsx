import React from 'react';
import { Box, Typography, Avatar, IconButton, Paper, Chip, Tooltip, Button } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import DocumentRating from '../documents/DocumentRating';
import DocumentReference from './DocumentReference';

const MessageCard = ({
  messageIndex,
  message,
  onChunkClick,
  onRateChunk,
  onBuyDocument,
  isExpanded,
  onToggleDocuments,
  tooltipContent,
  loadingTooltip,
  onTooltipOpen
}) => {
  const isUser = message.sender_pk !== 'AI';
  const timestamp = new Date(message.created_at).toLocaleTimeString();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        p: 2.5,
        maxWidth: { xs: '75%', sm: '85%' },
        width: 'fit-content',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        bgcolor: isUser
          ? 'rgba(255, 138, 0, 0.05)'
          : 'rgba(229, 46, 113, 0.05)',
        borderRadius: 3,
        position: 'relative',
        mx: { xs: 6, sm: 8 },
        mb: 2,
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 0,
          height: 0,
          border: '8px solid transparent',
          borderTopColor: isUser
            ? 'rgba(255, 138, 0, 0.05)'
            : 'rgba(229, 46, 113, 0.05)',
          top: '15px',
          [isUser ? 'right' : 'left']: -15,
          transform: isUser ? 'rotate(-90deg)' : 'rotate(90deg)',
        },
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          background: isUser
            ? 'linear-gradient(135deg, #ff8a00, #e52e71)'
            : 'linear-gradient(135deg, #e52e71, #ff8a00)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'absolute',
          top: 0,
          [isUser ? 'right' : 'left']: { xs: -40, sm: -46 },
        }}
      >
        {isUser ? 'U' : 'AI'}
      </Avatar>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {timestamp}
          </Typography>
        </Box>

        {isUser ? (
          <Typography variant="body1" sx={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
            {message.body}
          </Typography>
        ) : (
          <MessageContent 
            message={message}
            isExpanded={isExpanded}
            onToggleDocuments={onToggleDocuments}
            tooltipContent={tooltipContent}
            loadingTooltip={loadingTooltip}
            onTooltipOpen={onTooltipOpen}
            onChunkClick={onChunkClick}
            onRateChunk={onRateChunk}
            onBuyDocument={onBuyDocument}
          />
        )}
      </Box>
    </Box>
  );
};

const MessageContent = ({
  message,
  isExpanded,
  onToggleDocuments,
  tooltipContent,
  loadingTooltip,
  onTooltipOpen,
  onChunkClick,
  onRateChunk,
  onBuyDocument
}) => (
  <>
    <Box>
      <ReactMarkdown
        components={{
          p: (props) => <Typography {...props} sx={{ mb: 1 }} />,
          h1: (props) => <Typography variant="h4" {...props} sx={{ mb: 2, mt: 2 }} />,
          h2: (props) => <Typography variant="h5" {...props} sx={{ mb: 2, mt: 2 }} />,
          h3: (props) => <Typography variant="h6" {...props} sx={{ mb: 1, mt: 1 }} />,
          pre: (props) => (
            <Box
              component="pre"
              sx={{
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                '& code': { fontFamily: 'monospace' },
              }}
              {...props}
            />
          ),
          code: (props) => (
            <code
              {...props}
              style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                padding: '2px 4px',
                borderRadius: 4,
              }}
            />
          )
        }}
      >
        {message.body || ''}
      </ReactMarkdown>
    </Box>

    {message.purchases && message.purchases.length > 0 && (
      <DocumentReferences
        documents={message.purchases}
        isExpanded={isExpanded}
        onToggleDocuments={onToggleDocuments}
        tooltipContent={tooltipContent}
        loadingTooltip={loadingTooltip}
        onTooltipOpen={onTooltipOpen}
        onChunkClick={onChunkClick}
        onRateChunk={onRateChunk}
        onBuyDocument={onBuyDocument}
      />
    )}
  </>
);

const DocumentReferences = ({
    documents,
    isExpanded,
    onToggleDocuments,
    tooltipContent,
    loadingTooltip,
    onTooltipOpen,
    onRateChunk,
    onBuyDocument
  }) => (
    <>
      <Typography component="span" sx={{ color: 'primary.main' }}>
        <sup>{documents.map((_, idx) => `[${idx + 1}]`).join(' ')}</sup>
      </Typography>
  
      <Box sx={{ mt: 3, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
            Referenced Documents
          </Typography>
          <IconButton size="small" onClick={onToggleDocuments}>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
  
        {isExpanded && (
          <Box>
            {documents.map((doc, index) => (
              <DocumentReference
                key={index}
                doc={doc}
                tooltipContent={tooltipContent}
                loadingTooltip={loadingTooltip}
                onTooltipOpen={onTooltipOpen}
                onRateChunk={onRateChunk}
                onBuyDocument={onBuyDocument}
              />
            ))}
          </Box>
        )}
      </Box>
    </>
  );

export default MessageCard;