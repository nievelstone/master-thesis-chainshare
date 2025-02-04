import React from 'react';
import { Grid } from '@mui/material';
import DocumentCard from './DocumentCard';
import EmptyDocumentState from './EmptyDocumentState';

const DocumentGrid = ({ documents, onDeleteDocument }) => {
  if (documents.length === 0) {
    return <EmptyDocumentState type="uploads" />;
  }

  return (
    <Grid container spacing={3}>
      {documents.map((document, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <DocumentCard 
            document={document} 
            onDelete={() => onDeleteDocument(document.name)} 
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default DocumentGrid;