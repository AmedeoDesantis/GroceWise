import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { MetricSelector, ConsumptionChart } from '../../src/components';
import { colors, spacing } from '../../src/styles/commonStyles';
import {
    ANALYTICS_DEFAULT_START_DATE,
    ANALYTICS_DEFAULT_END_DATE,
} from '../../src/constants/analytics';

export default function AnalyticsScreen() {
    const {
        loading,
        rawData,
        labels,
        activeMetric,
        setActiveMetric,
        dataset,
        loadAnalytics,
    } = useAnalytics(ANALYTICS_DEFAULT_START_DATE, ANALYTICS_DEFAULT_END_DATE);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const hasData = rawData && dataset.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Analisi Consumi Alimentari</Text>

            <MetricSelector
                activeMetric={activeMetric}
                onMetricChange={setActiveMetric}
            />

            {hasData ? (
                <ConsumptionChart
                    labels={labels}
                    dataset={dataset}
                    metric={activeMetric}
                />
            ) : (
                <Text style={styles.emptyText}>
                    Nessun dato registrato nel periodo selezionato.
                </Text>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: spacing.md,
        textAlign: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    emptyText: {
        color: '#999',
        textAlign: 'center',
        marginTop: spacing.xl,
    },
});
