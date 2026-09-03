import { useState, useCallback, useMemo } from 'react';
import { DayStats, MetricKey, Product } from '../types';
import AnalyticsAPI from '../services/api/analyticsAPI';
import { sortDates, formatChartLabels, extractDataset, calculateProductsRanking, RankedProduct } from '../utils/analytics';
import { FridgeAPI } from '../services';

export const useAnalytics = (
    startDate: string,
    endDate: string,
    selectedBarcode: string | null = null
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
            const chartData = selectedBarcode
                ? await AnalyticsAPI.getSingleProductAnalytics(selectedBarcode, startDate, endDate)
                : await AnalyticsAPI.getConsumptionAnalytics(startDate, endDate);

            setRawData(chartData);
            setSortedDates(sortDates(chartData));

            if (!selectedBarcode && topProducts.length === 0) {
                const consumedProducts = await FridgeAPI.getConsumedProducts();
                const ranking = calculateProductsRanking(consumedProducts);
                setTopProducts(ranking);
            }
        } catch (error) {
            console.error('Errore nel caricamento delle statistiche:', error);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedBarcode]);

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