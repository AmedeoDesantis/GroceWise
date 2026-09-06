import axios, { AxiosInstance } from 'axios';
import {
    GEMINI_API_KEY,
    GEMINI_FLASH_MODEL,
    GEMINI_PRO_MODEL
} from '../../constants/config';
import FridgeAPI from './fridgeAPI';
import AnalyticsAPI from './analyticsAPI';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponse {
    message: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    modelUsed?: string;
    isFallback?: boolean;
    functionCalls?: any[];
}

// Definizione delle funzioni che Gemini può chiamare
const functionDeclarations = [
    {
        name: 'getProducts',
        description: 'Ottieni la lista dei prodotti nel frigo',
        parameters: {
            type: 'OBJECT',
            properties: {
                filter: {
                    type: 'STRING',
                    description: 'Filtro per tipo di prodotti (all, unconsumed, consumed)',
                    enum: ['all', 'unconsumed', 'consumed']
                }
            }
        }
    },
    {
        name: 'getAnalytics',
        description: 'Ottieni le statistiche di consumo',
        parameters: {
            type: 'OBJECT',
            properties: {
                startDate: {
                    type: 'STRING',
                    description: 'Data di inizio nel formato YYYY-MM-DD'
                },
                endDate: {
                    type: 'STRING',
                    description: 'Data di fine nel formato YYYY-MM-DD'
                }
            }
        }
    },
    {
        name: 'addProduct',
        description: 'Aggiungi un nuovo prodotto al frigo',
        parameters: {
            type: 'OBJECT',
            properties: {
                barcode: {
                    type: 'STRING',
                    description: 'Codice a barre del prodotto'
                },
                price: {
                    type: 'NUMBER',
                    description: 'Prezzo del prodotto'
                },
                buyDate: {
                    type: 'STRING',
                    description: 'Data di acquisto nel formato YYYY-MM-DD'
                }
            },
            required: ['barcode']
        }
    }
];

class ChatAPI {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: 'https://generativelanguage.googleapis.com/v1beta',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
        try {
            // Se non è configurata un'API, simuliamo una risposta
            if (!GEMINI_API_KEY || GEMINI_API_KEY === '') {
                return { ...this.getSimulatedResponse(messages), isFallback: true };
            }

            const flashResponse = await this.callGeminiWithFunctions(messages, GEMINI_FLASH_MODEL);

            if (this.isGoodResponse(flashResponse)) {
                return { ...flashResponse, modelUsed: GEMINI_FLASH_MODEL, isFallback: false };
            }

            const proResponse = await this.callGeminiWithFunctions(messages, GEMINI_PRO_MODEL);
            return { ...proResponse, modelUsed: GEMINI_PRO_MODEL, isFallback: false };

        } catch (error: any) {
            console.error('Errore nella chiamata Gemini API:', error);

            // Gestione errore 503 con retry automatico
            if (error.response?.status === 503) {
                console.log('Errore 503 - Server Gemini troppo pieno, attendo 10 secondi e riprovo...');
                await this.sleep(10000);

                try {
                    const flashResponse = await this.callGeminiWithFunctions(messages, GEMINI_FLASH_MODEL);
                    if (this.isGoodResponse(flashResponse)) {
                        return { ...flashResponse, modelUsed: GEMINI_FLASH_MODEL, isFallback: false };
                    }

                    const proResponse = await this.callGeminiWithFunctions(messages, GEMINI_PRO_MODEL);
                    return { ...proResponse, modelUsed: GEMINI_PRO_MODEL, isFallback: false };
                } catch (retryError) {
                    console.error('Errore anche nel retry:', retryError);
                    return { ...this.getSimulatedResponse(messages), isFallback: true };
                }
            }

            return { ...this.getSimulatedResponse(messages), isFallback: true };
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async callGeminiWithFunctions(messages: ChatMessage[], model: string): Promise<ChatResponse> {
        try {
            // Convertiamo i messaggi nel formato Gemini
            const contents = messages
                .filter(msg => msg.role !== 'system')
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

            const systemPrompt =
                `Sei l'assistente AI ufficiale di GroceWise, un consulente esperto nella gestione del frigorifero, nell'ottimizzazione del budget e nella nutrizione. Il tuo obiettivo è aiutare l'utente a ridurre gli sprechi alimentari, cucinare in modo creativo e fare spese intelligenti.
REGOLE OPERATIVE:
1. Analisi Reale: Usa sempre la funzione 'getProducts' per verificare l'effettiva disponibilità nel frigo prima di suggerire ricette o liste della spesa. Non inventare ingredienti.
2. Focus Anti-Spreco: Dai priorità assoluta ai prodotti vicini alla scadenza o già aperti quando suggerisci cosa cucinare.
3. Intelligenza Economica: Sfrutta 'getAnalytics' per analizzare le abitudini di consumo. Agisci come consulente economico suggerendo alternative più economiche o con un miglior rapporto sazietà/costo se noti inefficienze.
4. Proattività: Non limitarti a rispondere a monosillabi. Se l'utente chiede "cosa mangio?", offri un paio di opzioni precise basate su ciò che ha, e chiedi se preferisce un pasto veloce o elaborato.
5. Tono: Sii conciso, brillante e incoraggiante. Usa elenchi puntati per presentare ricette o statistiche in modo facilmente leggibile.
6. Rispondi in PlainText, no formattazioni Markdown, quindi NO  ** per il grassetto o corsivo, # per i titoli, tabelle o link. SOLO TESTO.`

            const response = await this.api.post(
                `/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: contents,
                    tools: [{
                        functionDeclarations: functionDeclarations
                    }],
                    generationConfig: {
                        maxOutputTokens: 500,
                        temperature: 0.7,
                    }
                }
            );

            const data = response.data;

            // Salviamo l'array 'parts' ESATTO restituito dal modello per conservare il thought_signature
            const originalModelParts = data.candidates?.[0]?.content?.parts || [];

            // Controlliamo se ci sono chiamate a funzioni
            const functionCalls = originalModelParts
                .filter((part: any) => part.functionCall)
                .map((part: any) => part.functionCall);

            if (functionCalls.length > 0) {
                const functionResults = await this.executeFunctionCalls(functionCalls);

                // Facciamo una seconda chiamata con i risultati delle funzioni
                const secondResponse = await this.api.post(
                    `/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        systemInstruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        contents: [
                            ...contents,
                            {
                                role: 'model',
                                parts: originalModelParts
                            },
                            {
                                role: 'user',
                                parts: functionCalls.map((call: any, index: number) => ({
                                    functionResponse: {
                                        name: call.name,
                                        id: call.id,
                                        response: { data: functionResults[index] }
                                    }
                                }))
                            }
                        ],
                        generationConfig: {
                            maxOutputTokens: 500,
                            temperature: 0.7,
                        }
                    }
                );

                const message = secondResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const usage = secondResponse.data.usageMetadata;

                return {
                    message: message,
                    usage: {
                        prompt_tokens: usage?.promptTokenCount || 0,
                        completion_tokens: usage?.candidatesTokenCount || 0,
                        total_tokens: usage?.totalTokenCount || 0,
                    },
                    functionCalls: functionCalls,
                };
            }

            // Se non ci sono chiamate a funzioni, restituiamo la risposta diretta
            const message = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const usage = data.usageMetadata;

            return {
                message: message,
                usage: {
                    prompt_tokens: usage?.promptTokenCount || 0,
                    completion_tokens: usage?.candidatesTokenCount || 0,
                    total_tokens: usage?.totalTokenCount || 0,
                },
            };
        } catch (error) {
            console.error(`Errore nella chiamata a Gemini ${model}:`, error);
            throw error;
        }
    }

    private async executeFunctionCalls(functionCalls: any[]): Promise<any[]> {
        const results: any[] = [];

        for (const call of functionCalls) {
            try {
                let result;
                switch (call.name) {

                    case 'getProducts':
                        const filter = call.args?.filter || 'all';
                        switch (filter) {
                            case 'unconsumed':
                                result = await FridgeAPI.getUnconsumedProducts();
                                break;
                            case 'consumed':
                                result = await FridgeAPI.getConsumedProducts();
                                break;
                            default:
                                result = await FridgeAPI.getAllProducts();
                        }
                        break;

                    case 'getAnalytics':
                        const startDate = call.args?.startDate || this.getDefaultStartDate();
                        const endDate = call.args?.endDate || this.getDefaultEndDate();
                        result = await AnalyticsAPI.getConsumptionAnalytics(startDate, endDate);
                        break;

                    case 'addProduct':
                        const barcode = call.args?.barcode;
                        const price = call.args?.price || 0;
                        const buyDate = call.args?.buyDate;
                        const productId = await FridgeAPI.addProduct(barcode, price, buyDate);
                        result = { productId, success: true };
                        break;

                    default:
                        result = { error: `Funzione ${call.name} non implementata` };
                }

                results.push(result);
            } catch (error) {
                console.error(`Errore nell'esecuzione della funzione ${call.name}:`, error);
                results.push({ error: 'Errore nell\'esecuzione' });
            }
        }

        return results;
    }

    private getDefaultStartDate(): string {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }

    private getDefaultEndDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    private isGoodResponse(response: ChatResponse): boolean {
        // Logica semplice per determinare se la risposta è buona
        const message = response.message.toLowerCase();

        // Se la risposta è troppo corta o sembra incompleta, non è buona
        if (response.message.length < 50) {
            return false;
        }

        // Se contiene frasi che indicano incertezza, non è buona
        const uncertainPhrases = [
            'non sono sicuro',
            'non ho informazioni',
            'non posso aiutare',
            'mi dispiace ma',
            'non ho capito'
        ];

        return !uncertainPhrases.some(phrase => message.includes(phrase));
    }

    private getSimulatedResponse(messages: ChatMessage[]): ChatResponse {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const userText = lastUserMessage?.content.toLowerCase() || '';

        // Risposte simulate basate sul contesto dell'app GroceWise
        let response = '';

        if (userText.includes('ciao') || userText.includes('salve')) {
            response = 'Ciao! Sono il tuo assistente GroceWise. Posso aiutarti a gestire i prodotti nel tuo frigo, suggerirti ricette o darti consigli sui consumi. Come posso aiutarti oggi?';
        } else if (userText.includes('ricetta') || userText.includes('cucinare')) {
            response = 'Posso suggerirti alcune ricette basate sui prodotti nel tuo frigo! Controlla quali prodotti hai disponibili e posso proporti idee creative per utilizzarli. Vuoi che ti dia qualche suggerimento specifico?';
        } else if (userText.includes('scadenza') || userText.includes('scaduto')) {
            response = 'È importante controllare le scadenze! Ti consiglio di ordinare i prodotti per data di scadenza e consumare prima quelli più vicini alla scadenza. Vuoi che ti aiuti a organizzare i prodotti nel frigo?';
        } else if (userText.includes('consumo') || userText.includes('statistica')) {
            response = 'Puoi visualizzare le tue statistiche di consumo nella sezione "Statistiche Consumi" dell\'app. Lì troverai grafici e analisi dettagliate su come utilizzi i prodotti. C\'è qualcosa di specifico che vuoi sapere?';
        } else if (userText.includes('aiuto') || userText.includes('help')) {
            response = 'Sono qui per aiutarti! Posso:\n- Suggerire ricette con i tuoi prodotti\n- Dare consigli sulla gestione del frigo\n- Spiegarti come funziona l\'app\n- Aiutarti con le statistiche\n\nCosa vuoi sapere?';
        } else {
            response = 'Grazie per il messaggio! Come assistente GroceWise, sono specializzato in aiutarti con la gestione dei prodotti nel frigo, suggerimenti di ricette e analisi dei consumi. Posso aiutarti con uno di questi argomenti?';
        }

        return {
            message: response,
            usage: {
                prompt_tokens: userText.length,
                completion_tokens: response.length,
                total_tokens: userText.length + response.length,
            },
            modelUsed: 'simulated',
        };
    }
}

export default new ChatAPI();