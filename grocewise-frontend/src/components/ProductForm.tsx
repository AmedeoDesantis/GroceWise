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
import { colors, spacing, typography, borderRadius } from '../styles/commonStyles';
import { BARCODE_MIN_LENGTH, BARCODE_MAX_LENGTH, DEFAULT_PRICE } from '../constants/config';

// Importa il DateTimePicker
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

    const [buyDate, setBuyDate] = useState<Date>(new Date()); // Tiene traccia della data scelta
    const [showDatePicker, setShowDatePicker] = useState(false); // Controlla la visibilità del selettore

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
            setBuyDate(new Date()); // Reset alla data odierna
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
                    <Text style={styles.buttonText}>❌ Chiudi Camera</Text>
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
                <Text style={styles.buttonText}>📷 Leggi Barcode</Text>
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

            {/* SEZIONE COMPONENTE SELETTORE DATA */}
            <Text style={styles.fieldLabel}>Data di acquisto:</Text>
            <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isLoading}
            >
                <Text style={styles.datePickerButtonText}>
                    📅 {buyDate.toLocaleDateString('it-IT')}
                </Text>
            </TouchableOpacity>

            {/* Mostra il DatePicker nativo solo se attivato */}
            {showDatePicker && (
                <DateTimePicker
                    value={buyDate}
                    mode="date"
                    display="default" // Mostra il layout migliore in base alla piattaforma (iOS/Android)
                    maximumDate={new Date()} // Impedisce di selezionare date future
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

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: spacing.sm,
        borderRadius: borderRadius.md,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: spacing.md,
        color: colors.text,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        fontSize: 14,
        backgroundColor: colors.lightBg,
    },
    // Nuovi stili per il bottone del DatePicker
    datePickerButton: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.xl, // Lascia spazio prima del tasto invio
        backgroundColor: colors.lightBg,
        justifyContent: 'center',
    },
    datePickerButtonText: {
        fontSize: 14,
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
        backgroundColor: '#007aff',
        marginBottom: spacing.md,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
});