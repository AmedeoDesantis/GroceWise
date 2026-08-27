import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Product } from '../types';
import {
    formatDate,
    formatPrice,
    // formatIngredients, // Decommenta se ti serve
    formatNutrients,
    formatQuantity,
} from '../utils/formatting';
// IMPORTANTE: Assicurati di importare typography!
import { colors, spacing, shadows, borderRadius, typography } from '../styles/commonStyles';

interface ProductCardProps {
    product: Product;
    onConsume?: (consumedWeight?: number | null, consumptionDate?: Date | null) => void;
    onDelete?: () => void;
    canConsume?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onConsume,
    onDelete,
    canConsume = true,
}) => {
    const [inputValue, setInputValue] = useState<string>('');
    const [consumptionDate, setConsumptionDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // Su Android il picker modale si chiude automaticamente, quindi aggiorniamo lo stato
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        // Aggiorniamo la data SOLO se l'utente ha premuto "Conferma/Imposta" (ignora i tap fuori per annullare)
        if (event.type === 'set' && selectedDate) {
            setConsumptionDate(selectedDate);
        }
    };

    const handleConsumePress = () => {
        if (!onConsume) return;

        const parsedWeight = inputValue.trim() !== '' ? parseFloat(inputValue) : null;
        onConsume(parsedWeight, consumptionDate);

        setInputValue('');
        setConsumptionDate(new Date());
        setShowPicker(false);
    };

    return (
        <View style={styles.card}>
            {/* --- INFO PRODOTTO --- */}
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>

                {product.brand && <Text style={styles.productDetail}>Marca: {product.brand}</Text>}
                <Text style={styles.productDetail}>Barcode: {product.barcode}</Text>
                <Text style={styles.productDetail}>Prezzo: {formatPrice(product.price)}</Text>
                {product.quantity != null && <Text style={styles.productDetail}>Quantità totale: {formatQuantity(product.quantity, product.unit)}</Text>}
                {product.remaining_quantity != null && !product.finish_date && (
                    <Text style={styles.productDetail}>Residuo: {formatQuantity(product.remaining_quantity, product.unit)}</Text>
                )}
                {product.buy_date && <Text style={styles.productDetail}>Data acquisto: {formatDate(product.buy_date)}</Text>}
                {product.finish_date && <Text style={styles.productDetail}>Consumato: {formatDate(product.finish_date)}</Text>}

                {product.nutrients && (
                    <View style={styles.nutrientsSection}>
                        {product.nutrients.calories && <Text style={styles.productDetail}>Calorie: {formatNutrients(product.nutrients.calories, ' kcal')}</Text>}
                        {product.nutrients.proteins && <Text style={styles.productDetail}>Proteine: {formatNutrients(product.nutrients.proteins, 'g')}</Text>}
                        {product.nutrients.carbohydrates && <Text style={styles.productDetail}>Carboidrati: {formatNutrients(product.nutrients.carbohydrates, 'g')}</Text>}
                        {product.nutrients.fats && <Text style={styles.productDetail}>Grassi: {formatNutrients(product.nutrients.fats, 'g')}</Text>}
                    </View>
                )}
            </View>

            {/* --- SEZIONE INPUT DI CONSUMO --- */}
            {canConsume && !product.finish_date && onConsume && (
                <View style={styles.consumeInputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Peso cons. (g o ml) - Opzionale"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={inputValue}
                        onChangeText={setInputValue}
                    />

                    {/* IL FIX È QUI: Usiamo !showPicker per farlo funzionare come un "Toggle" (Apri/Chiudi) */}
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowPicker(!showPicker)}
                    >
                        <Text style={styles.datePickerLabel}>Data di consumo:</Text>
                        <Text style={styles.datePickerValue}>
                            {consumptionDate.toLocaleDateString('it-IT')}
                        </Text>
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={consumptionDate}
                            mode="date"
                            // Su iOS 'inline' è il calendario moderno compatto. Su Android 'default' usa il modale di sistema.
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={onChangeDate}
                        />
                    )}
                </View>
            )}

            {/* --- BOTTONI DI AZIONE --- */}
            <View style={styles.actions}>
                {canConsume && !product.finish_date && onConsume && (
                    <TouchableOpacity style={[styles.button, styles.consumeButton]} onPress={handleConsumePress}>
                        <Text style={styles.buttonText}>Consuma</Text>
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
                        <Text style={styles.buttonText}>Elimina</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// --- STILI EDITORIALI & FLAT DESIGN ---
const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg, // Usiamo lg (8px) per mantenere lo stile squadrato/carta
        marginBottom: spacing.md,
        ...shadows.card
    },
    productInfo: { marginBottom: spacing.md },
    productName: {
        ...typography.subtitle,
        color: colors.text,
        marginBottom: spacing.sm
    },
    productDetail: {
        ...typography.small,
        color: colors.textSecondary,
        marginBottom: spacing.xs
    },
    nutrientsSection: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border
    },
    consumeInputContainer: {
        marginBottom: spacing.sm,
        gap: spacing.sm
    },
    input: {
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        color: colors.text,
        backgroundColor: colors.white
    },
    datePickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.white,
        height: 44,
    },
    datePickerLabel: {
        ...typography.body,
        color: colors.textSecondary
    },
    datePickerValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500'
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center'
    },
    consumeButton: { backgroundColor: colors.warning },
    deleteButton: { backgroundColor: colors.danger },
    buttonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600'
    },
});