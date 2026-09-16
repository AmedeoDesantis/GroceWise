import { MetricConfig, MetricKey } from '../types';

export const METRICS_CONFIG: Record<MetricKey, MetricConfig> = {
    calories: { label: 'Calories', suffix: ' kcal', color: '#FF9500' },
    carbohydrates: { label: 'Carbohydrates', suffix: ' g', color: '#5AC8FA' },
    proteins: { label: 'Proteins', suffix: ' g', color: '#FF2D55' },
    fats: { label: 'Fats', suffix: ' g', color: '#4CD964' },
    cost: { label: 'Cost', suffix: ' €', color: '#34AADC' },
};

// Time range options
export type TimeRangeType = 'week' | '2weeks' | 'month' | 'custom';

export const TIME_RANGE_OPTIONS: Record<TimeRangeType, { label: string; days: number }> = {
    week: { label: '1 Week', days: 7 },
    '2weeks': { label: '2 Weeks', days: 14 },
    month: { label: '1 Month', days: 30 },
    custom: { label: 'Custom', days: 0 },
};

// Helper function to get default date range (1 week ago to today)
export const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
};

// Legacy constants for backward compatibility
export const ANALYTICS_DEFAULT_START_DATE = getDefaultDateRange().startDate;
export const ANALYTICS_DEFAULT_END_DATE = getDefaultDateRange().endDate;
