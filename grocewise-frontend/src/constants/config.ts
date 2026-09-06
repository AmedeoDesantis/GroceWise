// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
export const API_TIMEOUT = process.env.EXPO_PUBLIC_API_TIMEOUT ? parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT) : 10000;

// Validation Rules
export const BARCODE_MIN_LENGTH = 8;
export const BARCODE_MAX_LENGTH = 13;
export const PRODUCT_ID_LENGTH = 24;

// Default Values
export const DEFAULT_PRICE = 0.0;

// Gemini AI Configuration
// Per configurare Gemini AI, aggiungi queste variabili nel file .env:
// EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
// Modelli disponibili:
// - Flash (economico): gemini-1.5-flash
// - Pro (potente): gemini-1.5-pro
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
export const GEMINI_FLASH_MODEL = process.env.EXPO_PUBLIC_GEMINI_FLASH_MODEL || 'gemini-3.5-flash-lite';
export const GEMINI_PRO_MODEL = process.env.EXPO_PUBLIC_GEMINI_PRO_MODEL || 'gemini-3.8-flash';

