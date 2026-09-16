import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    SafeAreaView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFridge } from '../../src/hooks/useFridge';
import {
    FilterButtons,
    ProductFormModal,
    ProductList,
    ChatDrawer,
    FAB
} from '../../src/components';
import { colors, spacing, borderRadius, typography, layout } from '../../src/styles/commonStyles';

export default function FridgeScreen() {
    const router = useRouter();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
            setIsAddModalOpen(false);
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
                {/* Responsive Container */}
                <View style={styles.responsiveContainer}>
                    {/* Modern Header */}
                    <View style={styles.header}>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                onPress={() => router.push('/analytics')}
                                style={styles.iconButton}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="bar-chart" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsChatOpen(true)}
                                style={styles.iconButton}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="chatbubble" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

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
                        <View style={styles.bottomSpacing} />
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <FAB onPress={() => setIsAddModalOpen(true)} />

            {/* Product Form Modal */}
            <ProductFormModal
                visible={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddProduct}
                isLoading={loading}
            />

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
        padding: spacing.md,
    },
    responsiveContainer: {
        maxWidth: layout.maxWidth,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
        paddingVertical: spacing.md,
    },
    brand: {
        ...typography.brand,
        color: colors.primary,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomSpacing: {
        height: 80,
    },
});