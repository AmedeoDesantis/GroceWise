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

// Enable layout animations on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Updated interface to include onEdit
interface ProductCardProps {
    product: Product;
    onConsume?: (consumedWeight?: number | null, consumptionDate?: Date | null) => void;
    onDelete?: () => void;
    onEdit?: (override: { barcode: string; name?: string; price?: number; quantity?: number; unit?: 'g' | 'kg' | 'l' | 'ml' }) => void;
    canConsume?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onConsume,
    onDelete,
    onEdit,
    canConsume = true,
}) => {
    // Consumption and display states
    const [inputValue, setInputValue] = useState<string>('');
    const [consumptionDate, setConsumptionDate] = useState<Date>(new Date());
    const [showPicker, setShowPicker] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    // --- NEW STATES FOR EDITING ---
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editName, setEditName] = useState(product.name);
    const [editPrice, setEditPrice] = useState(product.price?.toString() || '');
    const [editQuantity, setEditQuantity] = useState(product.quantity?.toString() || '');
    const [editUnit, setEditUnit] = useState<'g' | 'kg' | 'l' | 'ml' | undefined>(product.unit as any);

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

    const toggleExpand = () => {
        if (isEditing) return; // Disable expand/collapse while editing
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    // --- EDITING FUNCTIONS ---
    const handleStartEdit = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsEditing(false);
        // Reset fields to original values
        setEditName(product.name);
        setEditPrice(product.price?.toString() || '');
        setEditQuantity(product.quantity?.toString() || '');
        setEditUnit(product.unit as any);
    };

    const handleSaveEdit = () => {
        if (onEdit) {
            onEdit({
                barcode: product.barcode,
                name: editName !== product.name ? editName : undefined,
                price: editPrice ? parseFloat(editPrice) : undefined,
                quantity: editQuantity ? parseFloat(editQuantity) : undefined,
                unit: editUnit !== product.unit ? editUnit : undefined,
            });
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsEditing(false);
    };

    // --- RENDER EDIT FORM ---
    if (isEditing) {
        return (
            <View style={styles.card}>
                <Text style={styles.editTitle}>Edit Product</Text>

                <Text style={styles.inputLabel}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Nome"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Price (€)</Text>
                <TextInput
                    style={styles.input}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                    placeholder="Ex. 2.50"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Total Quantity</Text>
                <TextInput
                    style={styles.input}
                    value={editQuantity}
                    onChangeText={setEditQuantity}
                    keyboardType="numeric"
                    placeholder="Ex. 500"
                    placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Unit of Measure</Text>
                <View style={styles.unitSelector}>
                    {['g', 'kg', 'ml', 'l'].map((u) => (
                        <TouchableOpacity
                            key={u}
                            style={[styles.unitButton, editUnit === u && styles.unitButtonActive]}
                            onPress={() => setEditUnit(u as any)}
                        >
                            <Text style={[styles.unitButtonText, editUnit === u && styles.unitButtonTextActive]}>
                                {u}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelEdit}>
                        <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveEdit}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // --- NORMAL CARD RENDER ---
    return (
        <View style={styles.card}>
            {/* COLLAPSIBLE HEADER */}
            <TouchableOpacity
                style={styles.headerRow}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* MAIN INFORMATION */}
            <View style={styles.productInfo}>
                {product.brand && <Text style={styles.productDetail}>Brand: {product.brand}</Text>}
                <Text style={styles.productDetail}>Price: {formatPrice(product.price)}</Text>
                {product.buy_date && (
                    <Text style={styles.productDetail}>
                        Purchase Date: {formatDate(product.buy_date)}
                    </Text>
                )}

                {product.remaining_quantity != null && !product.finish_date && (
                    <Text style={styles.productHighlight}>
                        Remaining: {formatQuantity(product.remaining_quantity, product.unit)}
                    </Text>
                )}
                {product.finish_date && (
                    <Text style={styles.productHighlight}>
                        Consumed on: {formatDate(product.finish_date)}
                    </Text>
                )}
            </View>

            {/* EXPANDED SECONDARY INFORMATION */}
            {isExpanded && (
                <View style={styles.expandedSection}>
                    <Text style={styles.productDetail}>Barcode: {product.barcode}</Text>
                    {product.quantity != null && (
                        <Text style={styles.productDetail}>
                            Total Quantity: {formatQuantity(product.quantity, product.unit)}
                        </Text>
                    )}

                    {product.nutrients && (
                        <View style={styles.nutrientsSection}>
                            {product.nutrients.calories && <Text style={styles.productDetail}>Calories: {formatNutrients(product.nutrients.calories, ' kcal')}</Text>}
                            {product.nutrients.proteins && <Text style={styles.productDetail}>Proteins: {formatNutrients(product.nutrients.proteins, 'g')}</Text>}
                            {product.nutrients.carbohydrates && <Text style={styles.productDetail}>Carbohydrates: {formatNutrients(product.nutrients.carbohydrates, 'g')}</Text>}
                            {product.nutrients.fats && <Text style={styles.productDetail}>Fats: {formatNutrients(product.nutrients.fats, 'g')}</Text>}
                        </View>
                    )}
                </View>
            )}

            {/* CONSUMPTION BAR */}
            {canConsume && !product.finish_date && onConsume && (
                <View style={styles.consumeInputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Cons. weight (g or ml) - Optional"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={inputValue}
                        onChangeText={setInputValue}
                    />

                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowPicker(!showPicker)}
                    >
                        <Text style={styles.datePickerLabel}>Consumption Date:</Text>
                        <Text style={styles.datePickerValue}>
                            {consumptionDate.toLocaleDateString('en-US')}
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

            {/* ACTION BUTTONS UPDATED WITH EDIT */}
            <View style={styles.actions}>
                {canConsume && !product.finish_date && onConsume && (
                    <TouchableOpacity style={[styles.button, styles.consumeButton]} onPress={handleConsumePress}>
                        <Text style={styles.buttonText}>Consume</Text>
                    </TouchableOpacity>
                )}
                {onEdit && (
                    <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleStartEdit}>
                        <Text style={[styles.buttonText, { color: colors.text }]}>Edit</Text>
                    </TouchableOpacity>
                )}
                {onDelete && (
                    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
                        <Text style={styles.buttonText}>Delete</Text>
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
        backgroundColor: colors.white,
        marginBottom: spacing.sm, // Added to space inputs in edit mode
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    consumeButton: { backgroundColor: colors.warning },
    deleteButton: { backgroundColor: colors.danger },
    editButton: { backgroundColor: colors.lightBg, borderWidth: 1, borderColor: colors.border },
    saveButton: { backgroundColor: colors.primary },
    cancelButton: { backgroundColor: colors.lightBg, borderWidth: 1, borderColor: colors.border },
    buttonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600'
    },

    editTitle: {
        ...typography.subtitle,
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    inputLabel: {
        ...typography.small,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontWeight: '500',
    },
    unitSelector: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    unitButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        backgroundColor: colors.lightBg,
    },
    unitButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    unitButtonText: {
        ...typography.body,
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    unitButtonTextActive: {
        color: colors.white,
        fontWeight: 'bold',
    },
});