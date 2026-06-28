import { DayStats, MetricKey } from '../types';

export const sortDates = (data: Record<string, DayStats>): string[] =>
    Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

export const formatChartLabels = (dates: string[]): string[] =>
    dates.map((dateStr) =>
        new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    );

export const extractDataset = (
    data: Record<string, DayStats>,
    dates: string[],
    metric: MetricKey
): number[] => dates.map((date) => data[date][metric]);
