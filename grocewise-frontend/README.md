# GroceWise Frontend

App mobile React Native/Expo per GroceWise - Sistema di gestione intelligente dell'inventario alimentare.

## 📋 Panoramica

Il frontend fornisce un'interfaccia mobile intuitiva per la gestione dei prodotti alimentari, scanner di codici a barre, analisi dei consumi e visualizzazione di classifiche nutrizionali. Costruito con React Native e Expo per supporto multi-piattaforma (iOS, Android, Web).

## 🏗️ Architettura

### Component-Based Architecture

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│      (Screens, Components)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Custom Hooks Layer             │
│      (Business Logic)               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      API Services Layer             │
│      (HTTP Communication)           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Backend API                    │
│      (FastAPI + MongoDB)            │
└─────────────────────────────────────┘
```

### Design Patterns Implementati

**Custom Hooks Pattern**
- `useFridge`: Gestione stato frigorifero e operazioni CRUD
- `useAnalytics`: Gestione dati analitici e caricamento statistiche
- Separazione logica business da UI
- Riutilizzabilità across componenti

**Component Composition**
- Componenti atomici e riutilizzabili
- Props interface chiare e typed
- Separazione responsabilità visive

**Service Layer Pattern**
- API services centralizzati
- Axios per chiamate HTTP
- Error handling consistente
- Interceptor per gestione errori globali

## 📁 Struttura del Progetto

```
grocewise-frontend/
├── app/                          # Expo Router (File-based routing)
│   ├── (screens)/               # Schermate principali
│   │   ├── index.tsx           # Gestione Frigorifero
│   │   └── analytics.tsx       # Analisi Consumi
│   ├── _layout.tsx             # Layout globale
│   └── index.tsx               # Root navigation
├── src/
│   ├── components/             # Componenti UI riutilizzabili
│   │   ├── ProductForm.tsx    # Form aggiunta prodotto
│   │   ├── ProductCard.tsx    # Card prodotto singolo
│   │   ├── ProductList.tsx    # Lista prodotti
│   │   ├── FilterButtons.tsx  # Filtri stato consumo
│   │   ├── MetricSelector.tsx # Selettore metriche analisi
│   │   ├── ConsumptionChart.tsx # Grafico consumi
│   │   └── RankingListItem.tsx # Item classifica prodotti
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useFridge.ts       # Hook gestione frigo
│   │   └── useAnalytics.ts    # Hook gestione analisi
│   ├── services/              # API Services
│   │   ├── api/
│   │   │   ├── fridgeAPI.ts   # API frigorifero
│   │   │   └── analyticsAPI.ts # API analisi
│   │   └── index.ts           # Export services
│   ├── utils/                 # Utility functions
│   │   ├── analytics.ts       # Funzioni calcolo analisi
│   │   └── formatting.ts      # Funzioni formattazione
│   ├── constants/             # Configurazioni
│   │   ├── config.ts          # Configurazione generale
│   │   └── analytics.ts       # Costanti analisi
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Type definitions
│   └── styles/                # Stili condivisi
│       └── commonStyles.ts    # Stili globali
├── assets/                    # Risorse statiche
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── .env                       # Environment variables
```

## 🚀 Setup e Installazione

### Prerequisiti
- Node.js 18+
- npm o yarn
- Expo CLI
- Android Studio (per Android development)
- Xcode (per iOS development, solo Mac)

### Installazione

```bash
# Clona il repository
cd grocewise-frontend

# Installa dipendenze
npm install

# Configura ambiente
cp .env.example .env
```

### Configurazione Ambiente

Modifica il file `.env`:

```env
API_BASE_URL=http://localhost:8000
```

Per produzione, sostituisci con l'URL del backend reale.

### Avvio Sviluppo

```bash
# Avvia development server
npx expo start

# Per Android
npx expo start --android

# Per iOS
npx expo start --ios

# Per Web
npx expo start --web
```

### Expo Go App

Per testing rapido su dispositivo fisico:

1. Installa Expo Go dal Play Store/App Store
2. Scansiona il QR code mostrato nel terminale
3. L'app si ricaricherà automaticamente ad ogni salvataggio

## 📱 Schermate e Funzionalità

### Home Screen (Fridge Management)

**Componenti principali:**
- `ProductForm`: Form per aggiunta prodotti con scanner barcode
- `FilterButtons`: Filtri per stato consumo (Tutti/Non Consumati/Consumati)
- `ProductList`: Lista prodotti con card interattive

**Funzionalità:**
- Scanner codici a barre con fotocamera
- Aggiunta manuale barcode e prezzo
- Selezione data acquisto
- Consumo prodotti (totale o parziale)
- Eliminazione prodotti
- Navigazione a schermata analytics

### Analytics Screen

**Componenti principali:**
- `MetricSelector`: Selettore metriche (Calorie, Proteine, Carboidrati, Grassi)
- `ConsumptionChart`: Grafico temporale consumi
- `RankingListItem`: Lista classifica prodotti

**Funzionalità:**
- Visualizzazione grafici temporali
- Cambio metrica analizzata
- Filtraggio per singolo prodotto
- Classifica prodotti migliori
- Rimozione filtro prodotto

## 🧩 Componenti Principali

### ProductForm

Gestisce l'aggiunta di nuovi prodotti:

**Features:**
- Scanner barcode con `expo-camera`
- Input manuale barcode
- Input prezzo opzionale
- DatePicker per data acquisto
- Validazione input
- Gestione permessi fotocamera

**Stati:**
- `barcode`: Codice a barre
- `price`: Prezzo prodotto
- `scanning`: Stato attivazione fotocamera
- `buyDate`: Data acquisto
- `showDatePicker`: Visibilità date picker

### ProductCard

Card singolo prodotto con azioni:

**Features:**
- Display informazioni prodotto
- Pulsante consumo
- Pulsante eliminazione
- Modal consumo parziale
- Visualizzazione stato consumo

### FilterButtons

Filtri per stato prodotti:

**Opzioni:**
- "Tutti": Mostra tutti i prodotti
- "Non Consumati": Solo prodotti disponibili
- "Consumati": Solo storico consumi

### ConsumptionChart

Grafico temporale consumi:

**Libreria:** react-native-chart-kit

**Features:**
- Line chart con dati temporali
- Supporto multiple metriche
- Responsive design
- Colori personalizzati

### RankingListItem

Item nella classifica prodotti:

**Features:**
- Display posizione ranking
- Informazioni prodotto
- Punteggio calcolato
- Interattività per dettagli

## 🪝 Custom Hooks

### useFridge

Hook per gestione stato frigorifero:

**Stati:**
- `products`: Lista prodotti
- `loading`: Stato caricamento
- `filterType`: Tipo filtro attivo

**Funzioni:**
- `loadProducts`: Carica prodotti dal backend
- `addProduct`: Aggiunge nuovo prodotto
- `consumeProduct`: Marca prodotto come consumato
- `deleteProduct`: Elimina prodotto
- `deleteAllProducts`: Elimina tutti i prodotti

**Logica:**
- Auto-refresh al cambio filtro
- Error handling con Alert
- Loading states

### useAnalytics

Hook per gestione dati analitici:

**Stati:**
- `loading`: Stato caricamento
- `rawData`: Dati grezzi consumi
- `topProducts`: Classifica prodotti
- `activeMetric`: Metrica attiva

**Funzioni:**
- `loadAnalytics`: Carica dati analitici
- `setActiveMetric`: Cambia metrica visualizzata

**Logica:**
- Caricamento condizionale ranking
- Filtraggio per prodotto selezionato
- Calcolo labels e dataset

## 🔌 API Services

### FridgeAPI

Servizio per comunicazioni API frigorifero:

**Metodi:**
- `getUnconsumedProducts()`: Recupera prodotti non consumati
- `getConsumedProducts()`: Recupera prodotti consumati
- `getAllProducts()`: Recupera tutti i prodotti
- `addProduct(barcode, price, buy_date)`: Aggiunge prodotto
- `consumeProduct(id, quantity, date)`: Consuma prodotto
- `deleteProduct(id)`: Elimina prodotto
- `deleteAllProducts()`: Elimina tutti

### AnalyticsAPI

Servizio per comunicazioni API analisi:

**Metodi:**
- `getConsumptionAnalytics(startDate, endDate)`: Statistiche globali
- `getSingleProductAnalytics(productId, startDate, endDate)`: Statistiche prodotto

## 🎨 Styling

### commonStyles.ts

Stili globali centralizzati:

**Categorie:**
- `colors`: Palette colori (primary, success, error, text, etc.)
- `spacing`: Spaziature (xs, sm, md, lg, xl, xxl)
- `typography`: Tipografia (small, body, subtitle, title)
- `borderRadius`: Border radius (sm, md, lg, pill)
- `shadows`: Effetti ombra (card, button)

**Vantaggi:**
- Consistenza visiva
- Facile manutenzione
- Theme switching ready
- Type-safe

## 🔧 Configurazione

### app.json

Configurazione Expo principale:

**Sezioni chiave:**
- `expo.name`: Nome applicazione
- `expo.slug`: URL slug
- `expo.version`: Versione
- `expo.orientation`: Orientamento supportato
- `expo.plugins`: Plugin configurati (camera, etc.)

### tsconfig.json

Configurazione TypeScript:

**Impostazioni:**
- Strict mode abilitato
- Path aliases
- Target ES2020
- Module resolution Node

## 📊 Tipi TypeScript

### Type Definitions

**Tipi principali:**
```typescript
interface Product {
  db_id: string;
  barcode: string;
  name: string;
  brand: string;
  price: number;
  buy_date: string;
  finish_date: string;
  nutrients: Nutrients;
  // ...
}

interface DayStats {
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

interface RankedProduct {
  product: Product;
  score: number;
  scoreLabel: string;
}
```

## 🧪 Testing

### Unit Tests

```bash
# Installa dipendenze testing
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Esegui tests
npm test

# Con coverage
npm test -- --coverage
```

### E2E Tests

```bash
# Installa Detox
npm install --save-dev detox

# Build test app
detox build --configuration ios.sim.debug

# Esegui tests
detox test --configuration ios.sim.debug
```

## 📱 Platform-Specific Considerations

### Android

**Permessi richiesti:**
- `CAMERA`: Per scanner barcode
- `INTERNET`: Per chiamate API

**Configurazione:**
- Aggiungi permessi in `android/app/src/main/AndroidManifest.xml`
- Configura ProGuard se necessario

### iOS

**Permessi richiesti:**
- `NSCameraUsageDescription`: Descrizione uso fotocamera

**Configurazione:**
- Aggiungi permessi in `ios/Podfile`
- Configura Info.plist

### Web

**Limitazioni:**
- Camera support limitato
- Alcune API React Native non disponibili
- Performance inferiore rispetto a native

## 🔒 Sicurezza

### Environment Variables
- API URL in `.env` (non committare)
- Nessuna hardcoded API key
- Validazione input lato client

### API Communication
- HTTPS in produzione
- Error handling appropriato
- Sanitizzazione dati

## 🚀 Deployment

### Expo Application Services (EAS)

```bash
# Installa EAS CLI
npm install -g eas-cli

# Login
eas login

# Configura progetto
eas build:configure

# Build per iOS
eas build --platform ios

# Build per Android
eas build --platform android

# Submit agli store
eas submit --platform ios
eas submit --platform android
```

### Web Deployment

```bash
# Build web version
npx expo export:web

# Deploy su hosting (es. Vercel, Netlify)
# Copia la cartella web-build
```

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache
npx expo start -c

# Reset cache
rm -rf node_modules/.cache
```

### Camera Not Working
- Verifica permessi in device settings
- Controlla configurazione app.json
- Testa su device fisico (emulator potrebbe non supportare camera)

### API Connection Issues
- Verifica backend sia in esecuzione
- Controlla API_BASE_URL in .env
- Verifica connessione network
- Controlla CORS configuration backend

### Build Failures
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Clear Expo cache
expo r -c

# Reinstall pods (iOS)
cd ios
pod install
cd ..
```

## 📈 Performance

### Ottimizzazioni Implementate
- Lazy loading delle schermate
- Memoization con React.memo
- Virtualized lists per liste lunghe
- Image optimization
- Code splitting automatico con Expo Router

### Best Practices
- Evita re-render non necessari
- Usa useCallback/useMemo appropriatamente
- Ottimizza immagini
- Minimizza bundle size

## 🔮 Feature Future

- [ ] Offline mode con cache locale
- [ ] Push notifications per scadenze
- [ ] Dark mode
- [ ] Multi-lingua support (i18n)
- [ ] Biometric authentication
- [ ] Widget home screen
- [ ] Share functionality
- [ ] Advanced filtering e search

## 🤝 Contributi

Per contribuire al frontend:

1. Segui React Native best practices
2. Usa TypeScript per type safety
3. Aggiungi unit tests per nuove funzionalità
4. Segui lo stile esistente (commonStyles)
5. Documenta componenti complessi
6. Testa su multiple piattaforme

## 📚 Risorse Utili

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)

## 📄 Licenza

MIT License - Vedi file LICENSE nella root del progetto
