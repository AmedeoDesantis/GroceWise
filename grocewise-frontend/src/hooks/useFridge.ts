import { useState, useCallback } from 'react';
import { Product, FilterType } from '../types';
import FridgeAPI from '../services/api/fridgeAPI';
import OverrideAPI from '../services/api/overrideAPI';

export const useFridge = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>('unconsumed');

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data =
                filterType === 'unconsumed'
                    ? await FridgeAPI.getUnconsumedProducts()
                    : await FridgeAPI.getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error('Errore nel caricamento prodotti:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [filterType]);

    const addProduct = useCallback(
        async (barcode: string, price: number = 0, buy_date?: string | null) => {
            setLoading(true);
            try {
                await FridgeAPI.addProduct(barcode, price, buy_date);
                await loadProducts();
            } catch (error) {
                console.error('Errore nell\'aggiunta del prodotto:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [loadProducts]
    );

    const saveOverride = useCallback(
        async (override: { barcode: string; name?: string; price?: number; quantity?: number; unit?: 'g' | 'kg' | 'l' | 'ml' }) => {
            setLoading(true);
            try {
                await OverrideAPI.saveOverride(override);
                await loadProducts();
            } catch (error) {
                console.error('Errore nel salvataggio dell\'override:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [loadProducts]
    );

    const consumeProduct = useCallback(
        async (productId: string, consumedWeight?: number | null, consumptionDate?: Date | null) => {
            setLoading(true);
            try {
                await FridgeAPI.consumeProduct(productId, consumedWeight, consumptionDate);
                await loadProducts();
            } catch (error) {
                console.error('Errore nella marcatura consumo:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [loadProducts]
    );

    const deleteProduct = useCallback(
        async (productId: string) => {
            setLoading(true);
            try {
                await FridgeAPI.deleteProduct(productId);
                await loadProducts();
            } catch (error) {
                console.error('Errore nell\'eliminazione del prodotto:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [loadProducts]
    );

    const deleteAllProducts = useCallback(async () => {
        setLoading(true);
        try {
            await FridgeAPI.deleteAllProducts();
            await loadProducts();
        } catch (error) {
            console.error('Errore nell\'eliminazione di tutti i prodotti:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadProducts]);

    return {
        products,
        loading,
        filterType,
        setFilterType,
        loadProducts,
        addProduct,
        consumeProduct,
        deleteProduct,
        deleteAllProducts,
        saveOverride,
    };
};
