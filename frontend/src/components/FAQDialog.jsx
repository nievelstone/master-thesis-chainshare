import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { X } from 'lucide-react';
import FAQ from './FAQ';

const FAQDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'background.default',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <X />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <FAQ />
      </DialogContent>
    </Dialog>
  );
};

export default FAQDialog;