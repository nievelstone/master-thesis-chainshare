import React, { useState, useEffect } from 'react';
import { Grid, Snackbar, useTheme, useMediaQuery, Box } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { ethers } from 'ethers';
import PageContainer from '../components/PageContainer';
import TokenBalance from '../components/token/TokenBalance';
import TokenActivity from '../components/token/TokenActivity';
import TokenTransactionHistory from '../components/token/TokenTransactionHistory';
import TokenBuyDialog from '../components/token/TokenBuyDialog';
import TokenWithdrawDialog from '../components/token/TokenWithdrawDialog';
import { tokenService } from '../services/api/tokenService';
import { HBAR_RECIPIENT } from '../config';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Token = () => {
  const [tokenAmount, setTokenAmount] = useState(0);
  const [openBuyDialog, setOpenBuyDialog] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [hbarAmount, setHbarAmount] = useState('0');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallHeight = useMediaQuery('(max-height: 800px)');
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [withdrawStep, setWithdrawStep] = useState(0);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    fetchTokenAmount();
    fetchTransactions();
  }, []);

  const fetchTokenAmount = async () => {
    try {
      const userTokenInfo = await tokenService.getUserTokenHolding();
      setTokenAmount(userTokenInfo.tokenAmount);
    } catch (error) {
      console.error('Error fetching token amount:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const transactionData = await tokenService.getUserTransactions();
      setTransactions(transactionData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showSnackbar('Error fetching transaction history', 'error');
    }
  };

  const handleBuyClick = () => {
    setOpenBuyDialog(true);
    setActiveStep(0);
  };

  const handleWithdrawClick = () => {
    setOpenWithdrawDialog(true);
    setWithdrawStep(0);
  };

  const handleBuyAmountChange = async (e) => {
    const amount = e.target.value;
    setBuyAmount(amount);
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      setLoading(true);
      try {
        const response = await tokenService.getHbarConversion(amount);
        setHbarAmount(response.hbarAmount.toString());
      } catch (error) {
        console.error('Error fetching HBAR conversion:', error);
        showSnackbar('Error calculating HBAR amount', 'error');
        setHbarAmount('0');
      } finally {
        setLoading(false);
      }
    } else {
      setHbarAmount('0');
    }
  };

  const handleConfirmBuy = async () => {
    if (typeof window.ethereum === 'undefined') {
      showSnackbar('MetaMask is not installed', 'error');
      return;
    }

    try {
      setLoading(true);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const transaction = {
        to: HBAR_RECIPIENT,
        value: ethers.parseEther(hbarAmount)
      };

      showSnackbar('Transaction initiated. Waiting for confirmation...', 'info');

      const tx = await signer.sendTransaction(transaction);
      await tx.wait();
      console.log('Transaction confirmed:', tx.hash);

      await tokenService.triggerTransferUpdate();
      console.log("Triggered transfer update");
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Waiting for 2 seconds");
      
      showSnackbar('Transaction successful!', 'success');
      await fetchTokenAmount();
      handleCloseBuyDialog();
    } catch (error) {
      console.error('Error during MetaMask transaction:', error);
      showSnackbar(`Error during transaction: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!validateEthereumAddress(recipientAddress)) {
      showSnackbar('Invalid recipient address', 'error');
      return;
    }

    try {
      setWithdrawLoading(true);
      await tokenService.withdrawRequest(withdrawAmount, recipientAddress);
      showSnackbar('Withdrawal successful!', 'success');
      await fetchTokenAmount();
      await fetchTransactions();
      handleCloseWithdrawDialog();
    } catch (error) {
      console.error('Error during withdrawal:', error);
      showSnackbar(`Error during withdrawal: ${error.message}`, 'error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const validateEthereumAddress = (address) => {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseBuyDialog = () => {
    setOpenBuyDialog(false);
    setBuyAmount('');
    setHbarAmount('0');
    setActiveStep(0);
  };

  const handleCloseWithdrawDialog = () => {
    setOpenWithdrawDialog(false);
    setWithdrawAmount('');
    setRecipientAddress('');
    setWithdrawStep(0);
  };

  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNextWithdrawStep = () => {
    setWithdrawStep((prevStep) => prevStep + 1);
  };

  const handlePreviousWithdrawStep = () => {
    setWithdrawStep((prevStep) => prevStep - 1);
  };

  const isBuyAmountValid = buyAmount && !isNaN(buyAmount) && parseFloat(buyAmount) > 0;
  const isWithdrawAmountValid = withdrawAmount && !isNaN(withdrawAmount) && 
    parseFloat(withdrawAmount) > 0 && parseFloat(withdrawAmount) <= tokenAmount;

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <PageContainer title="Token Dashboard">
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Grid 
              container 
              spacing={3} 
              sx={{ 
                flexGrow: 1,
                height: isSmallHeight ? 'calc(100vh - 180px)' : 'auto',
                overflow: 'auto',
                mb: 40
              }}
            >
              <Grid 
                item 
                xs={12} 
                md={4}
                sx={{
                  height: isSmallHeight ? '45%' : '55%',
                  minHeight: isSmallHeight ? 'auto' : '300px',
                  maxHeight: "450px"
                }}
              >
                <TokenBalance 
                  tokenAmount={tokenAmount} 
                  onBuyClick={handleBuyClick}
                  onWithdrawClick={handleWithdrawClick}
                />
              </Grid>
              
              <Grid 
                item 
                xs={12} 
                md={8}
                sx={{
                  height: isSmallHeight ? '45%' : '55%',
                  minHeight: isSmallHeight ? 'auto' : '300px',
                  maxHeight: "450px"
                }}
              >
                <TokenActivity transactions={transactions} theme={theme} />
              </Grid>
              
              <Grid 
                item 
                xs={12}
                sx={{
                  height: isSmallHeight ? '45%' : 'auto',
                  minHeight: isSmallHeight ? '200px': '200px',
                  maxHeight: isSmallHeight ? '45vh' : '300px',
                  overflow: 'hidden'
                }}
              >
                <TokenTransactionHistory transactions={transactions} />
              </Grid>
            </Grid>
  
            <TokenBuyDialog
              open={openBuyDialog}
              onClose={handleCloseBuyDialog}
              buyAmount={buyAmount}
              onBuyAmountChange={handleBuyAmountChange}
              hbarAmount={hbarAmount}
              loading={loading}
              activeStep={activeStep}
              onConfirm={handleConfirmBuy}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
              disabled={!buyAmount || loading}
            />
  
            <TokenWithdrawDialog
              open={openWithdrawDialog}
              onClose={handleCloseWithdrawDialog}
              withdrawAmount={withdrawAmount}
              onWithdrawAmountChange={(e) => setWithdrawAmount(e.target.value)}
              recipientAddress={recipientAddress}
              onRecipientAddressChange={(e) => setRecipientAddress(e.target.value)}
              tokenAmount={tokenAmount}
              withdrawStep={withdrawStep}
              onBack={handlePreviousWithdrawStep}
              onNext={handleNextWithdrawStep}
              onConfirm={handleConfirmWithdraw}
              validateEthereumAddress={validateEthereumAddress}
              withdrawLoading={withdrawLoading}
              disabled={!withdrawAmount || !validateEthereumAddress(recipientAddress) || withdrawLoading}
            />
  
            <Snackbar 
              open={snackbar.open} 
              autoHideDuration={6000} 
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </PageContainer>
      </Box>
    );
  };
  
  export default Token;