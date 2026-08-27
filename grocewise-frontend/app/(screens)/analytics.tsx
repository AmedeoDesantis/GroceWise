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
import { colors, spacing, typography } from '../../src/styles/commonStyles';
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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
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
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    title: {
        ...typography.title,
        color: colors.text, // Corretto! Prima era #fff e non si sarebbe visto sul panna
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
        ...typography.body,
        color: colors.textSecondary, // Corretto! Prima era #999
        textAlign: 'center',
        marginTop: spacing.xl,
    },
});