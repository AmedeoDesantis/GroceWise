import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { ProductForm } from './ProductForm';
import { colors, spacing, borderRadius, shadows, typography, layout } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface ProductFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (barcode: string, price: number, buyDate: Date) => Promise<void>;
    isLoading?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    visible,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'web' ? 'pageSheet' : 'pageSheet'}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Form Content */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <ProductForm onSubmit={onSubmit} isLoading={isLoading} />
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
        maxWidth: layout.maxWidth,
        width: '100%',
        alignSelf: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layout.contentPadding,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.white,
    },
    title: {
        ...typography.subtitle,
        color: colors.text,
        fontWeight: '600',
    },
    closeButton: {
        padding: spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: layout.contentPadding,
    },
});
