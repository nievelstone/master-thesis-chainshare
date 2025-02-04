import { styled } from '@mui/material/styles';
import { Card, CardContent, Button, ListItem } from '@mui/material';

export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  borderRadius: '16px',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

export const TokenValueCard = styled(StyledCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  flex: 1,
  borderRadius: '8px',
  padding: '8px 16px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.875rem',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

export const ScrollableCardContent = styled(CardContent)({
  maxHeight: '400px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.1)',
    borderRadius: '3px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(0,0,0,0.3)'
    }
  }
});

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '8px',
  margin: '4px 0',
  padding: '8px 12px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));