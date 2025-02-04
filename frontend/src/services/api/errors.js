// API Error Statuses
export const API_ERROR_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    SERVER_ERROR: 500,
    BAD_REQUEST: 400
  };
  
  export class ApiError extends Error {
    constructor(message, status, code) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
      this.timestamp = new Date().toISOString();
    }
  
    static fromResponse(error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'An unknown error occurred';
      const code = error.response?.data?.code;
  
      return new ApiError(message, status, code);
    }
  
    static isApiError(error) {
      return error instanceof ApiError;
    }
  }
  
  export class NetworkError extends ApiError {
    constructor(message = 'Network error occurred') {
      super(message, 0, 'NETWORK_ERROR');
      this.name = 'NetworkError';
    }
  }
  
  export class TimeoutError extends ApiError {
    constructor(message = 'Request timed out') {
      super(message, API_ERROR_CODES.TIMEOUT, 'TIMEOUT_ERROR');
      this.name = 'TimeoutError';
    }
  }
  
  export class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized access') {
      super(message, API_ERROR_CODES.UNAUTHORIZED, 'UNAUTHORIZED');
      this.name = 'UnauthorizedError';
    }
  }