import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { MetricSelector, ConsumptionChart, RankingListItem, ChatDrawer } from '../../src/components';
import { colors, spacing, typography, borderRadius } from '../../src/styles/commonStyles';
import {
    getDefaultDateRange,
    TIME_RANGE_OPTIONS,
    TimeRangeType,
} from '../../src/constants/analytics';

export default function AnalyticsScreen() {
    // 1. New state to store which product we are filtering
    const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // 2. Time range state
    const [timeRangeType, setTimeRangeType] = useState<TimeRangeType>('week');
    const defaultRange = getDefaultDateRange();
    const [customStartDate, setCustomStartDate] = useState<string>(defaultRange.startDate);
    const [customEndDate, setCustomEndDate] = useState<string>(defaultRange.endDate);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    // 3. Calculate date range based on selection
    const dateRange = useMemo(() => {
        if (timeRangeType === 'custom') {
            // Use custom dates if both are provided, otherwise fall back to default
            if (customStartDate && customEndDate) {
                return {
                    startDate: customStartDate,
                    endDate: customEndDate,
                };
            }
            // Fall back to default if custom dates are not set
            const defaultRange = getDefaultDateRange();
            return defaultRange;
        }

        const days = TIME_RANGE_OPTIONS[timeRangeType].days;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };
    }, [timeRangeType, customStartDate, customEndDate]);

    // 4. Pass the ID to our hook
    const {
        loading,
        rawData,
        labels,
        activeMetric,
        setActiveMetric,
        dataset,
        topProducts,
        loadAnalytics,
    } = useAnalytics(dateRange.startDate, dateRange.endDate, selectedBarcode);

    useEffect(() => {
        loadAnalytics();
    }, [dateRange.startDate, dateRange.endDate, selectedBarcode]);

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

                {/* HEADER BUTTONS */}
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

                {/* TIME RANGE SELECTOR */}
                <View style={styles.timeRangeContainer}>
                    <Text style={styles.timeRangeLabel}>Time Range:</Text>
                    <View style={styles.timeRangeButtons}>
                        {Object.entries(TIME_RANGE_OPTIONS).map(([key, value]) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.timeRangeButton,
                                    timeRangeType === key && styles.timeRangeButtonActive,
                                ]}
                                onPress={() => {
                                    setTimeRangeType(key as TimeRangeType);
                                    if (key === 'custom') {
                                        setShowCustomDatePicker(true);
                                    }
                                }}
                            >
                                <Text
                                    style={[
                                        styles.timeRangeButtonText,
                                        timeRangeType === key && styles.timeRangeButtonTextActive,
                                    ]}
                                >
                                    {value.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Custom Date Picker */}
                    {timeRangeType === 'custom' && showCustomDatePicker && (
                        <View style={styles.customDatePickerContainer}>
                            <View style={styles.dateInputRow}>
                                <Text style={styles.dateInputLabel}>From:</Text>
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        style={styles.webDateInput}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.dateInputButton}
                                        onPress={() => {/* Add native date picker logic */}}
                                    >
                                        <Text style={styles.dateInputText}>
                                            {customStartDate || 'Select start date'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.dateInputRow}>
                                <Text style={styles.dateInputLabel}>To:</Text>
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        style={styles.webDateInput}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={styles.dateInputButton}
                                        onPress={() => {/* Add native date picker logic */}}
                                    >
                                        <Text style={styles.dateInputText}>
                                            {customEndDate || 'Select end date'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.applyCustomRangeButton}
                                onPress={() => {
                                    if (customStartDate && customEndDate) {
                                        setShowCustomDatePicker(false);
                                    }
                                }}
                                disabled={!customStartDate || !customEndDate}
                            >
                                <Text style={styles.applyCustomRangeText}>Apply Range</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Display current range */}
                    <Text style={styles.currentRangeText}>
                        {dateRange.startDate} to {dateRange.endDate}
                    </Text>
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

    headerButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
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
    },

    // Time range selector styles
    timeRangeContainer: {
        marginBottom: spacing.lg,
    },
    timeRangeLabel: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        fontWeight: '500',
    },
    timeRangeButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    timeRangeButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.lightBg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    timeRangeButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeRangeButtonText: {
        ...typography.small,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    timeRangeButtonTextActive: {
        color: colors.white,
    },
    currentRangeText: {
        ...typography.small,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    customDatePickerContainer: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.lightBg,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: spacing.sm,
    },
    dateInputLabel: {
        ...typography.body,
        color: colors.textSecondary,
        width: 50,
    },
    dateInputButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateInputText: {
        ...typography.body,
        color: colors.text,
    },
    webDateInput: {
        flex: 1,
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        fontSize: '16px',
        color: '#333',
        boxSizing: 'border-box',
    },
    applyCustomRangeButton: {
        marginTop: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    applyCustomRangeText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600',
    },
});