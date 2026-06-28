import React from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { colors, spacing } from '../styles/commonStyles';

interface ProductListProps {
    products: Product[];
    loading: boolean;
    // 1. MODIFICATO: Adesso la firma accetta anche il peso consumato (opzionale)
    onConsume?: (productId: string, consumedWeight?: number | null) => void;
    onDelete?: (productId: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
    products,
    loading,
    onConsume,
    onDelete,
}) => {
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (products.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Nessun prodotto trovato</Text>
            </View>
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {products.map((product) => (
                <ProductCard
                    key={product.db_id}
                    product={product}
                    // 2. MODIFICATO: Catturiamo il peso sputato fuori dalla ProductCard e lo passiamo a onConsume
                    onConsume={(weight) => onConsume?.(product.db_id!, weight)}
                    onDelete={() => onDelete?.(product.db_id!)}
                />
            ))}
            <View style={styles.spacer} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: colors.textLight,
    },
    spacer: {
        height: spacing.xl,
    },
});