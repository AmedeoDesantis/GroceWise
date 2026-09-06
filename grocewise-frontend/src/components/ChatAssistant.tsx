import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import ChatAPI, { ChatMessage, ChatResponse } from '../services/api/chatAPI';

type ChatStatus = 'idle' | 'loading' | 'success' | 'error';
import { colors, spacing, borderRadius, typography } from '../styles/commonStyles';

interface ChatAssistantProps {
    onClose?: () => void;
}

export default function ChatAssistant({ onClose }: ChatAssistantProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Ciao! Sono il tuo assistente GroceWise. Posso aiutarti a gestire i prodotti nel tuo frigo, suggerirti ricette o darti consigli sui consumi. Come posso aiutarti oggi?',
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [status, setStatus] = useState<ChatStatus>('idle');
    const [modelUsed, setModelUsed] = useState<string>('');
    const [isFallback, setIsFallback] = useState<boolean>(false);
    const [functionCalls, setFunctionCalls] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputText.trim(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputText('');
        setIsLoading(true);
        setIsRetrying(false);
        setStatus('loading');
        setErrorMessage('');
        setModelUsed('');

        try {
            setIsRetrying(false);
            const response = await ChatAPI.sendMessage(newMessages);
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.message,
            };
            setMessages([...newMessages, assistantMessage]);
            setStatus('success');
            setModelUsed(response.modelUsed || 'unknown');
            setIsFallback(response.isFallback || false);
            setFunctionCalls(response.functionCalls || []);
        } catch (error: any) {
            console.error('Errore nell\'invio del messaggio:', error);

            // Gestione errore 503 per mostrare all'utente che stiamo riprovando
            if (error.response?.status === 503) {
                setIsRetrying(true);
                setErrorMessage('Server Gemini troppo pieno, attendo 10 secondi e riprovo...');

                // Aspettiamo un po' per dare tempo all'API di fare il retry
                await new Promise(resolve => setTimeout(resolve, 500));

                try {
                    const response = await ChatAPI.sendMessage(newMessages);
                    const assistantMessage: ChatMessage = {
                        role: 'assistant',
                        content: response.message,
                    };
                    setMessages([...newMessages, assistantMessage]);
                    setStatus('success');
                    setModelUsed(response.modelUsed || 'unknown');
                    setIsFallback(response.isFallback || false);
                    setFunctionCalls(response.functionCalls || []);
                } catch (retryError) {
                    const errorMessage: ChatMessage = {
                        role: 'assistant',
                        content: 'Mi dispiace, anche dopo il retry si è verificato un errore. Per favore riprova più tardi.',
                    };
                    setMessages([...newMessages, errorMessage]);
                    setStatus('error');
                    setErrorMessage('Impossibile connettersi al servizio AI dopo il retry.');
                    setIsFallback(true);
                }
            } else {
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: 'Mi dispiace, si è verificato un errore. Per favore riprova.',
                };
                setMessages([...newMessages, errorMessage]);
                setStatus('error');
                setErrorMessage('Si è verificato un errore di connessione con il servizio AI.');
                setIsFallback(true);
            }
        } finally {
            setIsLoading(false);
            setIsRetrying(false);
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: 'Ciao! Sono il tuo assistente GroceWise. Posso aiutarti a gestire i prodotti nel tuo frigo, suggerirti ricette o darti consigli sui consumi. Come posso aiutarti oggi?',
            },
        ]);
        setStatus('idle');
        setIsRetrying(false);
        setModelUsed('');
        setIsFallback(false);
        setFunctionCalls([]);
        setErrorMessage('');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>Assistente AI</Text>
                    {status !== 'idle' && (
                        <View style={styles.statusContainer}>
                            {status === 'loading' && (
                                <View style={styles.statusLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={styles.statusText}>
                                        {isRetrying ? 'Retry (503)...' : 'Caricamento...'}
                                    </Text>
                                </View>
                            )}
                            {status === 'success' && (
                                <View style={styles.statusSuccess}>
                                    <Text style={styles.statusText}>✓</Text>
                                </View>
                            )}
                            {status === 'error' && (
                                <View style={styles.statusError}>
                                    <Text style={styles.statusText}>✕</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Nuova chat</Text>
                    </TouchableOpacity>
                    {onClose && (
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Text style={styles.headerButtonText}>Chiudi</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {status === 'error' && errorMessage && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            )}

            {modelUsed !== '' && (
                <View style={[
                    styles.modelInfo,
                    isFallback && styles.modelInfoFallback
                ]}>
                    <Text style={[
                        styles.modelInfoText,
                        isFallback && styles.modelInfoTextFallback
                    ]}>
                        {isFallback ? '⚠️ Fallback (risposta simulata)' : `🤖 Gemini: ${modelUsed}`}
                    </Text>
                </View>
            )}

            {functionCalls.length > 0 && (
                <View style={styles.functionCallsInfo}>
                    <Text style={styles.functionCallsTitle}>Funzioni chiamate:</Text>
                    {functionCalls.map((call, index) => (
                        <Text key={index} style={styles.functionCallText}>
                            • {call.name}
                        </Text>
                    ))}
                </View>
            )}

            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageBubble,
                            message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                            ]}
                        >
                            {message.content}
                        </Text>
                    </View>
                ))}
                {isLoading && (
                    <View style={[styles.messageBubble, styles.assistantMessage]}>
                        <ActivityIndicator color={colors.primary} size="small" />
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Scrivi un messaggio..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    maxLength={500}
                    editable={!isLoading}
                />
                <TouchableOpacity
                    onPress={handleSendMessage}
                    style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                    disabled={!inputText.trim() || isLoading}
                >
                    <Text style={styles.sendButtonText}>Invia</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.white,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    headerTitle: {
        ...typography.h3,
        color: colors.text,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    statusSuccess: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusError: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        ...typography.small,
        color: colors.text,
        fontWeight: '600',
    },
    errorBanner: {
        backgroundColor: colors.error,
        padding: spacing.md,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        borderRadius: borderRadius.md,
    },
    errorText: {
        ...typography.small,
        color: colors.white,
    },
    modelInfo: {
        backgroundColor: colors.lightBg,
        padding: spacing.sm,
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modelInfoFallback: {
        backgroundColor: colors.warning,
        borderColor: colors.warning,
    },
    modelInfoText: {
        ...typography.small,
        color: colors.textSecondary,
    },
    modelInfoTextFallback: {
        color: colors.white,
        fontWeight: '600',
    },
    functionCallsInfo: {
        backgroundColor: colors.lightBg,
        padding: spacing.sm,
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    functionCallsTitle: {
        ...typography.small,
        color: colors.text,
        fontWeight: '600',
        marginBottom: spacing.xs,
    },
    functionCallText: {
        ...typography.small,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    headerButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    headerButtonText: {
        ...typography.small,
        color: colors.primary,
        fontWeight: '600',
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: colors.background,
    },
    messagesContent: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
    },
    assistantMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.lightBg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageText: {
        ...typography.body,
        lineHeight: 22,
    },
    userMessageText: {
        color: colors.white,
    },
    assistantMessageText: {
        color: colors.text,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing.lg,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: colors.lightBg,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        maxHeight: 100,
        ...typography.body,
        color: colors.text,
    },
    sendButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.textSecondary,
    },
    sendButtonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600',
    },
});