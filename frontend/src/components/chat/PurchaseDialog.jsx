import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const PurchaseDialog = ({
  open,
  onClose,
  documentPrice,
  purchaseError,
  onConfirm
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="purchase-confirmation-dialog"
    >
      <DialogTitle id="purchase-confirmation-dialog">
        Confirm Document Purchase
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {purchaseError ? (
            <Typography color="error">{purchaseError}</Typography>
          ) : (
            <>
              Are you sure you want to purchase this document?
              <Box mt={2}>
                <Typography variant="subtitle1">
                  Price: {(documentPrice?.toFixed(2)) + ' tokens (€' + (documentPrice?.toFixed(2) / 100).toFixed(2) + ')'}
                </Typography>
              </Box>
            </>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          disabled={!!purchaseError}
        >
          Confirm Purchase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseDialog;