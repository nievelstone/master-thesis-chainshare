import React, { useState, useEffect } from 'react';
import { Snackbar } from '@mui/material';
import DocumentHeader from '../components/documents/DocumentHeader';
import DocumentGrid from '../components/documents/DocumentGrid';
import DocumentPurchases from '../components/documents/DocumentPurchases';
import LoadingState from '../components/documents/LoadingState';
import ErrorState from '../components/documents/ErrorState';
import { DocumentPageWrapper, ScrollableContent } from '../components/documents/styled/DocumentPageWrapper';
import { documentService } from '../services/api/documentService';
import { ApiError } from '../services/api/errors';

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // Handle initial tab selection from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'purchases') {
      setTabValue(1);
    }
  }, []);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const [documentsData, purchasesData] = await Promise.all([
        documentService.getAllDocuments(),
        documentService.getUserPurchases()
      ]);
  
      setDocuments(documentsData.documents || []);
      setPurchases(purchasesData.purchases || []);
  
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(ApiError.isApiError(error) ? error.message : 'Failed to load documents');
      showSnackbar('Error loading documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteDocument = async (documentName) => {
    try {
      setDeletingDocument(documentName);
      await documentService.deleteDocument(documentName);
      
      showSnackbar(`Successfully deleted ${documentName}`, 'success');
      setDocuments(documents.filter(doc => doc.name !== documentName));
    } catch (error) {
      console.error('Error deleting document:', error);
      showSnackbar(
        ApiError.isApiError(error) ? error.message : 'Failed to delete document',
        'error'
      );
    } finally {
      setDeletingDocument(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <DocumentPageWrapper>
      <DocumentHeader tabValue={tabValue} onTabChange={handleTabChange} />

      <ScrollableContent>
        {tabValue === 0 ? (
          <DocumentGrid 
            documents={documents} 
            onDeleteDocument={deleteDocument}
            deletingDocument={deletingDocument}
          />
        ) : (
          <DocumentPurchases purchases={purchases} />
        )}
      </ScrollableContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </DocumentPageWrapper>
  );
};

export default MyDocuments;