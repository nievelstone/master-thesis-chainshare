import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Paper, CircularProgress, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import MetaMaskLogo from '../components/MetaMaskLogo';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { HelpCircle } from 'lucide-react';
import FAQDialog from '../components/FAQDialog';

const GlassPaper = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const LoginButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  borderRadius: '30px',
  fontSize: '1rem',
  textTransform: 'none',
  width: '100%',
  maxWidth: 300,
  color: '#fff',
  background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
  boxShadow: '0 4px 15px 0 rgba(233, 69, 96, 0.75)',
  '&:hover': {
    background: 'linear-gradient(90deg, #e52e71, #ff8a00)',
    boxShadow: '0 6px 20px 0 rgba(233, 69, 96, 0.75)',
  },
}));

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const switchToHederaTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x128' }], // Hedera Testnet chain ID
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x128',
                chainName: 'Hedera Testnet',
                nativeCurrency: {
                  name: 'HBAR',
                  symbol: 'HBAR',
                  decimals: 18,
                },
                rpcUrls: ['https://testnet.hashio.io/api'],
                blockExplorerUrls: ['https://hashscan.io/testnet/dashboard'],
              },
            ],
          });
          return true;
        } catch (addError) {
          setError('Failed to add Hedera Testnet to MetaMask');
          return false;
        }
      }
      setError('Failed to switch to Hedera Testnet');
      return false;
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts.length > 0) {
          const address = accounts[0];
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });

          const hederaTestnetChainId = '0x128'; // 296 in decimal

          if (chainId !== hederaTestnetChainId) {
            const switched = await switchToHederaTestnet();
            if (!switched) {
              setIsLoading(false);
              return;
            }
          }

          const messageToSign = `Login to ChainShare: ${new Date().toISOString()}`;
          const messageHex = '0x' + Array.from(new TextEncoder().encode(messageToSign))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');

          const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [messageHex, address],
          });

          const response = await fetch(API_URL + '/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address, message: messageHex, signature }),
          });

          if (response.ok) {
            const { token } = await response.json();
            localStorage.setItem('authToken', token);
            setIsAuthenticated(true);
            navigate('/');
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Authentication failed');
          }
        } else {
          setError('No accounts found');
        }
      } else {
        setError('MetaMask not detected');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while connecting to MetaMask');
    }

    setIsLoading(false);
  };

  return (
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      backgroundColor: '#0f0f0f',
    }}>
      <BackgroundAnimation />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 2,
        padding: theme.spacing(3),
      }}>
        <GlassPaper elevation={3} sx={{
          p: 4,
          width: '100%',
          maxWidth: 500,
          textAlign: 'center',
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
              Welcome to ChainShare
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500, color: '#ddd' }}>
              Unlock the power of shared knowledge on the blockchain
            </Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            <MetaMaskLogo width={80} height={80} />
          </Box>
          <LoginButton
            variant="contained"
            onClick={connectWallet}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Connect with MetaMask'
            )}
          </LoginButton>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              startIcon={<HelpCircle size={18} />}
              onClick={() => setFaqOpen(true)}
              sx={{
                color: 'rgba(255,255,255,0.8)',
                '&:hover': {
                  color: 'white'
                }
              }}
            >
              Need Help? Check our FAQ
            </Button>
          </Box>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </GlassPaper>
      </Box>
      <FAQDialog open={faqOpen} onClose={() => setFaqOpen(false)} />
    </Box>
  );
};

export default Login;