import { useState, useCallback, useMemo } from 'react';
import { DayStats, MetricKey, Product } from '../types';
import AnalyticsAPI from '../services/api/analyticsAPI';
import { sortDates, formatChartLabels, extractDataset, calculateProductsRanking, RankedProduct } from '../utils/analytics';
import { FridgeAPI } from '../services';

export const useAnalytics = (
    startDate: string,
    endDate: string,
    selectedProductId: string | null = null
) => {
    const [loading, setLoading] = useState(true);
    const [rawData, setRawData] = useState<Record<string, DayStats> | null>(null);
    const [topProducts, setTopProducts] = useState<RankedProduct[]>([]);

    const [activeMetric, setActiveMetric] = useState<MetricKey>('calories');
    const [sortedDates, setSortedDates] = useState<string[]>([]);

    const labels = useMemo(() => formatChartLabels(sortedDates), [sortedDates]);
    const dataset = useMemo(() => (rawData ? extractDataset(rawData, sortedDates, activeMetric) : []), [rawData, sortedDates, activeMetric]);

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            // 2. Seleziona l'endpoint in base al fatto che ci sia o meno un ID selezionato
            const chartData = selectedProductId
                ? await AnalyticsAPI.getSingleProductAnalytics(selectedProductId, startDate, endDate)
                : await AnalyticsAPI.getConsumptionAnalytics(startDate, endDate);

            setRawData(chartData);
            setSortedDates(sortDates(chartData));

            // #TODO: Ancora non visualizza i rankings per i prodotti.
            // 3. Scarichiamo/Calcoliamo la classifica SOLO se non l'abbiamo già o se siamo in visione globale.
            // (Presuppone che tu abbia creato getConsumedProducts nel backend)
            if (!selectedProductId && topProducts.length === 0) {
                const consumedProducts = await FridgeAPI.getConsumedProducts();
                const ranking = calculateProductsRanking(consumedProducts);
                setTopProducts(ranking);
            }
        } catch (error) {
            console.error('Errore nel caricamento delle statistiche:', error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedProductId]); // <-- Riavviamo il caricamento se l'ID cambia!

    return {
        loading,
        rawData,
        labels,
        activeMetric,
        setActiveMetric,
        dataset,
        topProducts,
        loadAnalytics,
    };
};