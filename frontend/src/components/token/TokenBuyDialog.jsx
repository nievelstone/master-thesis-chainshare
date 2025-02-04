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
  Paper,
  IconButton,
  Box,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { InfoIcon } from 'lucide-react';

const TokenBuyDialog = ({
  open,
  onClose,
  buyAmount,
  onBuyAmountChange,
  hbarAmount,
  loading,
  activeStep,
  onBack,
  onNext,
  onConfirm,
  disabled
}) => {
  const steps = ['Enter Amount', 'Review', 'Confirm'];
  const isAmountError = buyAmount !== '' && (isNaN(buyAmount) || parseFloat(buyAmount) <= 0);

  // Disable dialog close button and escape key when transaction is processing
  const handleClose = (event, reason) => {
    if (activeStep === 2 && loading) {
      return; // Prevent closing during transaction
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">Buy Tokens</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={activeStep === 2 && loading}
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
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 2 && loading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Processing Transaction
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Please wait while your transaction is being processed...
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
              Please do not close this window or navigate away until the transaction is complete.
              Doing so may cause issues with your token purchase.
            </Alert>
          </Box>
        ) : (
          <>
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Number of Tokens"
                    type="number"
                    fullWidth
                    value={buyAmount}
                    onChange={onBuyAmountChange}
                    helperText="1 token = 1 cent"
                    variant="outlined"
                    error={isAmountError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 2, mt: 2, position: 'relative' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Conversion Preview
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" color="primary">
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : (
                          `${hbarAmount} HBAR`
                        )}
                      </Typography>
                      <Tooltip
                        title="HBAR is the native cryptocurrency of the Hedera blockchain, used to purchase ChainShare tokens. The conversion rate is automatically calculated based on current market prices."
                        arrow
                        placement="top"
                      >
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {parseFloat(hbarAmount) > 0 && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Approximate value based on current exchange rates
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Review Your Purchase</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Tokens to Buy:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">{buyAmount}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1">HBAR Cost:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">{hbarAmount} HBAR</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption">
                  Please review the details above before confirming your purchase.
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && !loading && (
          <Button onClick={onBack}>
            Back
          </Button>
        )}
        {(!loading || activeStep < 2) && (
          <Button
            onClick={activeStep < 2 ? onNext : onConfirm}
            disabled={disabled || isAmountError || (activeStep === 2 && loading)}
            variant="contained"
            color="primary"
          >
            {activeStep === 2 ? 'Confirm Purchase' : 'Next'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TokenBuyDialog;