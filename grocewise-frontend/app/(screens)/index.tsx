import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    SafeAreaView,
    TouchableOpacity
} from 'react-native';
import { useFridge } from '../../src/hooks/useFridge';
import {
    FilterButtons,
    ProductForm,
    ProductList,
    ChatDrawer
} from '../../src/components';
import { colors, spacing, borderRadius, typography } from '../../src/styles/commonStyles';

export default function FridgeScreen() {
    const router = useRouter();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const {
        products,
        loading,
        filterType,
        setFilterType,
        loadProducts,
        addProduct,
        consumeProduct,
        deleteProduct,
        deleteAllProducts,
        saveOverride
    } = useFridge();

    useEffect(() => {
        loadProducts();
    }, [filterType]);


    const handleAddProduct = async (barcode: string, price: number, buyDate: Date) => {
        try {
            await addProduct(barcode, price, buyDate.toISOString());
            Alert.alert('Success', 'Product added');
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const handleConsumeProduct = async (productId: string, consumedWeight?: number | null, consumptionDate?: Date | null) => {
        try {
            await consumeProduct(productId, consumedWeight, consumptionDate);
            Alert.alert('Success', 'Product marked as consumed');
        } catch (error) {
            console.error('Error marking consumption:', error);
            Alert.alert('Error', 'Unable to mark product');
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProduct(productId);
            Alert.alert('Success', 'Product deleted');
        } catch (error) {
            console.error('Error deleting product:', error);
            Alert.alert('Error', 'Unable to delete product');
        }
    };

    const handleDeleteAll = async () => {
        Alert.alert('Confirm', 'Delete all products?', [
            { text: 'Cancel', onPress: () => { } },
            {
                text: 'Delete',
                onPress: async () => {
                    try {
                        await deleteAllProducts();
                        Alert.alert('Success', 'All products deleted');
                    } catch (error) {
                        console.error('Error deleting all products:', error);
                        Alert.alert('Error', 'Unable to delete products');
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={() => router.push('/analytics')}
                            style={styles.statsButton}
                        >
                            <Text style={styles.statsButtonText}>Statistics</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsChatOpen(true)}
                            style={styles.chatButton}
                        >
                            <Text style={styles.chatButtonText}>AI Assistant</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ProductForm onSubmit={handleAddProduct} isLoading={loading} />

                <FilterButtons
                    activeFilter={filterType}
                    onFilterChange={setFilterType}
                />

                <ProductList
                    products={products}
                    loading={loading}
                    onConsume={handleConsumeProduct}
                    onDelete={handleDeleteProduct}
                    saveOverride={saveOverride}
                />

                {!loading && products.length > 0 && (
                    <View style={styles.deleteAllButtonContainer}>
                        <View style={{ paddingBottom: spacing.lg }} />
                    </View>
                )}
            </ScrollView>

            <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingTop: spacing.md,
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        justifyContent: 'center',
    },
    statsButton: {
        backgroundColor: colors.lightBg,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statsButtonText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
    },
    chatButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
    },
    chatButtonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600',
    },
    deleteAllButtonContainer: {
        marginTop: spacing.lg,
    },
});