import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { MetricSelector, ConsumptionChart, RankingListItem, ChatDrawer } from '../../src/components';
import { colors, spacing, typography, borderRadius } from '../../src/styles/commonStyles';
import {
    ANALYTICS_DEFAULT_START_DATE,
    ANALYTICS_DEFAULT_END_DATE,
} from '../../src/constants/analytics';

export default function AnalyticsScreen() {
    // 1. New state to store which product we are filtering
    const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // 2. Pass the ID to our hook
    const {
        loading,
        rawData,
        labels,
        activeMetric,
        setActiveMetric,
        dataset,
        topProducts,
        loadAnalytics,
    } = useAnalytics(ANALYTICS_DEFAULT_START_DATE, ANALYTICS_DEFAULT_END_DATE, selectedBarcode);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // 3. Find the name of the selected product from the ranking to show in the title
    const selectedProductName = useMemo(() => {
        if (!selectedBarcode) return null;
        const product = topProducts.find(p => p.product.barcode === selectedBarcode);
        return product ? product.product.name : 'Product Detail';
    }, [selectedBarcode, topProducts]);

    if (loading && !rawData) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const hasData = rawData && dataset.length > 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

                {/* DYNAMIC HEADER */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>
                        {selectedBarcode ? `Calories: ${selectedProductName}` : 'Food Consumption Analysis'}
                    </Text>

                    <View style={styles.headerButtons}>
                        {/* REMOVE FILTER BUTTON */}
                        {selectedBarcode && (
                            <TouchableOpacity
                                style={styles.clearFilterButton}
                                onPress={() => setSelectedBarcode(null)}
                            >
                                <Text style={styles.clearFilterText}>✕ Remove filter</Text>
                            </TouchableOpacity>
                        )}

                        {/* AI ASSISTANT BUTTON */}
                        <TouchableOpacity
                            style={styles.chatButton}
                            onPress={() => setIsChatOpen(true)}
                        >
                            <Text style={styles.chatButtonText}>AI Assistant</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <MetricSelector activeMetric={activeMetric} onMetricChange={setActiveMetric} />

                {/* Show chart loading when changing product */}
                {loading ? (
                    <View style={{ height: 200, justifyContent: 'center' }}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : hasData ? (
                    <ConsumptionChart labels={labels} dataset={dataset} metric={activeMetric} />
                ) : (
                    <Text style={styles.emptyText}>No data recorded.</Text>
                )}

                {/* --- RANKING SECTION --- */}
                {topProducts && topProducts.length > 0 && (
                    <View style={styles.rankingSection}>
                        <Text style={styles.sectionTitle}>Best to Buy</Text>

                        {topProducts.map((item, index) => {
                            // Check if this is the currently clicked product
                            const isSelected = item.product.barcode === selectedBarcode;

                            return (
                                <View key={item.product.barcode} style={isSelected ? styles.selectedItemBorder : null}>
                                    <RankingListItem
                                        product={item.product}
                                        position={index + 1}
                                        score={item.scoreLabel}
                                        onPress={() => setSelectedBarcode(item.product.barcode)}
                                    />
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={{ height: spacing.xxl }} />
            </ScrollView>

            <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, padding: spacing.lg },

    // Dynamic header
    headerContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        ...typography.title,
        color: colors.text,
        textAlign: 'center',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
        alignItems: 'center',
    },
    clearFilterButton: {
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.lightBg,
        borderRadius: borderRadius.pill,
        borderWidth: 1,
        borderColor: colors.border,
    },
    clearFilterText: {
        ...typography.small,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    chatButton: {
        paddingVertical: 6,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.pill,
    },
    chatButtonText: {
        ...typography.small,
        color: colors.white,
        fontWeight: '600',
    },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },

    rankingSection: { marginTop: spacing.xl },
    sectionTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.md },

    selectedItemBorder: {
        marginLeft: -4,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        borderRadius: 4,
    }
});