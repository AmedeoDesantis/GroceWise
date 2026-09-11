import { ChatMessage, ChatResponse } from '../types/chat';

export function getSimulatedResponse(messages: ChatMessage[]): ChatResponse {
    const userText = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
    let response = 'I can help you with fridge product management and recipe suggestions.';

    if (userText.includes('hello') || userText.includes('hi')) response = 'Hello! I am your GroceWise assistant.';
    else if (userText.includes('recipe')) response = 'I can suggest some recipes based on products in your fridge!';
    else if (userText.includes('expiration') || userText.includes('expiry')) response = 'I recommend consuming products closer to expiration first.';

    return {
        message: response,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        modelUsed: 'simulated',
        isFallback: true
    };
}