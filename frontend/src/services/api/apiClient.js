import axios from 'axios';
import { API_URL } from '../../config';
import { ApiError, NetworkError, TimeoutError, UnauthorizedError } from './errors';

const RETRY_COUNT = 2;
const TIMEOUT = 20000;

class ApiClient {
    constructor() {
        this.client = axios.create({
            baseURL: API_URL,  // This should be the complete backend URL
            timeout: TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Add timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now()
        };
        return config;
      },
      (error) => Promise.reject(new ApiError(error.message))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          return Promise.reject(new UnauthorizedError());
        }

        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new TimeoutError());
        }

        if (!error.response) {
          return Promise.reject(new NetworkError());
        }

        return Promise.reject(ApiError.fromResponse(error));
      }
    );
  }

  async retryRequest(requestFn, retries = RETRY_COUNT) {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        if (!this.shouldRetry(error)) throw error;
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }

  shouldRetry(error) {
    // Don't retry client errors except timeout
    if (error.status && error.status < 500 && error.status !== 408) {
      return false;
    }
    return true;
  }

  async get(endpoint, params = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.get(endpoint, { 
        ...config,
        params 
      });
      return response.data;
    });
  }

  async post(endpoint, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.post(endpoint, data, config);
      return response.data;
    });
  }

  async put(endpoint, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.put(endpoint, data, config);
      return response.data;
    });
  }

  async delete(endpoint, data = {}, config = {}) {
    return this.retryRequest(async () => {
      const response = await this.client.delete(endpoint, { 
        ...config,
        data 
      });
      return response.data;
    });
  }
}

export const apiClient = new ApiClient();