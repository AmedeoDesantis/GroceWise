// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
export const API_TIMEOUT = process.env.EXPO_PUBLIC_API_TIMEOUT ? parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) : 10000;

// Validation Rules
export const BARCODE_MIN_LENGTH = 8;
export const BARCODE_MAX_LENGTH = 13;
export const PRODUCT_ID_LENGTH = 24;

// Default Values
export const DEFAULT_PRICE = 0.0;

