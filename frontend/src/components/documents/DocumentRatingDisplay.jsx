import React from 'react';
import { Box, Typography, Tooltip, Badge } from '@mui/material';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

const DocumentRatingDisplay = ({ rating = 0, upvotes = 0, downvotes = 0 }) => {
  const getColor = () => {
    if (rating > 0) return '#4CAF50';  // Green for positive
    if (rating < 0) return '#f44336';  // Red for negative
    return '#9e9e9e';  // Grey for neutral
  };

  const getIcon = () => {
    if (rating > 0) return <ThumbsUp size={16} />;
    if (rating < 0) return <ThumbsDown size={16} />;
    return null;
  };

  const totalVotes = upvotes + downvotes;
  
  const tooltipContent = totalVotes > 0 ? (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Rating Details:
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">
          👍 {upvotes} upvotes
        </Typography>
        <Typography variant="body2">
          👎 {downvotes} downvotes
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Total Rating: {rating}
        </Typography>
      </Box>
    </Box>
  ) : `Document Rating: ${rating}`;

  return (
    <Tooltip 
      title={tooltipContent}
      arrow
      placement="top"
    >
      <Badge
        badgeContent={Math.abs(totalVotes)}
        color={rating > 0 ? "success" : rating < 0 ? "error" : "default"}
        sx={{
          '& .MuiBadge-badge': {
            right: -3,
            top: 3,
            border: `2px solid ${getColor()}`,
            padding: '0 4px',
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: '12px',
            backgroundColor: `${getColor()}15`,
            border: '1px solid',
            borderColor: `${getColor()}30`,
            color: getColor(),
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: `${getColor()}25`,
            }
          }}
        >
          {getIcon()}
          <Typography
            variant="caption"
            sx={{
              ml: getIcon() ? 1 : 0,
              fontWeight: 500
            }}
          >
            {rating > 0 ? `Score: ${upvotes - downvotes}` : rating < 0 ?  `Score: ${downvotes - upvotes}` : 'Rating'}
          </Typography>
        </Box>
      </Badge>
    </Tooltip>
  );
};

export default DocumentRatingDisplay;