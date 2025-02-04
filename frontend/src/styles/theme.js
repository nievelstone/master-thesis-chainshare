// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff8a00', // Vibrant gradient start
      dark: '#e52e71', // Vibrant gradient end
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5', // Light gray background for main content
      paper: '#ffffff', // White background for paper components
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '0.5px',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      letterSpacing: '0.2px',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(90deg, #ff8a00, #e52e71)`,
          boxShadow: 'none',
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '30px',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
          color: '#ffffff',
          boxShadow: '0 4px 15px rgba(233, 69, 96, 0.75)',
          '&:hover': {
            background: 'linear-gradient(90deg, #e52e71, #ff8a00)',
            boxShadow: '0 6px 20px rgba(233, 69, 96, 0.75)',
          },
        },
      },
    },
  },
});

export default theme;
