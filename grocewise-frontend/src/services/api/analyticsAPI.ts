import axios, { AxiosInstance } from 'axios';
import { AnalyticsResponse, DayStats } from '../../types';
import { API_BASE_URL, API_TIMEOUT } from '../../constants/config';

class AnalyticsAPI {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
        });
    }

    async getConsumptionAnalytics(
        startDate: string,
        endDate: string
    ): Promise<Record<string, DayStats>> {
        try {
            const response = await this.api.get<AnalyticsResponse>('/analytics/consumption', {
                params: { start_date: startDate, end_date: endDate },
            });
            return response.data.daily_analytics;
        } catch (error) {
            console.error('Errore nel recupero delle statistiche di consumo:', error);
            throw error;
        }
    }

    async getSingleProductAnalytics(productId: string, startDate: string, endDate: string): Promise<Record<string, DayStats>> {
        try {
            const response = await this.api.get<AnalyticsResponse>(`/analytics/consumption/${productId}`, {
                params: { start_date: startDate, end_date: endDate },
            });
            return response.data.daily_analytics;
        } catch (error) {
            console.error(`Errore nel recupero delle statistiche per il prodotto ${productId}:`, error);
            throw error;
        }
    }
}

export default new AnalyticsAPI();
