import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Box, IconButton } from '@mui/material';

const DocumentRating = ({ chunkId, initialRating, onRate }) => {
  const [rating, setRating] = useState(null);

  // Set initial rating when component mounts or when initialRating changes
  useEffect(() => {
    if (initialRating === 1) {
      setRating('up');
    } else if (initialRating === -1) {
      setRating('down');
    } else {
      setRating(null);
    }
  }, [initialRating]);

  const handleRate = (value) => {
    // If the same button is clicked again, unrate
    const newRating = rating === value ? null : value;
    setRating(newRating);
    
    // Convert rating to numeric value for the API
    let numericRating;
    if (newRating === 'up') {
      numericRating = 1;
    } else if (newRating === 'down') {
      numericRating = -1;
    } else {
      numericRating = 0;
    }
    
    onRate(chunkId, newRating);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      mr: 3,
      ml: 4
    }}>
      <IconButton
        onClick={() => handleRate('up')}
        sx={{
          border: '1px solid',
          borderColor: rating === 'up' ? 'transparent' : '#ff8a00',
          p: 1,
          minWidth: 32,
          height: 32,
          borderRadius: '12px',
          color: rating === 'up' ? '#fff' : '#ff8a00',
          background: rating === 'up' 
            ? 'linear-gradient(90deg, #ff8a00, #e52e71)'
            : 'transparent',
          '&:hover': {
            background: rating === 'up' 
              ? 'linear-gradient(90deg, #e52e71, #ff8a00)'
              : 'rgba(255, 138, 0, 0.1)',
            borderColor: rating === 'up' ? 'transparent' : '#e52e71',
            color: rating === 'up' ? '#fff' : '#e52e71'
          }
        }}
        aria-label="Rate helpful"
      >
        <ThumbsUp size={16} />
      </IconButton>
      <IconButton
        onClick={() => handleRate('down')}
        sx={{
          border: '1px solid',
          borderColor: rating === 'down' ? 'transparent' : '#ff8a00',
          p: 1,
          minWidth: 32,
          height: 32,
          borderRadius: '12px',
          color: rating === 'down' ? '#fff' : '#ff8a00',
          background: rating === 'down'
            ? 'linear-gradient(90deg, #ff8a00, #e52e71)'
            : 'transparent',
          '&:hover': {
            background: rating === 'down'
              ? 'linear-gradient(90deg, #e52e71, #ff8a00)'
              : 'rgba(255, 138, 0, 0.1)',
            borderColor: rating === 'down' ? 'transparent' : '#e52e71',
            color: rating === 'down' ? '#fff' : '#e52e71'
          }
        }}
        aria-label="Rate not helpful"
      >
        <ThumbsDown size={16} />
      </IconButton>
    </Box>
  );
};

export default DocumentRating;