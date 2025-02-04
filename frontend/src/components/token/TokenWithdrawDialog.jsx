import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Box,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TokenWithdrawDialog = ({
  open,
  onClose,
  withdrawAmount,
  onWithdrawAmountChange,
  recipientAddress,
  onRecipientAddressChange,
  tokenAmount,
  withdrawStep,
  onBack,
  onNext,
  onConfirm,
  validateEthereumAddress,
  withdrawLoading
}) => {
  const isAmountError = withdrawAmount && (parseFloat(withdrawAmount) > tokenAmount || parseFloat(withdrawAmount) <= 0);
  const isAddressError = recipientAddress && !validateEthereumAddress(recipientAddress);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Withdraw Tokens</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={withdrawStep} alternativeLabel sx={{ mb: 4 }}>
          {['Enter Details', 'Review', 'Confirm'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {withdrawStep === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                label="Number of Tokens"
                type="number"
                fullWidth
                value={withdrawAmount}
                onChange={onWithdrawAmountChange}
                helperText={isAmountError ? `Amount must be between 0 and ${tokenAmount} tokens` : `Available balance: ${tokenAmount} tokens`}
                variant="outlined"
                error={isAmountError}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Recipient Address"
                fullWidth
                value={recipientAddress}
                onChange={onRecipientAddressChange}
                helperText={isAddressError ? "Invalid Hedera address" : "Enter the Hedera address to receive the tokens"}
                variant="outlined"
                error={isAddressError}
              />
            </Grid>
          </Grid>
        )}
        {withdrawStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Review Your Withdrawal</Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">Amount to Withdraw:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" align="right">{withdrawAmount} Tokens</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom>Recipient Address:</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {recipientAddress}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="error">
              Please verify all details carefully. Withdrawals cannot be reversed.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {withdrawStep > 0 && (
          <Button onClick={onBack}>
            Back
          </Button>
        )}
        <Button 
          onClick={withdrawStep < 2 ? onNext : onConfirm}
          disabled={
            withdrawLoading || 
            !withdrawAmount || 
            isAmountError ||
            !validateEthereumAddress(recipientAddress)
          }
          variant="contained"
          color="primary"
        >
          {withdrawStep === 2 ? 'Confirm Withdrawal' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TokenWithdrawDialog;