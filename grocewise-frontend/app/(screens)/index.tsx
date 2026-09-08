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
            Alert.alert('Successo', 'Prodotto aggiunto');
        } catch (error) {
            console.error('Errore nell\'aggiunta del prodotto:', error);
        }
    };

    const handleConsumeProduct = async (productId: string, consumedWeight?: number | null, consumptionDate?: Date | null) => {
        try {
            await consumeProduct(productId, consumedWeight, consumptionDate);
            Alert.alert('Successo', 'Prodotto marcato come consumato');
        } catch (error) {
            console.error('Errore nel marcatura consumo:', error);
            Alert.alert('Errore', 'Impossibile marcare il prodotto');
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProduct(productId);
            Alert.alert('Successo', 'Prodotto eliminato');
        } catch (error) {
            console.error('Errore nell\'eliminazione del prodotto:', error);
            Alert.alert('Errore', 'Impossibile eliminare il prodotto');
        }
    };

    const handleDeleteAll = async () => {
        Alert.alert('Conferma', 'Eliminare tutti i prodotti?', [
            { text: 'Annulla', onPress: () => { } },
            {
                text: 'Elimina',
                onPress: async () => {
                    try {
                        await deleteAllProducts();
                        Alert.alert('Successo', 'Tutti i prodotti eliminati');
                    } catch (error) {
                        console.error('Errore nell\'eliminazione di tutti i prodotti:', error);
                        Alert.alert('Errore', 'Impossibile eliminare i prodotti');
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
                            <Text style={styles.statsButtonText}>Vedi Statistiche</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsChatOpen(true)}
                            style={styles.chatButton}
                        >
                            <Text style={styles.chatButtonText}>💬 Assistente AI</Text>
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