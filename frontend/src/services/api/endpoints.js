import { API_URL } from '../../config';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_URL}/api/login`,
        VERIFY_TOKEN: `${API_URL}/api/verify-token`,
        PUBLIC_KEY: `${API_URL}/api/public-key`
    },
    USER: {
        INFO: `${API_URL}/api/user-info`,
        TRANSACTIONS: `${API_URL}/api/user-transactions`
    },
    DOCUMENTS: {
        UPLOAD: `${API_URL}/api/upload`,
        GET_ALL: `${API_URL}/api/get_documents`,
        DELETE: `${API_URL}/api/delete_document`,
        GET_PRICE: `${API_URL}/api/get_document_price`,
        BUY: `${API_URL}/api/buy_document`,
        GET_PDF: `${API_URL}/api/get_document_pdf`,
        GET_CHUNK: `${API_URL}/api/get_chunk`,
        RATE_CHUNK: `${API_URL}/api/rate-chunk-id`,
        GET_CHUNK_RATINGS: `${API_URL}/api/get-chunk-ratings`,
        USER_PURCHASES: `${API_URL}/api/user-purchases`
    },
    CHAT: {
        CONVERSATIONS: `${API_URL}/api/conversations`,
        MESSAGES: `${API_URL}/api/messages`,
        CHAT: `${API_URL}/api/chat`
    }
};