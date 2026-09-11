import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../../constants/config';
import { Override } from '../../types/override';

class OverrideAPI {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: API_TIMEOUT,
        });
    }

    async saveOverride(override: Override): Promise<void> {
        try {
            await this.api.patch(`/overrides/product/${override.barcode}`, override);
        } catch (error) {
            console.error('Error saving override:', error);
            throw error;
        }
    }
}

export default new OverrideAPI();
