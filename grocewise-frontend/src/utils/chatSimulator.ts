import { ChatMessage, ChatResponse } from '../types/chat';

export function getSimulatedResponse(messages: ChatMessage[]): ChatResponse {
    const userText = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
    let response = 'Posso aiutarti con la gestione dei prodotti nel frigo e suggerimenti di ricette.';

    if (userText.includes('ciao')) response = 'Ciao! Sono il tuo assistente GroceWise.';
    else if (userText.includes('ricetta')) response = 'Posso suggerirti alcune ricette basate sui prodotti nel tuo frigo!';
    else if (userText.includes('scadenza')) response = 'Ti consiglio di consumare prima i prodotti più vicini alla scadenza.';

    return {
        message: response,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        modelUsed: 'simulated',
        isFallback: true
    };
}