import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { METRICS_CONFIG } from '../constants/analytics';
import { MetricKey } from '../types';
import { colors, spacing, borderRadius, typography } from '../styles/commonStyles';

interface MetricSelectorProps {
    activeMetric: MetricKey;
    onMetricChange: (metric: MetricKey) => void;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
    activeMetric,
    onMetricChange,
}) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {Object.entries(METRICS_CONFIG).map(([key, config]) => {
                    const isSelected = activeMetric === key;
                    return (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.button,
                                isSelected && { backgroundColor: config.color },
                            ]}
                            onPress={() => onMetricChange(key as MetricKey)}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    isSelected && styles.buttonTextSelected,
                                ]}
                            >
                                {config.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};


export const styles = StyleSheet.create({
    container: {
        height: 50,
        marginBottom: spacing.lg,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    button: {
        paddingHorizontal: spacing.lg,    // Rimosso 16
        paddingVertical: spacing.sm,      // Rimosso 8
        borderRadius: borderRadius.xxl,   // Rimosso 20
        backgroundColor: colors.surfaceDark, // Rimosso '#2c2c2e'
        marginRight: spacing.sm,
    },
    buttonText: {
        ...typography.body,               // Applica fontSize 14
        color: colors.textMuted,          // Rimosso '#aaa'
        fontWeight: '600',
    },
    buttonTextSelected: {
        color: colors.white,              // Rimosso '#fff'
        fontWeight: 'bold',               // Volendo puoi usare typography.title.fontWeight
    },
});