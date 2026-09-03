import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Platform,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Product } from '../types';
import {
    formatDate,
    formatPrice,
    formatNutrients,
    formatQuantity,
} from '../utils/formatting';
import { colors, spacing, shadows, borderRadius, typography } from '../styles/commonStyles';

// Abilita le animazioni di layout su Android (necessario per LayoutAnimation)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
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

    // Funzione che gestisce l'apertura/chiusura con animazione
    const toggleExpand = () => {
        // Configura l'animazione fluida prima di cambiare lo stato
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={styles.card}>
            {/* --- HEADER COLLASSABILE --- */}
            <TouchableOpacity
                style={styles.headerRow}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* --- INFORMAZIONI PRINCIPALI (Sempre visibili) --- */}
            <View style={styles.productInfo}>
                {product.brand && <Text style={styles.productDetail}>Marca: {product.brand}</Text>}
                <Text style={styles.productDetail}>Prezzo: {formatPrice(product.price)}</Text>
                {product.buy_date && (
                    <Text style={styles.productDetail}>
                        Data acquisto: {formatDate(product.buy_date)}
                    </Text>
                )}

                {product.remaining_quantity != null && !product.finish_date && (
                    <Text style={styles.productHighlight}>
                        Residuo: {formatQuantity(product.remaining_quantity, product.unit)}
                    </Text>
                )}
                {product.finish_date && (
                    <Text style={styles.productHighlight}>
                        Consumato il: {formatDate(product.finish_date)}
                    </Text>
                )}
            </View>

            {/* --- INFORMAZIONI SECONDARIE (Visibili solo se espanso) --- */}
            {isExpanded && (
                <View style={styles.expandedSection}>
                    <Text style={styles.productDetail}>Barcode: {product.barcode}</Text>
                    {product.quantity != null && (
                        <Text style={styles.productDetail}>
                            Quantità totale: {formatQuantity(product.quantity, product.unit)}
                        </Text>
                    )}

                    {product.nutrients && (
                        <View style={styles.nutrientsSection}>
                            {product.nutrients.calories && <Text style={styles.productDetail}>Calorie: {formatNutrients(product.nutrients.calories, ' kcal')}</Text>}
                            {product.nutrients.proteins && <Text style={styles.productDetail}>Proteine: {formatNutrients(product.nutrients.proteins, 'g')}</Text>}
                            {product.nutrients.carbohydrates && <Text style={styles.productDetail}>Carboidrati: {formatNutrients(product.nutrients.carbohydrates, 'g')}</Text>}
                            {product.nutrients.fats && <Text style={styles.productDetail}>Grassi: {formatNutrients(product.nutrients.fats, 'g')}</Text>}
                        </View>
                    )}
                </View>
            )}

            {/* --- BARRA DI CONSUMO E DATA (Sempre visibili) --- */}
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
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={onChangeDate}
                        />
                    )}
                </View>
            )}

            {/* --- BOTTONI DI AZIONE (Sempre visibili) --- */}
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
    card: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        ...shadows.card
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    productName: {
        ...typography.subtitle,
        color: colors.text,
        flex: 1,
        marginRight: spacing.sm,
    },
    toggleIcon: {
        fontSize: 16,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    productInfo: {
        marginBottom: spacing.sm
    },
    expandedSection: {
        marginBottom: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    productDetail: {
        ...typography.small,
        color: colors.textSecondary,
        marginBottom: spacing.xs
    },
    productHighlight: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
        marginTop: spacing.xs,
        marginBottom: spacing.xs
    },
    nutrientsSection: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border
    },
    consumeInputContainer: {
        marginTop: spacing.sm,
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
        gap: spacing.sm,
        marginTop: spacing.sm,
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