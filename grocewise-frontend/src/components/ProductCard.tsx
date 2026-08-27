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
    formatIngredients,
    formatNutrients,
    formatQuantity,
} from '../utils/formatting';
import { colors, spacing, shadows, borderRadius } from '../styles/commonStyles';

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
    const [showPicker, setShowPicker] = useState<boolean>(false); // Gestisce la visibilità del picker nativo

    // Gestisce il cambio di data del DatePicker nativo
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
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
                        placeholder="Peso cons. (g) - Opzionale"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={inputValue}
                        onChangeText={setInputValue}
                    />

                    {/* Bottone per aprire il DatePicker nativo */}
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={styles.datePickerLabel}>Data di consumo:</Text>
                        <Text style={styles.datePickerValue}>
                            {consumptionDate.toLocaleDateString('it-IT')}
                        </Text>
                    </TouchableOpacity>

                    {/* Il DatePicker nativo si attiva solo se showPicker è true */}
                    {showPicker && (
                        <DateTimePicker
                            value={consumptionDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
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

const styles = StyleSheet.create({
    card: { backgroundColor: colors.white, padding: spacing.lg, borderRadius: borderRadius.md, marginBottom: spacing.md, ...shadows.card },
    productInfo: { marginBottom: spacing.md },
    productName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
    productDetail: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.xs },
    nutrientsSection: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
    consumeInputContainer: { marginBottom: spacing.sm, gap: spacing.sm },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 14, color: colors.text, backgroundColor: colors.white },

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
    datePickerLabel: { fontSize: 14, color: colors.textSecondary },
    datePickerValue: { fontSize: 14, color: colors.text, fontWeight: '500' },

    actions: { flexDirection: 'row', gap: spacing.sm },
    button: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
    consumeButton: { backgroundColor: colors.warning },
    deleteButton: { backgroundColor: colors.danger },
    buttonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
});