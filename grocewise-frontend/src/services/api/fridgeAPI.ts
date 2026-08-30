import axios, { AxiosInstance } from 'axios';
import { Product, AddProductResponse } from '../../types';
import { API_BASE_URL, API_TIMEOUT } from '../../constants/config';
import { AnalyticsResponse, DayStats } from '../../types';

class FridgeAPI {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
        });
    }

    async getAnalytics(startDate: string, endDate: string): Promise<Record<string, DayStats>> {
        try {
            const response = await this.api.get<AnalyticsResponse>('/analytics/consumption', {
                params: { start_date: startDate, end_date: endDate },
            });
            return response.data.daily_analytics;
        } catch (error) {
            console.error('Errore nel recupero delle analitiche:', error);
            throw error;
        }
    }

    async getUnconsumedProducts(): Promise<Product[]> {
        try {
            const response = await this.api.get<Product[]>('/fridge/products/unconsumed');
            return response.data;
        } catch (error) {
            console.error('Errore nel recupero prodotti non consumati:', error);
            throw error;
        }
    }

    async getConsumedProducts(): Promise<Product[]> {
        try {
            const response = await this.api.get<Product[]>('/fridge/products/consumed');
            return response.data;
        } catch (error) {
            console.error('Errore nel recupero prodotti consumati:', error);
            throw error;
        }
    }

    async getAllProducts(): Promise<Product[]> {
        try {
            const response = await this.api.get<Product[]>('/fridge/products/all');
            return response.data;
        } catch (error) {
            console.error('Errore nel recupero tutti i prodotti:', error);
            throw error;
        }
    }

    async addProduct(barcode: string, price: number = 0, buy_date?: string | null): Promise<string> {
        try {
            const response = await this.api.post<AddProductResponse>('/fridge/products', null, {
                params: { barcode, price, buy_date },
            });
            return response.data.inserted_id;
        } catch (error) {
            console.error('Errore nell\'aggiunta del prodotto:', error);
            throw error;
        }
    }

    async consumeProduct(
        productId: string,
        consumedWeight?: number | null,
        consumptionDate?: Date | null
    ): Promise<void> {
        try {
            const dateString = consumptionDate ? consumptionDate.toISOString() : undefined;

            await this.api.post(`/fridge/products/${productId}/consume`, null, {
                params: {
                    quantity: consumedWeight !== null ? consumedWeight : undefined,
                    consumed_at: dateString
                }
            });
        } catch (error) {
            console.error('Errore nella chiamata Axios di consumo:', error);
            throw error;
        }
    }

    async deleteProduct(productId: string): Promise<void> {
        try {
            await this.api.delete(`/fridge/products/${productId}`);
        } catch (error) {
            console.error('Errore nell\'eliminazione del prodotto:', error);
            throw error;
        }
    }

    async deleteAllProducts(): Promise<void> {
        try {
            await this.api.delete('/fridge/products/all');
        } catch (error) {
            console.error('Errore nell\'eliminazione di tutti i prodotti:', error);
            throw error;
        }
    }
}

export default new FridgeAPI();
