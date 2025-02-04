import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

class ChatService {
    async getConversations() {
        return apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS);
    }

    async createConversation(name, id) {
        return apiClient.post(API_ENDPOINTS.CHAT.CONVERSATIONS, {
            name,
            id
        });
    }

    async deleteConversation(conversationId) {
        return apiClient.delete(`${API_ENDPOINTS.CHAT.CONVERSATIONS}/${conversationId}`);
    }

    async getMessages(conversationId) {
        return apiClient.get(`${API_ENDPOINTS.CHAT.CONVERSATIONS}/${conversationId}/messages`);
    }

    async sendMessage(messageData) {
        return apiClient.post(API_ENDPOINTS.CHAT.MESSAGES, messageData);
    }

    async sendChatRequest(conversationId, message, embeddedPrompt) {
        return apiClient.post(API_ENDPOINTS.CHAT.CHAT, {
            conversation_id: conversationId,
            message,
            embeddedPrompt
        });
    }

    // Helper method to handle streaming responses
    async streamChatResponse(conversationId, message, embeddedPrompt, onChunk) {
        const response = await fetch(`${API_ENDPOINTS.CHAT.CHAT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                message,
                embeddedPrompt
            })
        });
    
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
    
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
    
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            // Keep the last incomplete line in the buffer
            buffer = lines.pop() || '';
    
            for (const line of lines) {
                if (line.trim() === '') continue;
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
    
                    try {
                        const parsed = JSON.parse(data);
                        onChunk(parsed);
                    } catch (e) {
                        console.warn('Skipping malformed JSON:', data);
                        continue;
                    }
                }
            }
        }
    }
}

export const chatService = new ChatService();