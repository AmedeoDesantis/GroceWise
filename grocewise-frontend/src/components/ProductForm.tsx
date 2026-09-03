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

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CameraView, useCameraPermissions } from 'expo-camera';

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
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [permission, requestPermission] = useCameraPermissions();

    const handleSubmit = async () => {
        if (!barcode.trim()) {
            Alert.alert('Errore', 'Inserisci un barcode');
            return;
        }

        try {
            await onSubmit(barcode, parseFloat(price) || DEFAULT_PRICE, buyDate);
            setBarcode('');
            setPrice('0');
            setBuyDate(new Date());
        } catch (error: any) {
            Alert.alert(
                'Errore',
                error.response?.data?.detail || 'Errore nell\'aggiunta del prodotto'
            );
        }
    };

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (data) {
            setBarcode(data);
            setScanning(false);
        }
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBuyDate(selectedDate);
        }
    };

    if (scanning) {
        if (!permission) {
            return <View style={styles.centerContainer}><Text>Richiesta permessi in corso...</Text></View>;
        }

        if (!permission.granted) {
            return (
                <View style={styles.container}>
                    <Text style={{ textAlign: 'center', marginBottom: spacing.md }}>
                        Abbiamo bisogno del tuo permesso per mostrare la fotocamera
                    </Text>
                    <Button onPress={requestPermission} title="Concedi Permesso" />
                    <TouchableOpacity
                        style={[styles.button, { marginTop: spacing.md, backgroundColor: colors.error }]}
                        onPress={() => setScanning(false)}
                    >
                        <Text style={styles.buttonText}>Annulla</Text>
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
                    <Text style={styles.buttonText}>Chiudi Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Aggiungi Prodotto</Text>

            <TouchableOpacity
                style={[styles.button, styles.cameraButton]}
                onPress={() => setScanning(true)}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>Leggi Barcode</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder={`Barcode (${BARCODE_MIN_LENGTH}-${BARCODE_MAX_LENGTH} caratteri)`}
                value={barcode}
                onChangeText={setBarcode}
                editable={!isLoading}
                maxLength={BARCODE_MAX_LENGTH}
                keyboardType="number-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Prezzo (opzionale)"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                editable={!isLoading}
            />

            <Text style={styles.fieldLabel}>Data di acquisto:</Text>
            <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isLoading}
            >
                <Text style={styles.datePickerButtonText}>
                    {buyDate.toLocaleDateString('it-IT')}
                </Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={buyDate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={onDateChange}
                />
            )}

            <TouchableOpacity
                style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>Aggiungi</Text>
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
    datePickerButton: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.xl,
        backgroundColor: colors.lightBg,
        justifyContent: 'center',
    },
    datePickerButtonText: {
        ...typography.body,
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