import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export const authService = {
  verifyAuthToken: async (token) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_TOKEN, { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify token');
    }
  },
  
  // Add new auth-related methods here
  login: async (address, message, signature) => {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      address,
      message,
      signature
    });
  },

  getPublicKey: async () => {
    return apiClient.get(API_ENDPOINTS.AUTH.PUBLIC_KEY);
  }
};
