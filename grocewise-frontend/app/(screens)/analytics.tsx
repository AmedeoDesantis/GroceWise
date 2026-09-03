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
import { MetricSelector, ConsumptionChart, RankingListItem } from '../../src/components';
import { colors, spacing, typography, borderRadius } from '../../src/styles/commonStyles';
import {
    ANALYTICS_DEFAULT_START_DATE,
    ANALYTICS_DEFAULT_END_DATE,
} from '../../src/constants/analytics';

export default function AnalyticsScreen() {
    // 1. Nuovo stato per memorizzare quale prodotto stiamo filtrando
    const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);

    // 2. Passiamo l'ID al nostro hook
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

    // 3. Troviamo il nome del prodotto selezionato dalla classifica per mostrarlo nel titolo
    const selectedProductName = useMemo(() => {
        if (!selectedBarcode) return null;
        const product = topProducts.find(p => p.product.barcode === selectedBarcode);
        return product ? product.product.name : 'Dettaglio Prodotto';
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

                {/* INTESTAZIONE DINAMICA */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>
                        {selectedBarcode ? `Andamento: ${selectedProductName}` : 'Analisi Consumi Alimentari'}
                    </Text>

                    {/* BOTTONE RIMUOVI FILTRO */}
                    {selectedBarcode && (
                        <TouchableOpacity
                            style={styles.clearFilterButton}
                            onPress={() => setSelectedBarcode(null)}
                        >
                            <Text style={styles.clearFilterText}>✕ Rimuovi filtro</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <MetricSelector activeMetric={activeMetric} onMetricChange={setActiveMetric} />

                {/* Mostra il caricamento grafico quando si cambia prodotto */}
                {loading ? (
                    <View style={{ height: 200, justifyContent: 'center' }}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : hasData ? (
                    <ConsumptionChart labels={labels} dataset={dataset} metric={activeMetric} />
                ) : (
                    <Text style={styles.emptyText}>Nessun dato registrato.</Text>
                )}

                {/* --- SEZIONE CLASSIFICA --- */}
                {topProducts && topProducts.length > 0 && (
                    <View style={styles.rankingSection}>
                        <Text style={styles.sectionTitle}>I Tuoi Migliori Alleati</Text>

                        {topProducts.map((item, index) => {
                            // Capiamo se questo è il prodotto attualmente cliccato
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, padding: spacing.lg },

    // Header dinamico
    headerContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        ...typography.title,
        color: colors.text,
        textAlign: 'center',
    },
    clearFilterButton: {
        marginTop: spacing.sm,
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