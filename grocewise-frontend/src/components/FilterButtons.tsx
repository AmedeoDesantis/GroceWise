import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../styles/commonStyles';
import { FilterType } from '../types';

interface FilterButtonsProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
    { key: 'unconsumed', label: 'Unconsumed' },
    { key: 'all', label: 'All' },
];

export const FilterButtons: React.FC<FilterButtonsProps> = ({
    activeFilter,
    onFilterChange,
}) => {
    return (
        <View style={styles.container}>
            {FILTER_OPTIONS.map((option) => (
                <TouchableOpacity
                    key={option.key}
                    style={[
                        styles.chip,
                        activeFilter === option.key && styles.chipActive,
                    ]}
                    onPress={() => onFilterChange(option.key)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.chipText,
                            activeFilter === option.key && styles.chipTextActive,
                        ]}
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.pill,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: colors.white,
        fontWeight: '600',
    },
});