import React from 'react';
import { Box, Typography, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StyledCard } from './styled/TokenComponents';

const TokenActivity = ({ transactions }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallHeight = useMediaQuery('(max-height: 800px)');

  const formatTransactionsForChart = () => {
    return transactions.slice(0, 7).reverse().map(tx => ({
      date: new Date(tx.timestamp).toLocaleDateString(undefined, {
        month: isSmallScreen ? 'numeric' : 'short',
        day: 'numeric'
      }),
      amount: tx.amount
    }));
  };

  // Calculate dynamic height based on screen size
  const getChartHeight = () => {
    if (isSmallHeight) {
      return isSmallScreen ? 200 : 220;
    }
    return isSmallScreen ? 250 : 300;
  };

  return (
    <StyledCard 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent 
        sx={{ 
          p: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Typography 
          variant="h5" 
          component="div" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            mb: 2
          }}
        >
          Token Activity
        </Typography>

        <Box 
          sx={{ 
            flex: 1,
            minHeight: getChartHeight(),
            width: '100%',
            mt: 1
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={formatTransactionsForChart()}
              margin={{
                top: 5,
                right: isSmallScreen ? 10 : 20,
                left: isSmallScreen ? -20 : 0,
                bottom: 5
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(0,0,0,0.1)"
                vertical={!isSmallScreen}
              />
              <XAxis 
                dataKey="date" 
                stroke="rgba(0,0,0,0.5)"
                tick={{ 
                  fill: 'rgba(0,0,0,0.6)',
                  fontSize: isSmallScreen ? 11 : 12
                }}
                tickMargin={10}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
              />
              <YAxis 
                stroke="rgba(0,0,0,0.5)"
                tick={{ 
                  fill: 'rgba(0,0,0,0.6)',
                  fontSize: isSmallScreen ? 11 : 12
                }}
                tickMargin={8}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                tickFormatter={value => value.toFixed(0)}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  padding: '8px 12px'
                }}
                labelStyle={{
                  fontSize: '12px',
                  color: 'rgba(0,0,0,0.7)',
                  marginBottom: '4px'
                }}
                itemStyle={{
                  fontSize: '13px',
                  color: theme.palette.primary.main,
                  padding: '2px 0'
                }}
                formatter={(value) => [`${value.toFixed(2)} tokens`, 'Amount']}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={{ 
                  stroke: theme.palette.primary.main, 
                  strokeWidth: 2, 
                  r: isSmallScreen ? 3 : 4,
                  fill: '#fff'
                }}
                activeDot={{ 
                  r: isSmallScreen ? 5 : 6,
                  stroke: theme.palette.primary.main,
                  strokeWidth: 2,
                  fill: theme.palette.primary.main
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default TokenActivity;