import React from 'react';
import { 
  Typography, 
  Box, 
  List, 
  ListItemText,
  CardContent 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { StyledCard, StyledListItem, ScrollableCardContent } from './styled/TokenComponents';

const TransactionIcon = ({ type }) => {
  if (type.toLowerCase().includes('withdraw')) {
    return <TrendingDownIcon color="error" sx={{ fontSize: 20 }} />;
  }
  if (type.toLowerCase().includes('purchase')) {
    return <TrendingUpIcon color="success" sx={{ fontSize: 20 }} />;
  }
  return <SwapHorizIcon color="primary" sx={{ fontSize: 20 }} />;
};

const getTransactionColor = (type) => {
  if (type.toLowerCase().includes('withdraw')) {
    return 'error.main';
  }
  if (type.toLowerCase().includes('purchase')) {
    return 'success.main';
  }
  return 'primary.main';
};

const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  
  const num = Number(number);
  if (num < 0.000001) {
    return '0';
  }
  
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const TokenTransactionHistory = ({ transactions }) => {
  return (
    <StyledCard elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600 }}>
          Transaction History
        </Typography>
      </CardContent>
      <ScrollableCardContent style={{maxHeight: "200px", paddingTop: "0px"}}>
        <List sx={{ p: 1 }}>
          {transactions.map((transaction, index) => (
            <StyledListItem key={index}>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <TransactionIcon type={transaction.type} />
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 500,
                          color: getTransactionColor(transaction.type)
                        }}
                      >
                        {transaction.type === 'withdraw' ? '-' : '+'}
                        {formatNumber(transaction.amount)} Tokens
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </StyledListItem>
          ))}
          {transactions.length === 0 && (
            <Box p={4} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No transactions found
              </Typography>
            </Box>
          )}
        </List>
      </ScrollableCardContent>
    </StyledCard>
  );
};

export default TokenTransactionHistory;