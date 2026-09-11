# GroceWise Frontend

React Native/Expo mobile app for GroceWise - Smart food inventory management system.

## 📋 Overview

The frontend provides an intuitive mobile interface for food product management, barcode scanning, consumption analytics, and nutritional rankings visualization. Built with React Native and Expo for cross-platform support (iOS, Android, Web).

## 🏗️ Architecture

### Component-Based Architecture

```
┌─────────────────────────────────────┐
│       Presentation Layer            │
│       (Screens, Components)         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Custom Hooks Layer            │
│       (Business Logic)              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       API Services Layer            │
│       (HTTP Communication)          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Backend API                   │
│       (FastAPI + MongoDB)           │
└─────────────────────────────────────┘

```

### Implemented Design Patterns

**Custom Hooks Pattern**

* `useFridge`: Fridge state management and CRUD operations
* `useAnalytics`: Analytics data management and statistics loading
* Separation of business logic from UI
* Reusability across components

**Component Composition**

* Atomic and reusable components
* Clear and typed props interfaces
* Separation of visual concerns

**Service Layer Pattern**

* Centralized API services
* Axios for HTTP communication
* Consistent error handling
* Interceptors for global error management

## 📁 Project Structure

```
grocewise-frontend/
├── app/                          # Expo Router (File-based routing)
│   ├── (screens)/                # Main screens
│   │   ├── index.tsx             # Fridge Management
│   │   └── analytics.tsx         # Consumption Analytics
│   ├── _layout.tsx               # Global layout
│   └── index.tsx                 # Root navigation
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ProductForm.tsx       # Add product form
│   │   ├── ProductCard.tsx       # Single product card
│   │   ├── ProductList.tsx       # Product list
│   │   ├── FilterButtons.tsx     # Consumption status filters
│   │   ├── MetricSelector.tsx    # Analytics metric selector
│   │   ├── ConsumptionChart.tsx  # Consumption chart
│   │   └── RankingListItem.tsx   # Product ranking item
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useFridge.ts          # Fridge management hook
│   │   └── useAnalytics.ts       # Analytics management hook
│   ├── services/                 # API Services
│   │   ├── api/
│   │   │   ├── fridgeAPI.ts      # Fridge API
│   │   │   └── analyticsAPI.ts   # Analytics API
│   │   └── index.ts              # Service exports
│   ├── utils/                    # Utility functions
│   │   ├── analytics.ts          # Analytics calculation utilities
│   │   └── formatting.ts         # Formatting utilities
│   ├── constants/                # Configuration and constants
│   │   ├── config.ts             # General configuration
│   │   └── analytics.ts          # Analytics constants
│   ├── types/                    # TypeScript types
│   │   └── index.ts              # Type definitions
│   └── styles/                   # Shared styles
│       └── commonStyles.ts       # Global styles
├── assets/                       # Static assets
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── .env                          # Environment variables

```

## 🚀 Setup and Installation

### Prerequisites

* Node.js 18+
* npm or yarn
* Expo CLI
* Android Studio (for Android development)
* Xcode (for iOS development, macOS only)

### Installation

```bash
# Clone repository
cd grocewise-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

```

### Environment Configuration

Update the `.env` file:

```env
API_BASE_URL=http://localhost:8000

```

For production, replace this with your production backend URL.

### Starting Development

```bash
# Start development server
npx expo start

# For Android
npx expo start --android

# For iOS
npx expo start --ios

# For Web
npx expo start --web

```

### Expo Go App

For fast testing on a physical device:

1. Install Expo Go from the Google Play Store or Apple App Store.
2. Scan the QR code displayed in the terminal.
3. The app will automatically reload whenever changes are saved.

## 📱 Screens and Features

### Home Screen (Fridge Management)

**Main Components:**

* `ProductForm`: Form to add products with an integrated barcode scanner
* `FilterButtons`: Filters by consumption status (All / Unconsumed / Consumed)
* `ProductList`: Product list with interactive cards

**Features:**

* Camera-based barcode scanner
* Manual barcode and price entry
* Purchase date selection
* Product consumption (total or partial)
* Product deletion
* Navigation to the analytics screen

### Analytics Screen

**Main Components:**

* `MetricSelector`: Metric picker (Calories, Proteins, Carbohydrates, Fats)
* `ConsumptionChart`: Temporal consumption chart
* `RankingListItem`: Product ranking list item

**Features:**

* Temporal chart visualization
* Dynamic analyzed metric switching
* Filtering by individual product
* Top products efficiency ranking
* Product filter reset

## 🧩 Main Components

### ProductForm

Manages product creation:

**Features:**

* Barcode scanner via `expo-camera`
* Manual barcode input
* Optional price input
* DatePicker for purchase date
* Input validation
* Camera permission handling

**State:**

* `barcode`: Product barcode
* `price`: Product price
* `scanning`: Camera active state
* `buyDate`: Purchase date
* `showDatePicker`: Date picker visibility

### ProductCard

Single product card with actions:

**Features:**

* Product detail display
* Consumption action button
* Deletion action button
* Partial consumption modal
* Consumption status indicator

### FilterButtons

Filters by product state:

**Options:**

* "All": Displays all items
* "Unconsumed": Displays currently available products only
* "Consumed": Displays consumed product history only

### ConsumptionChart

Temporal consumption chart:

**Library:** `react-native-chart-kit`

**Features:**

* Line chart with temporal data points
* Multi-metric support
* Responsive layout
* Custom color palette

### RankingListItem

Row item in the product efficiency ranking:

**Features:**

* Ranking position indicator
* Product details
* Calculated score
* Tap interaction for detailed inspection

## 🪝 Custom Hooks

### useFridge

Hook for fridge state management:

**State:**

* `products`: Product list
* `loading`: Loading state
* `filterType`: Active filter type

**Functions:**

* `loadProducts`: Fetches products from backend
* `addProduct`: Adds a new product
* `consumeProduct`: Marks a product as consumed
* `deleteProduct`: Deletes a product
* `deleteAllProducts`: Deletes all products

**Logic:**

* Auto-refresh on filter changes
* Error handling with native `Alert`
* Loading state handling

### useAnalytics

Hook for analytics data management:

**State:**

* `loading`: Loading state
* `rawData`: Raw consumption data
* `topProducts`: Product rankings
* `activeMetric`: Currently active metric

**Functions:**

* `loadAnalytics`: Fetches analytics datasets
* `setActiveMetric`: Updates the active metric

**Logic:**

* Conditional ranking fetching
* Filtering by selected product
* Dynamic label and dataset generation

## 🔌 API Services

### FridgeAPI

Service handling fridge communication endpoints:

**Methods:**

* `getUnconsumedProducts()`: Retrieves unconsumed items
* `getConsumedProducts()`: Retrieves consumed items
* `getAllProducts()`: Retrieves all items
* `addProduct(barcode, price, buy_date)`: Creates a product
* `consumeProduct(id, quantity, date)`: Consumes a product
* `deleteProduct(id)`: Removes a product
* `deleteAllProducts()`: Removes all products

### AnalyticsAPI

Service handling analytics endpoints:

**Methods:**

* `getConsumptionAnalytics(startDate, endDate)`: Fetches global aggregate metrics
* `getSingleProductAnalytics(productId, startDate, endDate)`: Fetches single-product metrics

## 🎨 Styling

### commonStyles.ts

Centralized global design system:

**Categories:**

* `colors`: Color palette (`primary`, `success`, `error`, `text`, etc.)
* `spacing`: Layout scales (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`)
* `typography`: Font definitions (`small`, `body`, `subtitle`, `title`)
* `borderRadius`: Border radii (`sm`, `md`, `lg`, `pill`)
* `shadows`: Elevation presets (`card`, `button`)

**Benefits:**

* Visual consistency
* Straightforward maintenance
* Theme switching readiness
* Type safety

## 🔧 Configuration

### app.json

Core Expo configuration:

**Key Sections:**

* `expo.name`: Application name
* `expo.slug`: URL slug
* `expo.version`: Version
* `expo.orientation`: Screen orientation settings
* `expo.plugins`: Configured plugins (camera, etc.)

### tsconfig.json

TypeScript configuration:

**Settings:**

* Strict mode enabled
* Path aliases
* Target ES2020
* Node module resolution

## 📊 TypeScript Types

### Type Definitions

**Core Types:**

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
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Run tests
npm test

# Run with coverage
npm test -- --coverage

```

### E2E Tests

```bash
# Install Detox
npm install --save-dev detox

# Build test app
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug

```

## 📱 Platform-Specific Considerations

### Android

**Required Permissions:**

* `CAMERA`: For barcode scanning
* `INTERNET`: For network communication

**Configuration:**

* Declare permissions in `android/app/src/main/AndroidManifest.xml`
* Configure ProGuard rules if necessary

### iOS

**Required Permissions:**

* `NSCameraUsageDescription`: Camera access explanation

**Configuration:**

* Declare usage descriptions in `ios/Podfile` or `Info.plist`

### Web

**Limitations:**

* Camera support is constrained by browser implementations
* Selected native React Native APIs are unavailable
* Lower overall performance compared to native targets

## 🔒 Security

### Environment Variables

* Store backend API URLs in `.env` (never commit secrets)
* No hardcoded API keys in application source
* Client-side input validation

### API Communication

* Enforce HTTPS in production
* Structured error handling
* Payload sanitization

## 🚀 Deployment

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android

```

### Web Deployment

```bash
# Build web production bundle
npx expo export:web

# Deploy to hosting platforms (e.g., Vercel, Netlify)
# Target output folder: web-build

```

## 🐛 Troubleshooting

### Metro Bundler Issues

```bash
# Clear bundler cache
npx expo start -c

# Reset cache folder
rm -rf node_modules/.cache

```

### Camera Not Working

* Verify camera permissions in system settings
* Verify `app.json` plugin configurations
* Test on a physical device (simulators often lack camera emulation)

### API Connection Issues

* Verify the backend server is running
* Check `API_BASE_URL` in `.env` (use your local machine IP instead of `localhost` on mobile devices)
* Check network connectivity across devices
* Check CORS rules on the backend

### Build Failures

```bash
# Clean node modules
rm -rf node_modules
npm install

# Clear Expo cache
expo r -c

# Reinstall iOS pods
cd ios
pod install
cd ..

```

## 📈 Performance

### Implemented Optimizations

* Lazy screen loading
* Memoization using `React.memo`
* Virtualized lists for scalable collection rendering
* Asset and image optimization
* Automatic code splitting with Expo Router

### Best Practices

* Prevent unnecessary re-renders
* Use `useCallback` and `useMemo` strategically
* Optimize asset sizes
* Keep the JavaScript bundle lightweight

## 🔮 Future Features

* [ ] Offline mode with local storage synchronization
* [ ] Push notifications for product expiration warnings
* [ ] Dark mode support
* [ ] Internationalization (i18n)
* [ ] Biometric authentication
* [ ] Home screen widgets
* [ ] Social recipe/list sharing
* [ ] Advanced full-text search and filtering

## 🤝 Contributing

Guidelines for contributing to the frontend:

1. Adhere to React Native best practices.
2. Use TypeScript strictly for type safety.
3. Add unit tests for new functional code.
4. Follow design conventions defined in `commonStyles.ts`.
5. Provide clear documentation for complex UI components.
6. Test across multiple deployment targets (iOS, Android, Web).

## 📚 Useful Resources

* [Expo Documentation](https://docs.expo.dev/)
* [React Native Documentation](https://reactnative.dev/)
* [Expo Router](https://docs.expo.dev/router/introduction)
* [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
* [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)

## 📄 License

MIT License - See the `LICENSE` file in the project root.