import React, { useState } from 'react'; // <-- Aggiunto useState
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput, // <-- Aggiunto TextInput
} from 'react-native';
import { Product } from '../types';
import {
    formatDate,
    formatPrice,
    formatIngredients,
    formatNutrients,
} from '../utils/formatting';
import { colors, spacing, typography, shadows, borderRadius } from '../styles/commonStyles';

interface ProductCardProps {
    product: Product;
    // Modificato: adesso onConsume può accettare opzionalmente il peso consumato
    onConsume?: (consumedWeight?: number | null) => void;
    onDelete?: () => void;
    canConsume?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onConsume,
    onDelete,
    canConsume = true,
}) => {
    // Stato locale per gestire l'input del testo per il peso da consumare
    const [inputValue, setInputValue] = useState<string>('');

    const handleConsumePress = () => {
        if (!onConsume) return;

        // Convertiamo la stringa in numero. Se è vuota o invalida, passiamo null
        const parsedWeight = inputValue.trim() !== '' ? parseFloat(inputValue) : null;

        // Passiamo il peso al componente padre (schermo o hook)
        onConsume(parsedWeight);

        // Puliamo l'input dopo il consumo
        setInputValue('');
    };

    return (
        <View style={styles.card}>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>

                {product.brand && (
                    <Text style={styles.productDetail}>Marca: {product.brand}</Text>
                )}

                <Text style={styles.productDetail}>Barcode: {product.barcode}</Text>
                <Text style={styles.productDetail}>Prezzo: {formatPrice(product.price)}</Text>

                {product.weight != null && (
                    <Text style={styles.productDetail}>Peso totale: {product.weight}g</Text>
                )}

                {product.remaining_weight != null && !product.finish_date && (
                    <Text style={styles.productDetail}>
                        Residuo: {product.remaining_weight}g
                    </Text>
                )}

                {product.buy_date && (
                    <Text style={styles.productDetail}>
                        Data acquisto: {formatDate(product.buy_date)}
                    </Text>
                )}

                {product.finish_date && (
                    <Text style={styles.productDetail}>
                        Consumato: {formatDate(product.finish_date)}
                    </Text>
                )}

                {product.nutrients && (
                    <View style={styles.nutrientsSection}>
                        {product.nutrients.calories && (
                            <Text style={styles.productDetail}>
                                Calorie: {formatNutrients(product.nutrients.calories, ' kcal')}
                            </Text>
                        )}
                        {product.nutrients.proteins && (
                            <Text style={styles.productDetail}>
                                Proteine: {formatNutrients(product.nutrients.proteins, 'g')}
                            </Text>
                        )}
                        {product.nutrients.carbohydrates && (
                            <Text style={styles.productDetail}>
                                Carboidrati: {formatNutrients(product.nutrients.carbohydrates, 'g')}
                            </Text>
                        )}
                        {product.nutrients.fats && (
                            <Text style={styles.productDetail}>
                                Grassi: {formatNutrients(product.nutrients.fats, 'g')}
                            </Text>
                        )}
                    </View>
                )}

                {product.ingredients && product.ingredients.length > 0 && (
                    <Text style={styles.productDetail}>
                        Ingredienti: {formatIngredients(product.ingredients)}
                    </Text>
                )}
            </View>

            {/* SEZIONE INPUT DI CONSUMO: Mostrata solo se il prodotto non è finito ed è consumabile */}
            {canConsume && !product.finish_date && onConsume && (
                <View style={styles.consumeInputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Peso cons. (g) - Opzionale"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={inputValue}
                        onChangeText={setInputValue}
                    />
                </View>
            )}

            <View style={styles.actions}>
                {canConsume && !product.finish_date && onConsume && (
                    <TouchableOpacity
                        style={[styles.button, styles.consumeButton]}
                        onPress={handleConsumePress} // <-- Cambiato per chiamare la funzione locale
                    >
                        <Text style={styles.buttonText}>Consuma</Text>
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={onDelete}
                    >
                        <Text style={styles.buttonText}>Elimina</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        ...shadows.card,
    },
    productInfo: {
        marginBottom: spacing.md,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    productDetail: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    nutrientsSection: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    // Nuovi stili per il contenitore dell'input del peso
    consumeInputContainer: {
        marginBottom: spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.white,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    consumeButton: {
        backgroundColor: colors.warning,
    },
    deleteButton: {
        backgroundColor: colors.danger,
    },
    buttonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
});