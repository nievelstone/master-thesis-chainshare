import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Grid, Divider } from '@mui/material';
import { MessageSquare, Upload, FileText, Coins, DollarSign, Zap, Lock } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import FAQ from '../components/FAQ';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare size={32} />,
      title: "AI Chat",
      description: "Interact with our AI to get insights from uploaded documents. Each question costs 3 tokens.",
      path: "/chat",
      color: "#ff8a00"
    },
    {
      icon: <Upload size={32} />,
      title: "Upload Documents",
      description: "Share your knowledge by uploading PDF documents. Your content is securely encrypted.",
      path: "/upload",
      color: "#e52e71"
    },
    {
      icon: <FileText size={32} />,
      title: "Manage Documents",
      description: "View and manage your uploaded documents or access purchased content.",
      path: "/documents",
      color: "#4CAF50"
    },
    {
      icon: <Coins size={32} />,
      title: "Token Management",
      description: "Buy and manage your tokens. Track your transaction history.",
      path: "/token",
      color: "#2196F3"
    }
  ];

  const pricingDetails = [
    {
      icon: <DollarSign size={24} />,
      title: "Token Value",
      details: [
        { label: "Value in Euro", value: "€0.01 per token" },
        { label: "Minimum Purchase", value: "1 token" },
        { label: "Payment Method", value: "HBAR (Hedera)" }
      ],
      color: "#4CAF50"
    },
    {
      icon: <Lock size={24} />,
      title: "Access Costs",
      details: [
        { label: "AI Chat", value: "3 tokens/question" },
        { label: "Per Cited Document Paragraph", value: "1-5 tokens (Based on paragraph relevance)" },
        { label: "Full Document Costs", value: "2 tokens/ paragraph" }
      ],
      color: "#ff8a00"
    },
    {
      icon: <Coins size={24} />,
      title: "Provider Rewards",
      details: [
        { label: "Per Paragraph Access", value: "1-5 tokens (Based on paragraph relevance)" },
        { label: "Full Document Reward", value: "2 tokens/ paragraph" },
        { label: "Average", value: "6 paragraphs/ page" }
      ],
      color: "#e52e71"
    }
  ];

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
          Welcome to ChainShare
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Share knowledge securely and earn rewards through blockchain technology
        </Typography>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: 6
              }
            }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{
                  color: feature.color,
                  mb: 2
                }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(feature.path)}
                  sx={{
                    borderColor: feature.color,
                    color: feature.color,
                    '&:hover': {
                      borderColor: feature.color,
                      bgcolor: `${feature.color}10`
                    }
                  }}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Pricing Section */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(255,138,0,0.05), rgba(229,46,113,0.05))',
        borderRadius: 4,
        p: 6,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ff8a00, #e52e71)'
        }} />

        <Typography variant="h4" align="center" gutterBottom sx={{
          mb: 5,
          fontWeight: 600,
          position: 'relative'
        }}>
          Pricing & Token System
        </Typography>

        <Grid container spacing={4}>
          {pricingDetails.map((section, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.9)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3,
                    color: section.color
                  }}>
                    {section.icon}
                    <Typography variant="h6" sx={{ ml: 1, fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Box>

                  {section.details.map((detail, detailIndex) => (
                    <Box key={detailIndex} sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: detailIndex !== section.details.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {detail.label}
                      </Typography>
                      <Typography variant="h6" sx={{
                        fontWeight: 500,
                        color: section.color,
                        fontSize: '1.1rem'
                      }}>
                        {detail.value}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/token')}
            sx={{
              background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '30px',
              '&:hover': {
                background: 'linear-gradient(90deg, #e52e71, #ff8a00)',
              }
            }}
          >
            Get Started with Tokens
          </Button>
        </Box>
      </Box>
      
      {/* FAQ Section */}
      <FAQ />
      
      {/* Video Section */}
      <VideoPlayer
        title="See ChainShare in Action"
        subtitle="Learn how to securely share and monetize your knowledge in minutes"
        videoId="h-gxD1tQAVY" // Replace with your actual YouTube video ID
      />
    </Box>
  );
};

export default LandingPage;