import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    Platform,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../styles/commonStyles';

interface FABProps {
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    size?: number;
}

export const FAB: React.FC<FABProps> = ({
    onPress,
    icon = 'add',
    size = 56,
}) => {
    return (
        <TouchableOpacity
            style={[styles.fab, { width: size, height: size, borderRadius: size / 2 }]}
            onPress={onPress}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name={icon} size={size * 0.4} color={colors.white} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: spacing.xl + spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.fab,
    },
});
