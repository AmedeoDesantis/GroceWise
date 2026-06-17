import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adatta se necessario

interface Nutrients {
    calories?: number;
    carbohydrates?: number;
    proteins?: number;
    fats?: number;
}

interface Product {
    db_id?: string;
    barcode: string;
    name: string;
    brand?: string;
    price: number;
    buy_date?: string;
    finish_date?: string;
    nutrients?: Nutrients;
    ingredients?: string[];
    weight?: number;
}

interface AddProductResponse {
    status: string;
    inserted_id: string;
}

class FridgeAPI {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
        });
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

    async getAllProducts(): Promise<Product[]> {
        try {
            const response = await this.api.get<Product[]>('/fridge/products/all');
            return response.data;
        } catch (error) {
            console.error('Errore nel recupero tutti i prodotti:', error);
            throw error;
        }
    }

    async addProduct(barcode: string, price: number = 0): Promise<string> {
        try {
            const response = await this.api.post<AddProductResponse>('/fridge/products', null, {
                params: { barcode, price },
            });
            return response.data.inserted_id;
        } catch (error) {
            console.error('Errore nell\'aggiunta del prodotto:', error);
            throw error;
        }
    }

    async consumeProduct(productId: string): Promise<void> {
        try {
            await this.api.post(`/fridge/products/${productId}/consume`);
        } catch (error) {
            console.error('Errore nel marcatura consumo:', error);
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