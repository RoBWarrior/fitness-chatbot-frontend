import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Uses env var in production, proxy locally
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (username, password) => api.post('/auth/register', { username, password }),
};

export const configAPI = {
    getPersona: () => api.get('/config'),
};

export const chatAPI = {
    // Session management occurs through query now as per logic
    getUserQueries: (userId) => api.get(`/query/sessions/${userId}`),

    // Fetch previous messages for a session
    getHistory: (sessionId) => api.get(`/chat/${sessionId}/history`),

    // Starting a new conversation
    startQuery: (userId, query, useKb = true, useWeb = false) => {
        // FastAPI expects query params when not using a Pydantic body
        return api.post(`/query/?user_id=${userId}&query=${encodeURIComponent(query)}&use_kb=${useKb}&use_web=${useWeb}`);
    },

    // Continuing a conversation
    continueChat: (userId, sessionId, message, useKb = true, useWeb = false) => {
        return api.post(`/chat/${sessionId}?user_id=${userId}&message=${encodeURIComponent(message)}&use_kb=${useKb}&use_web=${useWeb}`);
    },

    // Delete a conversation
    deleteSession: (sessionId) => api.delete(`/chat/${sessionId}`)
};

export const documentAPI = {
    upload: (userId, file) => {
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('file', file);
        return api.post('/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // List user documents
    list: (userId) => api.get(`/upload/${userId}`),

    // Delete a document
    delete: (docId) => api.delete(`/upload/${docId}`)
};
