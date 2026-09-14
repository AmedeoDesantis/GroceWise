import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { ChatMessage, ToolCall } from '../types/chat';
import ChatAPI from '../services/api/chatAPI';
import { colors, spacing, borderRadius, typography } from '../styles/commonStyles';

interface ChatAssistantProps {
    onClose?: () => void;
}

type ChatStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ChatAssistant({ onClose }: ChatAssistantProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Hello! I am your GroceWise assistant. I can help you manage products in the fridge, suggest recipes, or analyze consumption. How can I help you?',
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [status, setStatus] = useState<ChatStatus>('idle');
    const [modelUsed, setModelUsed] = useState<string>('');
    const [isFallback, setIsFallback] = useState<boolean>(false);
    const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || status === 'loading') return;

        const userMessage: ChatMessage = { role: 'user', content: inputText.trim() };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInputText('');
        setStatus('loading');

        try {
            const response = await ChatAPI.sendMessage(newMessages);

            setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
            setModelUsed(response.modelUsed);
            setIsFallback(response.isFallback);
            setToolCalls(response.functionCalls || []);
            setStatus('success');
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Oops, I cannot reach my servers at the moment. Check your connection and try again.'
            }]);
            setStatus('error');
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: 'Hello! I am your GroceWise assistant. I can help you manage products in the fridge, suggest recipes, or analyze consumption. How can I help you?',
        }]);
        setStatus('idle');
        setModelUsed('');
        setIsFallback(false);
        setToolCalls([]);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.headerTitle}>GroceWise AI</Text>
                    {status === 'loading' && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: spacing.sm }} />}
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={clearChat} style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Clear</Text>
                    </TouchableOpacity>
                    {onClose && (
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <Text style={styles.headerButtonText}>Close</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {modelUsed !== '' && (
                <View style={[styles.modelInfo, isFallback && styles.modelInfoFallback]}>
                    <Text style={[styles.modelInfoText, isFallback && styles.modelInfoTextFallback]}>
                        {isFallback ? 'Offline Mode (Simulated)' : `AI Engine: ${modelUsed}`}
                    </Text>
                </View>
            )}

            {toolCalls.length > 0 && (
                <View style={styles.toolCallsInfo}>
                    <Text style={styles.toolCallsTitle}>⚡ Actions executed:</Text>
                    {toolCalls.map((call, idx) => (
                        <Text key={idx} style={styles.toolCallText}>• {call.name}</Text>
                    ))}
                </View>
            )}

            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.messageBubble,
                            msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
                        ]}
                    >
                        <Text style={[
                            styles.messageText,
                            msg.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                        ]}>
                            {msg.content}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask me for a recipe or consumption data..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    maxLength={500}
                    editable={status !== 'loading'}
                />
                <TouchableOpacity
                    onPress={handleSendMessage}
                    style={[styles.sendButton, (!inputText.trim() || status === 'loading') && styles.sendButtonDisabled]}
                    disabled={!inputText.trim() || status === 'loading'}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerTitle: { ...typography.h3, color: colors.text },
    headerButtons: { flexDirection: 'row', gap: spacing.sm },
    headerButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
    headerButtonText: { ...typography.small, color: colors.primary, fontWeight: '600' },
    modelInfo: { backgroundColor: colors.lightBg, padding: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
    modelInfoFallback: { backgroundColor: colors.warning, borderColor: colors.warning },
    modelInfoText: { ...typography.small, color: colors.textSecondary },
    modelInfoTextFallback: { color: colors.white, fontWeight: '600' },
    toolCallsInfo: { backgroundColor: colors.lightBg, padding: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.sm, borderRadius: borderRadius.md },
    toolCallsTitle: { ...typography.small, color: colors.text, fontWeight: '600' },
    toolCallText: { ...typography.small, color: colors.textSecondary, marginLeft: spacing.sm },
    messagesContainer: { flex: 1 },
    messagesContent: { padding: spacing.lg, gap: spacing.md },
    messageBubble: { maxWidth: '85%', padding: spacing.md, borderRadius: borderRadius.lg },
    userMessage: { alignSelf: 'flex-end', backgroundColor: colors.primary },
    assistantMessage: { alignSelf: 'flex-start', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
    messageText: { ...typography.body, lineHeight: 22 },
    userMessageText: { color: colors.white },
    assistantMessageText: { color: colors.text },
    inputContainer: { flexDirection: 'row', padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
    input: { flex: 1, backgroundColor: colors.lightBg, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, maxHeight: 100, ...typography.body, color: colors.text },
    sendButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md, justifyContent: 'center' },
    sendButtonDisabled: { backgroundColor: colors.textSecondary },
    sendButtonText: { ...typography.body, color: colors.white, fontWeight: '600' },
});