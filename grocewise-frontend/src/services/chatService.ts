import { GEMINI_FLASH_MODEL, GEMINI_PRO_MODEL, SYSTEM_PROMPT, functionDeclarations } from '../constants/chat';
import { ChatMessage, ChatResponse } from '../types/chat';
import { ServerOverloadedError, QuotaExceededError } from '../types/errors';
import { generateContent } from './api/GeminiAPI';
import { getSimulatedResponse } from '../utils/chatSimulator';
import FridgeAPI from './api/fridgeAPI';
import AnalyticsAPI from './api/analyticsAPI';
import { sleep } from '../utils/async';

class ChatService {
    async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
        try {
            return await this.processChatRound(messages);
        } catch (error) {

            if (error instanceof ServerOverloadedError) {
                console.warn('Server Occupato. Attendo 10 secondi per il retry...');
                await sleep(10000);

                try {
                    return await this.processChatRound(messages);
                } catch (retryError) {
                    console.error('Fallito anche il retry:', retryError);
                    return getSimulatedResponse(messages);
                }
            }

            if (error instanceof QuotaExceededError) {
                console.warn('Chiamate API terminate. Passaggio immediato al simulatore offline.');
                return getSimulatedResponse(messages);
            }

            console.error('Errore imprevisto in ChatService:', error);
            return getSimulatedResponse(messages);
        }
    }

    /**
     * Contiene l'intero flusso di logica del singolo round (Flash -> Tool -> Pro)
     * Isolato qui per poter essere richiamato facilmente durante il retry.
     */
    private async processChatRound(messages: ChatMessage[]): Promise<ChatResponse> {
        const contents = messages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        const payload = {
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            tools: [{ functionDeclarations }],
            generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        };

        const flashData = await generateContent(GEMINI_FLASH_MODEL, payload);
        const originalParts = flashData.candidates?.[0]?.content?.parts || [];
        const functionCalls = originalParts.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);

        if (functionCalls.length > 0) {
            const functionResults = await this.executeDomainTools(functionCalls);

            const secondPayload = {
                ...payload,
                contents: [
                    ...contents,
                    { role: 'model', parts: originalParts },
                    {
                        role: 'user',
                        parts: functionCalls.map((call: any, index: number) => ({
                            functionResponse: { name: call.name, response: { data: functionResults[index] } }
                        }))
                    }
                ]
            };

            const proData = await generateContent(GEMINI_PRO_MODEL, secondPayload);
            return this.formatResponse(proData, GEMINI_PRO_MODEL, functionCalls);
        }

        const flashMessage = flashData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (this.isGoodResponse(flashMessage)) {
            return this.formatResponse(flashData, GEMINI_FLASH_MODEL);
        }

        const fallbackProData = await generateContent(GEMINI_PRO_MODEL, payload);
        return this.formatResponse(fallbackProData, GEMINI_PRO_MODEL);
    }

    private async executeDomainTools(calls: any[]): Promise<any[]> {
        return Promise.all(calls.map(async (call) => {
            try {
                switch (call.name) {
                    case 'getProducts':
                        const filter = call.args?.filter || 'all';
                        if (filter === 'unconsumed') return await FridgeAPI.getUnconsumedProducts();
                        if (filter === 'consumed') return await FridgeAPI.getConsumedProducts();
                        return await FridgeAPI.getAllProducts();
                    case 'getAnalytics':
                        return await AnalyticsAPI.getConsumptionAnalytics(call.args?.startDate, call.args?.endDate);
                    case 'addProduct':
                        const id = await FridgeAPI.addProduct(call.args?.barcode, call.args?.price, call.args?.buyDate);
                        return { productId: id, success: true };
                    default:
                        return { error: 'Tool non supportato' };
                }
            } catch (error) {
                console.error(`Errore nell'esecuzione del tool ${call.name}:`, error);
                return { error: 'Fallimento esecuzione tool' };
            }
        }));
    }

    private formatResponse(data: any, modelUsed: string, functionCalls?: any[]): ChatResponse {
        return {
            message: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
            usage: {
                prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
                completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
                total_tokens: data.usageMetadata?.totalTokenCount || 0,
            },
            modelUsed,
            isFallback: false,
            functionCalls
        };
    }

    private isGoodResponse(message: string): boolean {
        if (message.length < 50) return false;
        const uncertainPhrases = ['non sono sicuro', 'non ho informazioni', 'non posso aiutare', 'mi dispiace ma'];
        return !uncertainPhrases.some(phrase => message.toLowerCase().includes(phrase));
    }
}

export default new ChatService();