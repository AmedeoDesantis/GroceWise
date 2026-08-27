import { StyleSheet } from 'react-native';

export const colors = {
    primary: '#B66D52',
    success: '#6B8E6B',
    warning: '#D4A35C',
    danger: '#B55042',
    error: '#B55042',

    background: '#F9F8F6',
    white: '#FFFFFF',
    lightBg: '#F4F2EE',       // Reso ancora un filo più caldo e integrato

    text: '#36312D',
    textSecondary: '#7A7571',
    textLight: '#ABA5A0',

    // Bordo reso ancora più delicato, quasi impercettibile
    border: '#EAE6E1',

    surfaceDark: '#45413E',
    textMuted: '#9E9893',
    darkBg: '#2A2725',
    overlay: 'rgba(42, 39, 37, 0.6)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

// --- RAGGI AFFILATI (Stile Editoriale) ---
export const borderRadius = {
    sm: 2,       // Micro-smussatura (invece di 4)
    md: 4,       // Standard per input e bottoni (invece di 8). Molto strutturato.
    lg: 8,       // Per le Card e i Grafici (invece di 16). Tagliente ed elegante.
    xl: 12,
    xxl: 16,
    pill: 999,
};

export const shadows = StyleSheet.create({
    card: {
        // Via le ombre! Nel minimalismo puro usiamo il Flat Design.
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0, // Toglie l'ombra anche su Android

        // Invece dell'ombra, applichiamo un bordo chirurgico e leggerissimo
        // Siccome fai lo "spread" (...shadows.card) nei componenti, questo
        // bordo si applicherà magicamente a tutte le card senza toccare altro codice.
        borderWidth: 1,
        borderColor: '#F0EBE6',
    },
});

export const typography = {
    title: {
        fontSize: 28,
        fontWeight: 'bold' as const,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 14,
        fontWeight: '400' as const,
    },
    small: {
        fontSize: 13,
        fontWeight: '400' as const,
    },
};