import { MetricConfig, MetricKey } from '../types';

export const METRICS_CONFIG: Record<MetricKey, MetricConfig> = {
    calories: { label: 'Calories', suffix: ' kcal', color: '#FF9500' },
    carbohydrates: { label: 'Carbohydrates', suffix: ' g', color: '#5AC8FA' },
    proteins: { label: 'Proteins', suffix: ' g', color: '#FF2D55' },
    fats: { label: 'Fats', suffix: ' g', color: '#4CD964' },
    cost: { label: 'Cost', suffix: ' €', color: '#34AADC' },
};

export const ANALYTICS_DEFAULT_START_DATE = '2026-08-23';
export const ANALYTICS_DEFAULT_END_DATE = '2026-09-05';
