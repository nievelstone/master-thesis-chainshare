import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import DocumentRating from '../documents/DocumentRating';

const relevanceTooltips = {
  high: "High relevance indicates this content strongly matches your query.",
  medium: "Medium relevance suggests partial match with your query.",
  low: "Low relevance means the content is loosely related to your query."
};

const DocumentReference = ({
  doc,
  tooltipContent,
  loadingTooltip,
  onTooltipOpen,
  onRateChunk,
  onBuyDocument
}) => {
  const getRelevanceColor = (relevance) => {
    switch (relevance) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'error';
      default: return 'default';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(0, 0, 0, 0.03)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Tooltip
            title={relevanceTooltips[doc.relevance]}
            arrow
            placement="top"
          >
            <Chip
              label={doc.relevance}
              color={getRelevanceColor(doc.relevance)}
              size="small"
              sx={{
                mr: 2,
                textTransform: 'capitalize',
                minWidth: 70,
                justifyContent: 'center',
                fontSize: '0.75rem',
                cursor: 'help'
              }}
            />
          </Tooltip>
          <Tooltip
            title={
              loadingTooltip[doc.chunk_id]
                ? 'Loading...'
                : tooltipContent[doc.chunk_id] || 'Hover to load content'
            }
            arrow
            onOpen={() => onTooltipOpen(doc.chunk_id)}
          >
            <Box sx={{ flex: 1, minWidth: 0, cursor: 'default' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                <>
                Paper: <strong>{doc.title}</strong>; {doc.content_preview}
                </>
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DocumentRating
            chunkId={doc.chunk_id}
            initialRating={doc.rating}
            onRate={onRateChunk}
          />
          <Button
            variant="outlined"
            size="small"
            sx={{
              ml: 2,
              minWidth: 'auto',
              borderRadius: 1.5,
              textTransform: 'none',
              flexShrink: 0,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                bgcolor: 'rgba(229, 46, 113, 0.05)'
              }
            }}
            onClick={() => onBuyDocument(doc.document_id)}
          >
            Buy Document
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DocumentReference;