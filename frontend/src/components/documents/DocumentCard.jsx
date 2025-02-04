import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  LinearProgress,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  InsertDriveFile as InsertDriveFileIcon,
  Delete as DeleteIcon,
  Euro as EuroIcon,
} from '@mui/icons-material';
import DocumentRatingDisplay from './DocumentRatingDisplay';
import { StyledCard } from './styled/DocumentPageWrapper';
import { Info } from 'lucide-react';

const DocumentCard = ({ document, onDelete, isDeleting }) => (
  <StyledCard>
    <CardContent sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <InsertDriveFileIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <DocumentRatingDisplay 
            rating={document.rating} 
            upvotes={document.upvotes}
            downvotes={document.downvotes}
          />
          <IconButton
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={24} />
            ) : (
              <DeleteIcon />
            )}
          </IconButton>
        </Box>
      </div>

      <Typography variant="h6" component="h2" gutterBottom>
        {document.name}
      </Typography>

      <Box mb={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2">
            Reveal Status
          </Typography>
          <Tooltip
            title={
              "Documents are fully encrypted when uploaded (0% revealed). The reveal percentage shows how much of the document has been decrypted through purchases. A higher percentage means more users have paid to access parts of your document."
            }
            arrow
            placement="top"
          >
            <IconButton size="small">
              <Info size={16} />
            </IconButton>
          </Tooltip>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(100 - document.encrypted_percentage).toFixed(2)}
          sx={{ height: 10, borderRadius: 5 }}
        />
        <Typography variant="body2" sx={{ mt: 1 }}>
          {(100 - document.encrypted_percentage).toFixed(2)}% revealed
        </Typography>
      </Box>

      <Box mt="auto">
        <Tooltip
          title="The total amount of rewards you've earned from this document"
          arrow
          placement="bottom"
        >
        <Chip
          icon={<EuroIcon sx={{ fontSize: 16 }} />}
          label={`Reward: ${(document.total_reward.toFixed(2) / 100)?.toFixed(2)}`}
          color="secondary"
        />
        </Tooltip>
      </Box>
    </CardContent>
  </StyledCard>
);

export default DocumentCard;