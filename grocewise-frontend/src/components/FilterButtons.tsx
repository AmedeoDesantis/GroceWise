import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/commonStyles';
import { FilterType } from '../types';

interface FilterButtonsProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({
    activeFilter,
    onFilterChange,
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    activeFilter === 'unconsumed' && styles.buttonActive,
                ]}
                onPress={() => onFilterChange('unconsumed')}
            >
                <Text
                    style={[
                        styles.buttonText,
                        activeFilter === 'unconsumed' && styles.buttonTextActive,
                    ]}
                >
                    Non Consumati
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.button,
                    activeFilter === 'all' && styles.buttonActive,
                ]}
                onPress={() => onFilterChange('all')}
            >
                <Text
                    style={[
                        styles.buttonText,
                        activeFilter === 'all' && styles.buttonTextActive,
                    ]}
                >
                    Tutti
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
    },
    buttonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    buttonText: {
        ...typography.body, // Sostituisce fontSize 14
        textAlign: 'center',
        fontWeight: '500', // Sovrascrive il fontWeight di default se serve
        color: colors.textSecondary,
    },
    buttonTextActive: {
        color: colors.white,
    },
});