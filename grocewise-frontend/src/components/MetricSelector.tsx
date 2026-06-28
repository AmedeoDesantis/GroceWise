import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { spacing } from '../styles/commonStyles';
import { METRICS_CONFIG } from '../constants/analytics';
import { MetricKey } from '../types';

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

const styles = StyleSheet.create({
    container: {
        height: 50,
        marginBottom: spacing.lg,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#2c2c2e',
        marginRight: spacing.sm,
    },
    buttonText: {
        color: '#aaa',
        fontWeight: '600',
        fontSize: 14,
    },
    buttonTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
