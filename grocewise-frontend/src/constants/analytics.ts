import { MetricConfig, MetricKey } from '../types';

export const METRICS_CONFIG: Record<MetricKey, MetricConfig> = {
    calories: { label: 'Calorie', suffix: ' kcal', color: '#FF9500' },
    carbohydrates: { label: 'Carbo', suffix: ' g', color: '#5AC8FA' },
    proteins: { label: 'Proteine', suffix: ' g', color: '#FF2D55' },
    fats: { label: 'Grassi', suffix: ' g', color: '#4CD964' },
    cost: { label: 'Spesa', suffix: ' €', color: '#34AADC' },
};

export const ANALYTICS_DEFAULT_START_DATE = '2026-08-25';
export const ANALYTICS_DEFAULT_END_DATE = '2026-08-31';
