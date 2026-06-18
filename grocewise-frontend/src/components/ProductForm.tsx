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

// Rimaniano solo con la libreria nativa di Expo
import { CameraView, useCameraPermissions } from 'expo-camera';

interface ProductFormProps {
    onSubmit: (barcode: string, price: number) => Promise<void>;
    isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    onSubmit,
    isLoading = false,
}) => {
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('0');
    const [scanning, setScanning] = useState(false);

    // Gestione dei permessi hardware della fotocamera
    const [permission, requestPermission] = useCameraPermissions();

    const handleSubmit = async () => {
        if (!barcode.trim()) {
            Alert.alert('Errore', 'Inserisci un barcode');
            return;
        }

        try {
            await onSubmit(barcode, parseFloat(price) || DEFAULT_PRICE);
            setBarcode('');
            setPrice('0');
        } catch (error: any) {
            Alert.alert(
                'Errore',
                error.response?.data?.detail || 'Errore nell\'aggiunta del prodotto'
            );
        }
    };

    // Funzione che gestisce l'evento di lettura del codice a barre
    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (data) {
            setBarcode(data); // Inserisce il codice estratto nel campo di testo
            setScanning(false); // Chiude la fotocamera e torna al form
        }
    };

    // GESTIONE STATI DELLA FOTOCAMERA
    if (scanning) {
        // 1. Se i permessi non sono ancora stati richiesti
        if (!permission) {
            return <View style={styles.centerContainer}><Text>Richiesta permessi in corso...</Text></View>;
        }

        // 2. Se l'utente ha rifiutato i permessi
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

        // 3. Mostra la fotocamera attiva se i permessi sono validi
        return (
            <View style={styles.cameraContainer}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    barcodeScannerSettings={{
                        barcodeTypes: ['ean13', 'ean8', 'upc_a'], // Specifichiamo i formati industriali dei cibi
                    }}
                    onBarcodeScanned={handleBarcodeScanned}
                />
                {/* Pulsante di chiusura sopra la fotocamera */}
                <TouchableOpacity
                    style={styles.closeCameraButton}
                    onPress={() => setScanning(false)}
                >
                    <Text style={styles.buttonText}>❌ Chiudi Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // FORM STANDARD DI INSERIMENTO
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Aggiungi Prodotto</Text>

            {/* Bottone fotocamera */}
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
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
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
        height: 300, // Diamogli un'altezza fissa nel form per non spaccare il layout
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
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        fontSize: 14,
        backgroundColor: colors.lightBg,
    },
    button: {
        backgroundColor: colors.success,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    cameraButton: {
        backgroundColor: '#007aff', // Colore azzurro per differenziarlo dal tasto conferma
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