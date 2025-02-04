import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Grid,
  IconButton,
  Chip,
  Collapse,
  Divider,
  CircularProgress,
  styled
} from '@mui/material';
import {
  ExpandMore,
  Description as DescriptionIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Layers as LayersIcon,
  ShoppingCart as ShoppingCartIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import DocumentRatingDisplay from './DocumentRatingDisplay';
import DocumentRating from './DocumentRating';
import { documentService } from '../../services/api/documentService';
import { ApiError } from '../../services/api/errors';
import { API_URL } from '../../config';
import EmptyDocumentState from './EmptyDocumentState';

// Keep all your existing styled components...
const ScrollableContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 180px)',
  overflowY: 'auto',
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.default,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.grey[500],
    },
  },
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(3),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ExpandIconWrapper = styled(Box, {
  shouldForwardProp: prop => prop !== 'isExpanded'
})(({ isExpanded }) => ({
  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.3s ease-in-out',
}));

const ChunkCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
  },
}));

const DocumentPurchases = ({ purchases }) => {
  if (!purchases || purchases.length === 0) {
    return <EmptyDocumentState type="purchases" />;
  }
  const [expandedDocs, setExpandedDocs] = useState({});
  const [selectedChunk, setSelectedChunk] = useState(null);
  const [loadingChunk, setLoadingChunk] = useState(false);
  const [chunkContent, setChunkContent] = useState({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [documentPrice, setDocumentPrice] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [chunkRatings, setChunkRatings] = useState({});
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    const fetchChunkRatings = async () => {
      try {
        setLoadingRatings(true);
        const chunkIds = purchases.flatMap(purchase => 
          purchase.chunks.map(chunk => chunk.chunk_id)
        );

        if (chunkIds.length === 0) return;

        const response = await documentService.getChunkRatings(chunkIds);
        setChunkRatings(response.ratings || {});
      } catch (error) {
        console.error('Error fetching ratings:', error);
      } finally {
        setLoadingRatings(false);
      }
    };

    if (purchases.length > 0) {
      fetchChunkRatings();
    }
  }, [purchases]);

  const toggleExpand = (docId) => {
    setExpandedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const handleChunkClick = async (chunk, event) => {
    if (event.target.closest('.rating-buttons')) {
      return;
    }
    
    if (selectedChunk?.chunk_id === chunk.chunk_id) {
      setSelectedChunk(null);
    } else {
      setSelectedChunk(chunk);
      if (!chunkContent[chunk.chunk_id]) {
        await loadChunkContent(chunk.chunk_id);
      }
    }
  };

  const handleRateChunk = async (chunkId, rating) => {
    try {
      const ratingValue = rating === 'up' ? 1 : rating === 'down' ? -1 : 0;
      await documentService.rateChunk(chunkId, ratingValue);
      
      setChunkRatings(prev => ({
        ...prev,
        [chunkId]: ratingValue
      }));
    } catch (error) {
      console.error('Error rating chunk:', error);
    }
  };

  // Keep all your other existing handlers...
  const loadChunkContent = async (chunkId) => {
    try {
      setLoadingChunk(true);
      const response = await documentService.getChunkContent(chunkId);
      setChunkContent(prev => ({
        ...prev,
        [chunkId]: response.content
      }));
    } catch (error) {
      console.error('Error loading chunk content:', error);
      setChunkContent(prev => ({
        ...prev,
        [chunkId]: 'Failed to load content'
      }));
    } finally {
      setLoadingChunk(false);
    }
  };

  const handleBuyDocument = async (docId) => {
    try {
      const { price } = await documentService.getDocumentPrice(docId);
      setDocumentPrice(price);
      setOpenConfirmDialog(true);
      setPurchaseError(null);
      setSelectedDocumentId(docId);
    } catch (error) {
      console.error('Error getting document price:', error);
      setPurchaseError(ApiError.isApiError(error) ? error.message : 'Failed to get document price');
    }
  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
    setPurchaseError(null);
  };

  const handleConfirmPurchase = async () => {
    try {
      await documentService.buyDocument(selectedDocumentId);
      setOpenConfirmDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error purchasing document:', error);
      setPurchaseError(ApiError.isApiError(error) ? error.message : 'Failed to purchase document');
    }
  };

  const renderChunkRating = (chunk) => (
    <div className="rating-buttons">
      <DocumentRating
        chunkId={chunk.chunk_id}
        initialRating={chunkRatings[chunk.chunk_id]}
        onRate={handleRateChunk}
      />
    </div>
  );

  return (
    <>
      <ScrollableContainer>
        {purchases.map((data) => (
          <StyledCard key={data.document_id} elevation={1}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <DescriptionIcon color="primary" sx={{ fontSize: 28 }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h6" component="h3">
                  {data.document}
                </Typography>
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DocumentRatingDisplay rating={data.rating || 0} />
                  <Chip
                    icon={<LayersIcon />}
                    label={`${data.chunks.length} chunks`}
                    variant="outlined"
                    size="small"
                  />
                  {!data.fullDoc ? (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleBuyDocument(data.document_id)}
                    >
                      Buy Document
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PictureAsPdfIcon />}
                      href={`${API_URL}/api/get_document_pdf?authKey=${localStorage.getItem('authToken')}&documentId=${data.document_id}`}
                      target="_blank"
                    >
                      View PDF
                    </Button>
                  )}
                  <IconButton
                    onClick={() => toggleExpand(data.document_id)}
                    size="small"
                  >
                    <ExpandIconWrapper isExpanded={expandedDocs[data.document_id]}>
                      <ExpandMore />
                    </ExpandIconWrapper>
                  </IconButton>
                </Box>
              </Grid>
            </Grid>

            <Collapse in={expandedDocs[data.document_id]} timeout="auto">
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                {data.chunks.map((chunk, index) => (
                  <ChunkCard
                    key={chunk.chunk_id}
                    elevation={selectedChunk?.chunk_id === chunk.chunk_id ? 3 : 1}
                    onClick={(e) => handleChunkClick(chunk, e)}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight="medium">
                            Chunk {index + 1}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {loadingRatings ? (
                              <CircularProgress size={20} />
                            ) : (
                              <div className="rating-buttons">
                                <DocumentRating
                                  chunkId={chunk.chunk_id}
                                  initialRating={chunkRatings[chunk.chunk_id]}
                                  onRate={handleRateChunk}
                                />
                              </div>
                            )}
                            <Chip
                              icon={<AttachMoneyIcon />}
                              label={chunk.price ? (chunk.price.toFixed(2)/100).toFixed(2) : '0.00'}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          {chunk.content_preview}
                        </Typography>
                      </Grid>

                      <Collapse in={selectedChunk?.chunk_id === chunk.chunk_id}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          {loadingChunk ? (
                            <Box display="flex" justifyContent="center" p={2}>
                              <CircularProgress size={24} />
                            </Box>
                          ) : (
                            <Typography variant="body2">
                              {chunkContent[chunk.chunk_id] || 'Failed to load chunk content'}
                            </Typography>
                          )}
                        </Box>
                      </Collapse>

                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Purchased on: {new Date(chunk.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </ChunkCard>
                ))}
              </Box>
            </Collapse>
          </StyledCard>
        ))}
      </ScrollableContainer>

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
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
                    Price: {(documentPrice?.toFixed(2)) + ' tokens (€' + (documentPrice?.toFixed(2)/100).toFixed(2) + ')'}
                  </Typography>
                </Box>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPurchase}
            color="primary"
            variant="contained"
            disabled={!!purchaseError}
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DocumentPurchases;