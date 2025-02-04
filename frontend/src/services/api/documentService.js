import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

class DocumentService {
  async getAllDocuments() {
    const token = localStorage.getItem('authToken');
    return apiClient.get(`${API_ENDPOINTS.DOCUMENTS.GET_ALL}`, {
      authKey: token
    });
  }

  async getUserPurchases() {
    return apiClient.get(API_ENDPOINTS.DOCUMENTS.USER_PURCHASES);
  }

  async uploadDocument(documentData) {
    return apiClient.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, documentData);
  }

  async deleteDocument(documentName) {
    const token = localStorage.getItem('authToken');
    return apiClient.post(API_ENDPOINTS.DOCUMENTS.DELETE, {
      authKey: token,
      documentName
    });
  }

  async getDocumentPrice(documentId) {
    const token = localStorage.getItem('authToken');
    return apiClient.post(API_ENDPOINTS.DOCUMENTS.GET_PRICE, {
      authKey: token,
      documentId
    });
  }

  async buyDocument(documentId) {
    const token = localStorage.getItem('authToken');
    return apiClient.post(API_ENDPOINTS.DOCUMENTS.BUY, {
      authKey: token,
      documentId
    });
  }

  async getDocumentPdf(documentId) {
    const token = localStorage.getItem('authToken');
    const url = `${API_ENDPOINTS.DOCUMENTS.GET_PDF}?authKey=${token}&documentId=${documentId}`;
    return apiClient.get(url, {}, {
      responseType: 'blob'
    });
  }

  async getChunkContent(chunkId) {
    const token = localStorage.getItem('authToken');
    return apiClient.get(`/api/get_chunk`, {
      authKey: token,
      chunkId
    });
  }

  async rateChunk(chunkId, rating) {
    const token = localStorage.getItem('authToken');
    return apiClient.post('/api/rate-chunk-id', {
      chunkId,
      rating,
      authKey: token
    });
  }

  async getChunkRatings(chunkIds) {
    const token = localStorage.getItem('authToken');
    return apiClient.post('/api/get-chunk-ratings', {
      chunkIds
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}

export const documentService = new DocumentService();