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
    modelUsed: string;
    isFallback: boolean;
    functionCalls?: ToolCall[];
}

export interface ChatRequest {
    messages: ChatMessage[];
}

export interface ToolCall {
    name: string;
    args: Record<string, any>;
}