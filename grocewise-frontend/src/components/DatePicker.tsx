import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, spacing, borderRadius, typography } from '../styles/commonStyles';

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
    maxDate?: Date;
    disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label,
    maxDate,
    disabled = false,
}) => {
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (event.type === 'set' && selectedDate) {
            onChange(selectedDate);
        }
    };

    const handlePress = () => {
        if (!disabled) {
            setShowPicker(!showPicker);
        }
    };

    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                {label && <Text style={styles.label}>{label}</Text>}
                <input
                    type="date"
                    value={value.toISOString().split('T')[0]}
                    max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
                    onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        onChange(newDate);
                    }}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
                        fontSize: '16px',
                        color: '#333',
                        opacity: disabled ? 0.6 : 1,
                    }}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={[styles.datePickerButton, disabled && styles.datePickerButtonDisabled]}
                onPress={handlePress}
                disabled={disabled}
            >
                <Text style={[styles.datePickerValue, disabled && styles.datePickerValueDisabled]}>
                    {value.toLocaleDateString('en-US')}
                </Text>
            </TouchableOpacity>

            {showPicker && !disabled && (
                <DateTimePicker
                    value={value}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={maxDate}
                    onChange={onChangeDate}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
    },
    label: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
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
    datePickerButtonDisabled: {
        backgroundColor: colors.lightBg,
        opacity: 0.6,
    },
    datePickerValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
    },
    datePickerValueDisabled: {
        color: colors.textSecondary,
    },
});
