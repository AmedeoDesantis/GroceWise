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
    onConsume?: (productId: string) => void;
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
                    onConsume={() => onConsume?.(product.db_id!)}
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
