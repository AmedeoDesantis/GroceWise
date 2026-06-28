import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing } from '../styles/commonStyles';
import { METRICS_CONFIG } from '../constants/analytics';
import { MetricKey } from '../types';

interface ConsumptionChartProps {
    labels: string[];
    dataset: number[];
    metric: MetricKey;
}

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({
    labels,
    dataset,
    metric,
}) => {
    const config = METRICS_CONFIG[metric];

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: config.color }]}>
                Andamento {config.label}
            </Text>
            <LineChart
                data={{
                    labels,
                    datasets: [{ data: dataset }],
                }}
                width={Dimensions.get('window').width - spacing.lg * 2}
                height={260}
                yAxisSuffix={config.suffix}
                chartConfig={{
                    backgroundColor: colors.background,
                    backgroundGradientFrom: '#1e1e1e',
                    backgroundGradientTo: '#121212',
                    decimalPlaces: metric === 'cost' ? 2 : 0,
                    color: () => config.color,
                    labelColor: () => 'rgba(255, 255, 255, 0.7)',
                    style: { borderRadius: 16 },
                    propsForDots: { r: '5', strokeWidth: '2', stroke: '#fff' },
                }}
                bezier
                style={styles.chart}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1c1c1e',
        borderRadius: 16,
        padding: spacing.md,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    chart: {
        borderRadius: 16,
    },
});
