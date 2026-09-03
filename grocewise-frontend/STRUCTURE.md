# GroceWise Frontend - Struttura Profesionale

Questo è il frontend Expo React Native per GroceWise. La struttura è organizzata in modo modulare e scalabile.

## 📁 Struttura delle Cartelle

```
grocewise-frontend/
├── app/                    # Routing Expo (expo-router)
│   ├── _layout.tsx        # Layout principale con header
│   ├── index.tsx          # Redirect a (screens)
│   └── (screens)/
│       └── index.tsx      # Schermata principale del frigorifero
│
├── src/                   # Codice sorgente principale
│   ├── components/        # Componenti riutilizzabili
│   │   ├── FilterButtons.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── index.ts       # Barrel export
│   │
│   ├── hooks/            # Custom hooks
│   │   └── useFridge.ts  # Hook principale per la logica del frigorifero
│   │
│   ├── services/         # Servizi API e utility
│   │   ├── api/
│   │   │   └── fridgeAPI.ts  # Client Axios per le API
│   │   └── index.ts      # Barrel export
│   │
│   ├── types/            # Type definitions TypeScript
│   │   └── index.ts      # Tipi centralizzati (Product, Nutrients, etc.)
│   │
│   ├── constants/        # Costanti dell'applicazione
│   │   └── config.ts     # URL API, validazioni, defaults
│   │
│   ├── styles/           # Stili centralizzati
│   │   └── commonStyles.ts  # Colori, spacing, tipografia
│   │
│   └── utils/            # Utility functions
│       └── formatting.ts # Formattazione (date, price, etc.)
│
├── assets/              # Risorse (immagini, fonts)
├── package.json
├── tsconfig.json
├── app.json
└── README.md
```

## 🎯 Principi di Organizzazione

- **Separazione dei Compiti**: Ogni cartella ha una responsabilità specifica
- **Riusabilità**: Componenti e hooks sono modulari e riutilizzabili
- **Scalabilità**: Facile aggiungere nuove feature mantenendo la struttura
- **Type Safety**: TypeScript per una migliore developer experience
- **Barrel Exports**: File `index.ts` per importi più puliti

## 🚀 Come Usare

### Aggiungere un Nuovo Componente

```typescript
// src/components/MyComponent.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/commonStyles';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
});
```

Poi aggiungere al `src/components/index.ts`:
```typescript
export { MyComponent } from './MyComponent';
```

### Usare nel codice
```typescript
import { MyComponent } from '../../src/components';

// Oppure direttamente
import { MyComponent } from '../../src/components/MyComponent';
```

### Aggiungere un Custom Hook

```typescript
// src/hooks/useMyHook.ts
import { useState, useCallback } from 'react';

export const useMyHook = () => {
  const [state, setState] = useState(null);

  const updateState = useCallback(async (newValue) => {
    setState(newValue);
  }, []);

  return { state, updateState };
};
```

## 🔧 Configurazione

### API Base URL

Modificare in `src/constants/config.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8000'; // o il tuo IP
```

### Aggiungere Colori/Stili Globali

Modificare `src/styles/commonStyles.ts`:
```typescript
export const colors = {
  primary: '#007AFF',
  // Aggiungi nuovi colori qui
};
```

## 📦 Dipendenze Principali

- `axios` - HTTP client
- `react-native` - Framework mobile
- `expo-router` - Routing
- `typescript` - Type safety

## 🏃 Eseguire l'App

```bash
npm install      # Installa dipendenze
npm start        # Avvia Expo
# Scegli il platform: i (iOS), a (Android), w (Web)
```

## 📝 Convenzioni

- Componenti: `PascalCase` (e.g., `ProductCard.tsx`)
- File: `camelCase` (e.g., `useFridge.ts`, `formatting.ts`)
- Cartelle: `lowercase` (e.g., `components/`, `hooks/`)
- Interfacce: `PascalCase` con suffisso `Props` (e.g., `ProductCardProps`)

## 🎨 Stili

Tutti gli stili sono centralizzati in `src/styles/commonStyles.ts`. Per consistenza, usa sempre i colori e lo spacing da lì:

```typescript
import { colors, spacing, borderRadius } from '../styles/commonStyles';

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
  },
});
```

## 🔐 Best Practices

✅ **Usa TypeScript** - Definisci i tipi per props, state, API responses  
✅ **Centralizza Types** - Metti tutti i tipi in `src/types/`  
✅ **Usa Hooks** - Estratta la logica in custom hooks  
✅ **Componenti Piccoli** - Un componente = una responsabilità  
✅ **Stili Centralizzati** - Non inline styles, usa `commonStyles`  
✅ **Error Handling** - Gestisci sempre gli errori nelle API calls

## 📚 Risorse

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://expo.github.io/router/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
