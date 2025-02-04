import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Play } from 'lucide-react';

const VideoPlayer = ({ 
  title = "How It Works", 
  subtitle = "Watch how ChainShare revolutionizes knowledge sharing",
  // YouTube video ID - it's the part after v= in the URL
  videoId = "YOUR_VIDEO_ID"  
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: '1200px',
        mx: 'auto',
        my: 8,
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          {subtitle}
        </Typography>
      </Box>

      <Paper
        elevation={4}
        sx={{
          position: 'relative',
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
            zIndex: 1
          },
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 8,
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            paddingTop: '56.25%', // 16:9 aspect ratio
            bgcolor: 'black',
          }}
        >
          {isPlaying ? (
            <Box
              component="iframe"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="Application Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />
          ) : (
            <>
              <Box
                component="img"
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video Thumbnail"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                onClick={handlePlay}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.5)',
                    '& .play-button': {
                      transform: 'scale(1.1)',
                      bgcolor: 'white',
                    }
                  }
                }}
              >
                <Box
                  className="play-button"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 4,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Play size={40} color="#e52e71" />
                </Box>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ p: 4, bgcolor: 'white' }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            Discover how to securely share your knowledge and earn rewards through our blockchain-powered platform
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default VideoPlayer;