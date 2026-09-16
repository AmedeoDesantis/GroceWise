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
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import {
    formatDate,
    formatPrice,
    formatNutrients,
    formatQuantity,
} from '../utils/formatting';
import { colors, spacing, shadows, borderRadius, typography } from '../styles/commonStyles';
import { DatePicker } from './DatePicker';

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
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [showConsumptionControls, setShowConsumptionControls] = useState<boolean>(false);

    // --- NEW STATES FOR EDITING ---
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editName, setEditName] = useState(product.name);
    const [editPrice, setEditPrice] = useState(product.price?.toString() || '');
    const [editQuantity, setEditQuantity] = useState(product.quantity?.toString() || '');
    const [editUnit, setEditUnit] = useState<'g' | 'kg' | 'l' | 'ml' | undefined>(product.unit as any);

    const handleConsumePress = () => {
        if (!onConsume) return;
        const parsedWeight = inputValue.trim() !== '' ? parseFloat(inputValue) : null;
        onConsume(parsedWeight, consumptionDate);
        setInputValue('');
        setConsumptionDate(new Date());
        setShowConsumptionControls(false);
    };

    const handleConsumeButtonPress = () => {
        setShowConsumptionControls(!showConsumptionControls);
    };

    const handleConsumeAll = () => {
        if (!onConsume) return;
        onConsume(null, new Date());
        setShowConsumptionControls(false);
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
                <View style={styles.cardRow}>
                    {/* LEFT SIDE - CONTENT */}
                    <View style={styles.cardContent}>
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
                    </View>

                    {/* RIGHT SIDE - ACTION BUTTONS */}
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={[styles.iconButton, styles.saveIconButton]}
                            onPress={handleSaveEdit}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="checkmark"
                                size={18}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, styles.cancelIconButton]}
                            onPress={handleCancelEdit}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="close"
                                size={18}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // --- NORMAL CARD RENDER ---
    return (
        <View style={styles.card}>
            <View style={styles.cardRow}>
                {/* LEFT SIDE - CONTENT */}
                <View style={styles.cardContent}>
                    {/* PRODUCT HEADER */}
                    <TouchableOpacity
                        style={styles.headerRow}
                        onPress={toggleExpand}
                        activeOpacity={0.7}
                    >
                        <View style={styles.productInfoHeader}>
                            <Text style={styles.productName}>{product.name}</Text>
                            {product.brand && (
                                <Text style={styles.productBrand}>{product.brand}</Text>
                            )}
                        </View>
                        <Text style={styles.toggleIcon}>{isExpanded ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {/* MAIN INFORMATION */}
                    <View style={styles.productInfo}>
                        <View style={styles.infoBadges}>
                            {product.price && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{formatPrice(product.price)}</Text>
                                </View>
                            )}
                            {product.buy_date && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{formatDate(product.buy_date)}</Text>
                                </View>
                            )}
                        </View>

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
                    {showConsumptionControls && canConsume && !product.finish_date && onConsume && (
                        <View style={styles.consumeInputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Cons. weight (g or ml) - Optional"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                value={inputValue}
                                onChangeText={setInputValue}
                            />

                            <DatePicker
                                value={consumptionDate}
                                onChange={setConsumptionDate}
                                label="Consumption Date:"
                                maxDate={new Date()}
                            />
                        </View>
                    )}
                </View>

                {/* RIGHT SIDE - ACTION BUTTONS */}
                <View style={styles.actionButtonsRow}>
                    {canConsume && !product.finish_date && onConsume && (
                        <>
                            <TouchableOpacity
                                style={[styles.iconButton, styles.consumeIconButton]}
                                onPress={handleConsumeButtonPress}
                                onLongPress={handleConsumeAll}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons
                                    name={showConsumptionControls ? "close" : "restaurant"}
                                    size={18}
                                    color={colors.white}
                                />
                            </TouchableOpacity>
                            {showConsumptionControls && (
                                <TouchableOpacity
                                    style={[styles.iconButton, styles.consumeAllIconButton]}
                                    onPress={handleConsumeAll}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={18}
                                        color={colors.white}
                                    />
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                    {onEdit && (
                        <TouchableOpacity
                            style={[styles.iconButton, styles.editIconButton]}
                            onPress={handleStartEdit}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="create"
                                size={18}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            style={[styles.iconButton, styles.deleteIconButton]}
                            onPress={onDelete}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name="trash"
                                size={18}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    )}
                </View>
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
    cardRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    productInfoHeader: {
        flex: 1,
    },
    productName: {
        ...typography.subtitle,
        color: colors.text,
        fontWeight: '600',
    },
    productBrand: {
        ...typography.small,
        color: colors.textSecondary,
        marginTop: 2,
    },
    toggleIcon: {
        fontSize: 16,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    productInfo: {
        marginBottom: spacing.sm
    },
    infoBadges: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
        flexWrap: 'wrap',
    },
    badge: {
        backgroundColor: colors.lightBg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        ...typography.small,
        color: colors.textSecondary,
        fontWeight: '500',
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
    actionButtonsRow: {
        flexDirection: 'column',
        gap: spacing.sm,
        justifyContent: 'flex-start',
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
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    consumeIconButton: {
        backgroundColor: colors.warning,
    },
    consumeAllIconButton: {
        backgroundColor: colors.success,
    },
    editIconButton: {
        backgroundColor: colors.lightBg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    deleteIconButton: {
        backgroundColor: colors.danger,
    },
    saveIconButton: {
        backgroundColor: colors.primary,
    },
    cancelIconButton: {
        backgroundColor: colors.lightBg,
        borderWidth: 1,
        borderColor: colors.border,
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
    consumeAllButton: { backgroundColor: colors.success },
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