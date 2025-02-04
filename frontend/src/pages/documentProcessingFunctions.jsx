import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import CryptoJS from 'crypto-js';
import { tfService } from '../services/tfService';

let model;

const loadSciBERTModel = async () => {
  // Initialize TensorFlow with explicit backend
  await tf.ready();
  await tf.setBackend('cpu');  // Force CPU backend for consistency
  
  try {
    model = await use.load();
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};

// Function to extract text from PDF
const extractTextFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + ' ';
  }
  return text;
};

export const encryptPdfFile = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(arrayBuffer);

  // Convert the file data into a binary string using a more memory-efficient approach
  let fileString = '';
  for (let i = 0; i < fileData.length; i += 1024) {
    fileString += String.fromCharCode.apply(null, fileData.subarray(i, i + 1024));
  }

  const base64Data = btoa(fileString);

  // Generate a random key for the complete document
  const documentKey = CryptoJS.lib.WordArray.random(256 / 8).toString();

  // Encrypt the complete file
  const encryptedDocument = CryptoJS.AES.encrypt(base64Data, documentKey).toString();

  return {
    encryptedDocument,
    documentKey
  };
};



// Function to chunk the document
export const chunkDocument = async (file, chunkSize = 500) => {
  try {
    console.log('Starting text extraction');
    const text = await extractTextFromPdf(file);
    console.log('Text extracted, length:', text.length);
    console.log(text);
    
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    console.log('Chunking complete, number of chunks:', chunks.length);
    return chunks;
  } catch (error) {
    console.error('Error in chunkDocument:', error);
    throw error;
  }
};

export const calculateEmbeddingsAndEncrypt = async (chunks) => {
  try {
    // Calculate embeddings for all chunks
    const embeddings = await tfService.embedText(chunks);
    console.log('Embeddings calculated', embeddings.arraySync());

    // Encrypt chunks and generate keys
    const encryptedChunks = [];
    const encryptionKeys = [];

    chunks.forEach((chunk, index) => {
      // Generate a random encryption key
      const key = CryptoJS.lib.WordArray.random(256 / 8).toString();
      
      // Ensure the chunk is properly encoded before encryption
      const encodedChunk = encodeChunk(chunk);
      
      // Encrypt the chunk
      const encryptedChunk = CryptoJS.AES.encrypt(encodedChunk, key).toString();
      
      encryptedChunks.push(encryptedChunk);
      encryptionKeys.push(key);

      console.log(`Chunk ${index + 1} encrypted with key: ${key}`);
    });

    console.log('All chunks encrypted successfully');
    
    return {
      embeddings: embeddings.arraySync(),
      encryptedChunks,
      encryptionKeys
    };
  } catch (error) {
    console.error('Error in calculateEmbeddingsAndEncrypt:', error);
    throw new Error(`Failed to process chunks: ${error.message}`);
  }
};

// Helper function to properly encode chunk content
const encodeChunk = (chunk) => {
  try {
    // First try UTF-8 encoding
    const encoder = new TextEncoder();
    const encodedArray = encoder.encode(chunk);
    const decodedText = new TextDecoder().decode(encodedArray);
    
    // Remove any problematic characters
    const sanitizedText = decodedText
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\uFFFD/g, ''); // Remove replacement character
    
    return sanitizedText;
  } catch (error) {
    console.error('Error encoding chunk:', error);
    // Fallback to basic string cleaning if encoding fails
    return chunk
      .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '') // Keep only printable ASCII and extended Latin-1
      .trim();
  }
};

export const embedPrompt = async (prompt) => {
  try {
    // Ensure prompt is properly encoded
    const encodedPrompt = encodeChunk(prompt);
    const embeddings = await tfService.embedText(encodedPrompt);
    console.log('Prompt embeddings calculated');
    return embeddings.arraySync();
  } catch (error) {
    console.error('Error in embedPrompt:', error);
    throw new Error(`Failed to embed prompt: ${error.message}`);
  }
};
