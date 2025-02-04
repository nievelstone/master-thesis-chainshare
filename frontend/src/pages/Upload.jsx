import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Alert, Paper } from '@mui/material';
import PageContainer from '../components/PageContainer';
import { chunkDocument, calculateEmbeddingsAndEncrypt, encryptPdfFile } from './documentProcessingFunctions';
import { getPublicKey } from '../functions/helpers';
import { KEY_SERVER_URL, KEY_SERVER_PUBLIC_KEY, API_URL } from '../config';
import UploadStepper from '../components/upload/UploadStepper';
import FileSelection from '../components/upload/FileSelection';
import TitleInput from '../components/upload/TitleInput';
import ProcessingStatus from '../components/upload/ProcessingStatus';
import CompletionStatus from '../components/upload/CompletionStatus';
import * as tf from '@tensorflow/tfjs';

const UploadContainer = ({ children }) => (
  <Box
    sx={{
      maxWidth: 800,
      mx: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    }}
  >
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        p: 4,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      {children}
    </Paper>
  </Box>
);

const Upload = () => {
  const [file, setFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [keyServerLink, setKeyServerLink] = useState(KEY_SERVER_URL);
  const [keyServerPublicKey, setkeyServerPublicKey] = useState(KEY_SERVER_PUBLIC_KEY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [encryptionKeys, setEncryptionKeys] = useState([]);
  const [documentKey, setDocumentKey] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([
    { name: 'Chunking document', status: 'pending' },
    { name: 'Downloading embedding model', status: 'pending' },
    { name: 'Calculating embeddings', status: 'pending' },
    { name: 'Finalizing', status: 'pending' },
  ]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setIsComplete(false);
      setError(null);
      setActiveStep(1);
      // Pre-populate title from filename (without .pdf extension)
      const fileName = selectedFile.name.replace('.pdf', '');
      setDocumentTitle(fileName);
    } else {
      setError('Please select a PDF file.');
      setFile(null);
    }
  };

  const handleTitleChange = (event) => {
    setDocumentTitle(event.target.value);
  };

  const handleKeyServerLinkChange = (event) => {
    setKeyServerLink(event.target.value);
  };

  const handleKeyServerPublicKeyChange = (event) => {
    setkeyServerPublicKey(event.target.value);
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  const updateProcessingStep = (stepIndex, newStatus) => {
    setProcessingSteps(prevSteps => 
      prevSteps.map((step, index) => 
        index === stepIndex ? { ...step, status: newStatus } : step
      )
    );
  };

  const handleUpload = async () => {
    if (!file || !documentTitle.trim()) {
      setError('Please select a file and enter a title.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setEncryptionKeys([]);

    try {
      await tf.ready();
      // Encrypt the complete PDF file
      updateProcessingStep(0, 'in-progress');
      setProgress(10);
      console.log('Starting document encryption');
      const { encryptedDocument, documentKey } = await encryptPdfFile(file);
      setDocumentKey(documentKey);
      console.log("Document Key: ", documentKey);
      console.log('Document encryption complete');
      updateProcessingStep(0, 'complete');
      setProgress(20);

      // Process chunks as before
      updateProcessingStep(1, 'in-progress');
      setProgress(30);
      console.log('Starting chunking');
      const chunks = await chunkDocument(file);
      console.log('Chunking complete');
      updateProcessingStep(1, 'complete');
      setProgress(40);

      // Download embedding model and calculate embeddings
      updateProcessingStep(2, 'in-progress');
      setProgress(60);
      console.log('Starting embedding and encryption');
      const { embeddings, encryptedChunks, encryptionKeys } = await calculateEmbeddingsAndEncrypt(chunks);
      console.log('Embedding and encryption complete');
      updateProcessingStep(2, 'complete');
      setProgress(80);

      // Store encryption keys locally
      setEncryptionKeys([...encryptionKeys, documentKey]);

      // Prepare data for server
      const documentId = uuidv4();
      const documentChunks = chunks.map((chunk, index) => ({
        id: uuidv4(),
        embedding: embeddings[index],
        encrypted_content: encryptedChunks[index]
      }));

      // Share with server
      setIsSharing(true);
      updateProcessingStep(3, 'in-progress');
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_URL + '/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chunks: documentChunks,
          encryptedDocument: encryptedDocument,
          authKey: token,
          documentId: documentId,
          documentTitle: documentTitle,
          keyServerPublicKey: keyServerPublicKey
        }),
      });

      if (!response.ok) {
        if(response.status === 409) {
          throw new Error('Document with that name already exists');
        }
        throw new Error('Failed to upload document chunks');
      }

      // Upload keys to the key server
      const keyServerResponse = await fetch(`${keyServerLink}/upload-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chunkIds: documentChunks.map(chunk => chunk.id),
          encryptionKeys: encryptionKeys,
          documentId: documentId,
          documentKey: documentKey,
          publicKey: await getPublicKey()
        }),
      });

      if (!keyServerResponse.ok) {
        throw new Error('Failed to upload keys to the key server');
      }

      updateProcessingStep(3, 'complete');
      setProgress(100);
      setIsComplete(true);
      setActiveStep(3);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(`An error occurred while processing the file: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setIsSharing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setDocumentTitle('');
    setKeyServerLink(KEY_SERVER_URL);
    setkeyServerPublicKey(KEY_SERVER_PUBLIC_KEY);
    setIsProcessing(false);
    setProgress(0);
    setActiveStep(0);
    setIsComplete(false);
    setError(null);
    setShowAdvancedOptions(false);
    setIsSharing(false);
    setProcessingSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
  };

  return (
    <PageContainer title="Upload PDF">
      <UploadContainer>
        <UploadStepper activeStep={activeStep} />
        
        {activeStep === 0 && (
          <FileSelection 
            onFileChange={handleFileChange} 
            file={file} 
          />
        )}
        
        {activeStep === 1 && (
          <TitleInput
            documentTitle={documentTitle}
            onTitleChange={handleTitleChange}
            showAdvancedOptions={showAdvancedOptions}
            onToggleAdvanced={toggleAdvancedOptions}
            keyServerLink={keyServerLink}
            onKeyServerLinkChange={handleKeyServerLinkChange}
            keyServerPublicKey={keyServerPublicKey}
            onKeyServerPublicKeyChange={handleKeyServerPublicKeyChange}
            onNext={() => setActiveStep(2)}
            selectedFile={file}
          />
        )}
        
        {activeStep === 2 && !isProcessing && !isComplete && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            sx={{ mt: 2 }}
          >
            Start Processing
          </Button>
        )}

        {isProcessing && (
          <ProcessingStatus
            progress={progress}
            processingSteps={processingSteps}
            isSharing={isSharing}
          />
        )}

        {isComplete && (
          <CompletionStatus 
            documentTitle={documentTitle}
            onUploadAnother={resetState}
          />
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              width: '100%',
              borderRadius: 2
            }}
          >
            {error}
          </Alert>
        )}
      </UploadContainer>
    </PageContainer>
  );
};

export default Upload;