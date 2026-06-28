import { useState, useCallback, useMemo } from 'react';
import { DayStats, MetricKey } from '../types';
import AnalyticsAPI from '../services/api/analyticsAPI';
import { sortDates, formatChartLabels, extractDataset } from '../utils/analytics';

export const useAnalytics = (startDate: string, endDate: string) => {
    const [loading, setLoading] = useState(true);
    const [rawData, setRawData] = useState<Record<string, DayStats> | null>(null);
    const [activeMetric, setActiveMetric] = useState<MetricKey>('calories');
    const [sortedDates, setSortedDates] = useState<string[]>([]);

    const labels = useMemo(
        () => formatChartLabels(sortedDates),
        [sortedDates]
    );

    const dataset = useMemo(
        () => (rawData ? extractDataset(rawData, sortedDates, activeMetric) : []),
        [rawData, sortedDates, activeMetric]
    );

    const loadAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const data = await AnalyticsAPI.getConsumptionAnalytics(startDate, endDate);
            const dates = sortDates(data);
            setRawData(data);
            setSortedDates(dates);
        } catch (error) {
            console.error('Errore nel caricamento delle statistiche:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    return {
        loading,
        rawData,
        labels,
        activeMetric,
        setActiveMetric,
        dataset,
        loadAnalytics,
    };
};
