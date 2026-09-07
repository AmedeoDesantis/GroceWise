import axios from 'axios';
import { GEMINI_API_KEY } from '../../constants/chat';
import { QuotaExceededError, ServerOverloadedError } from '@/src/types/errors';

const api = axios.create({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

export async function generateContent(model: string, payload: any) {
    try {
        if (!GEMINI_API_KEY) throw new Error('API Key mancante');
        const response = await api.post(`/models/${model}:generateContent?key=${GEMINI_API_KEY}`, payload);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 503) {
            throw new ServerOverloadedError();
        }
        if (error.response?.status === 429) {
            throw new QuotaExceededError();
        }
        throw error;
    }
}