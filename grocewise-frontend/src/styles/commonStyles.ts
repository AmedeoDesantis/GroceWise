import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    background: '#f5f5f5',
    white: '#fff',
    text: '#333',
    textSecondary: '#666',
    textLight: '#999',
    border: '#ddd',
    lightBg: '#fafafa',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const borderRadius = {
    sm: 4,
    md: 6,
    lg: 8,
};

export const shadows = StyleSheet.create({
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});

export const typography = {
    title: {
        fontSize: 28,
        fontWeight: 'bold' as const,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 14,
        fontWeight: '400' as const,
    },
    small: {
        fontSize: 13,
        fontWeight: '400' as const,
    },
};
