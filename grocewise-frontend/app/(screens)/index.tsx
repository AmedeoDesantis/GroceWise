import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useFridge } from '../../src/hooks/useFridge';
import {
    FilterButtons,
    ProductForm,
    ProductList
} from '../../src/components';
import { colors, spacing, typography } from '../../src/styles/commonStyles';

export default function FridgeScreen() {
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
    } = useFridge();

    useEffect(() => {
        loadProducts();
    }, [filterType]);

    const handleAddProduct = async (barcode: string, price: number) => {
        try {
            await addProduct(barcode, price);
            Alert.alert('Successo', 'Prodotto aggiunto');
        } catch (error) {
            console.error('Errore nell\'aggiunta del prodotto:', error);
        }
    };

    const handleConsumeProduct = async (productId: string) => {
        try {
            await consumeProduct(productId);
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
                    <View style={styles.titleContainer}>
                        <View style={styles.titleText}>
                            <Text style={styles.emoji}>📦</Text>
                        </View>
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
                />

                {!loading && products.length > 0 && (
                    <View style={styles.deleteAllButtonContainer}>
                        <View
                            style={{
                                paddingBottom: spacing.lg,
                            }}
                        >
                            {/* Spacer per il bottone */}
                        </View>
                    </View>
                )}
            </ScrollView>
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
    titleContainer: {
        alignItems: 'center',
    },
    titleText: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    emoji: {
        fontSize: 32,
        marginRight: spacing.md,
    },
    deleteAllButtonContainer: {
        marginTop: spacing.lg,
    },
});
