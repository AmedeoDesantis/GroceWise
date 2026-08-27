export interface Nutrients {
    calories?: number;
    carbohydrates?: number;
    proteins?: number;
    fats?: number;
}

export interface ConsumptionEvent {
    date: string;
    quantity: number;
}

export interface Product {
    db_id?: string;
    barcode: string;
    name: string;
    brand?: string;
    price: number;
    buy_date?: string;
    finish_date?: string;
    nutrients?: Nutrients;
    ingredients?: string[];
    quantity?: number;
    remaining_quantity?: number;
    unit?: string;
    consumptions?: ConsumptionEvent[];
}

export interface AddProductResponse {
    status: string;
    inserted_id: string;
}

export type FilterType = 'all' | 'unconsumed';

export interface DayStats {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
    cost: number;
}

export interface AnalyticsResponse {
    daily_analytics: Record<string, DayStats>;
}

export type MetricKey = keyof DayStats;

export interface MetricConfig {
    label: string;
    suffix: string;
    color: string;
}
