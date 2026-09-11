# GroceWise Frontend - Professional Structure

This is the Expo React Native frontend for GroceWise. The architecture is organized in a modular and scalable approach.

## 📁 Folder Structure

```
grocewise-frontend/
├── app/                    # Expo Router (expo-router)
│   ├── _layout.tsx        # Main layout with header
│   ├── index.tsx          # Redirect to (screens)
│   └── (screens)/
│       └── index.tsx      # Main fridge management screen
│
├── src/                   # Main source code
│   ├── components/        # Reusable UI components
│   │   ├── FilterButtons.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── index.ts       # Barrel export
│   │
│   ├── hooks/            # Custom hooks
│   │   └── useFridge.ts  # Core fridge logic hook
│   │
│   ├── services/         # API services and utilities
│   │   ├── api/
│   │   │   └── fridgeAPI.ts  # Axios client for APIs
│   │   └── index.ts      # Barrel export
│   │
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Centralized types (Product, Nutrients, etc.)
│   │
│   ├── constants/        # Application constants
│   │   └── config.ts     # API URLs, validations, defaults
│   │
│   ├── styles/           # Centralized styling system
│   │   └── commonStyles.ts  # Colors, spacing, typography
│   │
│   └── utils/            # Utility functions
│       └── formatting.ts # Formatting helpers (dates, prices, etc.)
│
├── assets/              # Static assets (images, fonts)
├── package.json
├── tsconfig.json
├── app.json
└── README.md

```

## 🎯 Architecture Principles

* **Separation of Concerns**: Each directory owns a distinct architectural responsibility.


* **Reusability**: Components and hooks remain isolated, modular, and reusable across screens.


* **Scalability**: New features can be integrated predictably within established patterns.


* **Type Safety**: Strictly typed with TypeScript for reliable developer experience and fewer runtime crashes.


* **Barrel Exports**: Clean multi-layer imports using designated `index.ts` files.



## 🚀 Usage Guide

### Adding a New Component

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

Export it via `src/components/index.ts`:

```typescript
export { MyComponent } from './MyComponent';

```

### Consuming Components

```typescript
import { MyComponent } from '../../src/components';

// Or via direct path
import { MyComponent } from '../../src/components/MyComponent';

```

### Adding a Custom Hook

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

## 🔧 Configuration

### API Base URL

Configure the endpoint inside `src/constants/config.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:8000'; // Or your machine's local IP address

```

### Adding Global Colors and Styles

Update `src/styles/commonStyles.ts`:

```typescript
export const colors = {
  primary: '#007AFF',
  // Add new theme tokens here
};

```

## 📦 Core Dependencies

* `axios` - HTTP client
* `react-native` - Mobile application framework
* `expo-router` - File-based navigation
* `typescript` - Static type safety

## 🏃 Running the Application

```bash
npm install      # Install dependencies
npm start        # Start the Expo development server
# Select target platform: i (iOS), a (Android), w (Web)

```

## 📝 Coding Conventions

* Components: `PascalCase` (e.g., `ProductCard.tsx`)
* Files: `camelCase` (e.g., `useFridge.ts`, `formatting.ts`)
* Directories: `lowercase` (e.g., `components/`, `hooks/`)
* Interfaces: `PascalCase` suffixed with `Props` for components (e.g., `ProductCardProps`)

## 🎨 Styling Guidelines

Styles are centralized in `src/styles/commonStyles.ts`. To ensure visual consistency, always retrieve shared colors, border radii, and spacing scales from this source:

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

* **Enforce TypeScript**: Always write strict type definitions for props, state, and API network payloads.
* **Centralize Types**: Place shared application domain interfaces inside `src/types/`.


* **Decouple via Hooks**: Extract business operations and remote side-effects into custom hooks.


* **Single Responsibility Components**: Keep UI components atomic and dedicated to a single visual task.


* **Avoid Inline Styles**: Reference tokens exclusively from `commonStyles` to support clean theming.


* **Explicit Error Handling**: Always catch, handle, and display API communication errors gracefully.

## 📚 Useful Resources

* [React Native Documentation](https://reactnative.dev)
* [Expo Documentation](https://docs.expo.dev)
* [Expo Router Guide](https://expo.github.io/router/)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/)