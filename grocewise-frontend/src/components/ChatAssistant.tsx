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
import { ChatMessage, ChatResponse } from '../types/chat';
import ChatService from '../services/chatService';

type ChatStatus = 'idle' | 'loading' | 'success' | 'error';
import { colors, spacing, borderRadius, typography } from '../styles/commonStyles';

interface ChatAssistantProps {
    onClose?: () => void;
}

export default function ChatAssistant({ onClose }: ChatAssistantProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Hello! I am your GroceWise assistant. I can help you manage products in your fridge, suggest recipes, or give you advice on consumption. How can I help you today?',
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
            const response = await ChatService.sendMessage(newMessages);
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
            console.error('Error sending message:', error);

            // Handle 503 error to show user we are retrying
            if (error.response?.status === 503) {
                setIsRetrying(true);
                setErrorMessage('Gemini server too busy, waiting 10 seconds and retrying...');

                // Wait a bit to give API time to retry
                await new Promise(resolve => setTimeout(resolve, 500));

                try {
                    const response = await ChatService.sendMessage(newMessages);
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
                        content: 'Sorry, even after retry an error occurred. Please try again later.',
                    };
                    setMessages([...newMessages, errorMessage]);
                    setStatus('error');
                    setErrorMessage('Unable to connect to AI service after retry.');
                    setIsFallback(true);
                }
            } else {
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: 'Sorry, an error occurred. Please try again.',
                };
                setMessages([...newMessages, errorMessage]);
                setStatus('error');
                setErrorMessage('Connection error with AI service.');
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
                content: 'Hello! I am your GroceWise assistant. I can help you manage products in your fridge, suggest recipes, or give you advice on consumption. How can I help you today?',
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
                    <Text style={styles.headerTitle}>AI Assistant</Text>
                    {status !== 'idle' && (
                        <View style={styles.statusContainer}>
                            {status === 'loading' && (
                                <View style={styles.statusLoading}>
                                    <ActivityIndicator size="small" color={colors.primary} />
                                    <Text style={styles.statusText}>
                                        {isRetrying ? 'Retry (503)...' : 'Loading...'}
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
                        <Text style={styles.headerButtonText}>New Chat</Text>
                    </TouchableOpacity>
                    {onClose && (
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Text style={styles.headerButtonText}>Close</Text>
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
                        {isFallback ? 'Fallback (simulated response)' : `Gemini: ${modelUsed}`}
                    </Text>
                </View>
            )}

            {functionCalls.length > 0 && (
                <View style={styles.functionCallsInfo}>
                    <Text style={styles.functionCallsTitle}>Functions called:</Text>
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
                    placeholder="Write a message..."
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
                    <Text style={styles.sendButtonText}>Send</Text>
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