import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export const userService = {
  async getUserInfo() {
    return apiClient.get(API_ENDPOINTS.USER.INFO);
  },

  async getUserTransactions() {
    return apiClient.get(API_ENDPOINTS.USER.TRANSACTIONS);
  }
};
