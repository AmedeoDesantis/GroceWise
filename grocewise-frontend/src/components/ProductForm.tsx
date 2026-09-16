import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Button,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../styles/commonStyles';

import { BARCODE_MIN_LENGTH, BARCODE_MAX_LENGTH, DEFAULT_PRICE } from '../constants/config';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { DatePicker } from './DatePicker';

interface ProductFormProps {
    onSubmit: (barcode: string, price: number, buyDate: Date) => Promise<void>;
    isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    onSubmit,
    isLoading = false,
}) => {
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('0');
    const [scanning, setScanning] = useState(false);

    const [buyDate, setBuyDate] = useState<Date>(new Date());

    const [permission, requestPermission] = useCameraPermissions();

    const handleSubmit = async () => {
        if (!barcode.trim()) {
            Alert.alert('Error', 'Enter a barcode');
            return;
        }

        try {
            await onSubmit(barcode, parseFloat(price) || DEFAULT_PRICE, buyDate);
            setBarcode('');
            setPrice('0');
            setBuyDate(new Date());
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.detail || 'Error adding product'
            );
        }
    };

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (data) {
            setBarcode(data);
            setScanning(false);
        }
    };

    if (scanning) {
        if (!permission) {
            return <View style={styles.centerContainer}><Text>Requesting permissions...</Text></View>;
        }

        if (!permission.granted) {
            return (
                <View style={styles.container}>
                    <Text style={{ textAlign: 'center', marginBottom: spacing.md }}>
                        We need your permission to show the camera
                    </Text>
                    <Button onPress={requestPermission} title="Grant Permission" />
                    <TouchableOpacity
                        style={[styles.button, { marginTop: spacing.md, backgroundColor: colors.error }]}
                        onPress={() => setScanning(false)}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    barcodeScannerSettings={{
                        barcodeTypes: ['ean13', 'ean8', 'upc_a'],
                    }}
                    onBarcodeScanned={handleBarcodeScanned}
                />
                <TouchableOpacity
                    style={styles.closeCameraButton}
                    onPress={() => setScanning(false)}
                >
                    <Text style={styles.buttonText}>Close Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Add Product</Text>

            <TouchableOpacity
                style={[styles.button, styles.cameraButton]}
                onPress={() => setScanning(true)}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>Scan Barcode</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder={`Barcode (${BARCODE_MIN_LENGTH}-${BARCODE_MAX_LENGTH} characters)`}
                value={barcode}
                onChangeText={setBarcode}
                editable={!isLoading}
                maxLength={BARCODE_MAX_LENGTH}
                keyboardType="number-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Price (optional)"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                editable={!isLoading}
            />

            <DatePicker
                value={buyDate}
                onChange={setBuyDate}
                label="Purchase Date:"
                maxDate={new Date()}
                disabled={isLoading}
            />

            <TouchableOpacity
                style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
        </View>
    );
};
export const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
        ...shadows.card,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraContainer: {
        height: 300,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginBottom: spacing.md,
        position: 'relative',
    },
    closeCameraButton: {
        position: 'absolute',
        bottom: spacing.md,
        alignSelf: 'center',
        backgroundColor: colors.overlay,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    label: {
        ...typography.subtitle,
        marginBottom: spacing.md,
        color: colors.text,
    },
    fieldLabel: {
        ...typography.body,
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        ...typography.body,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: colors.lightBg,
        color: colors.text,
    },
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: colors.success,
    },
    cameraButton: {
        backgroundColor: colors.primary,
        marginBottom: spacing.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600',
    },
});