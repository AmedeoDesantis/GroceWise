import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { ChatMessage, ChatResponse } from '../../types/chat';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 45000,
});

const ChatAPI = {
    async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
        const response = await api.post<ChatResponse>('/agent/chat', { messages });
        return response.data;
    }
};

export default ChatAPI;