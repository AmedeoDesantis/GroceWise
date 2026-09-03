# GroceWise - Smart Food Inventory Management

GroceWise è un'applicazione mobile per la gestione intelligente dell'inventario alimentare che combina tracciamento dei prodotti, analisi dei consumi e classificazione nutrizionale.

## 📋 Panoramica

GroceWise aiuta gli utenti a:
- **Tracciare i prodotti alimentari** tramite scanner di codici a barre
- **Monitorare i consumi** con analisi dettagliate nel tempo
- **Ottimizzare la spesa** attraverso classifiche di prodotti basate su rapporto qualità/prezzo
- **Gestire il frigorifero** con filtri per prodotti consumati/non consumati

## 🏗️ Architettura del Progetto

Il progetto segue un'architettura a microservizi con separazione chiara tra frontend e backend:

```
grocewise/
├── grocewise-backend/    # API REST in Python/FastAPI
├── grocewise-frontend/   # App mobile React Native/Expo
└── docker-compose.yaml   # Configurazione MongoDB
```

### Stack Tecnologico

**Backend:**
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Docker)
- **Architettura**: Clean Architecture con Dependency Injection
- **Pattern**: Repository, Factory, Service Layer

**Frontend:**
- **Framework**: React Native con Expo
- **Navigazione**: Expo Router
- **Styling**: StyleSheet personalizzato
- **Librerie**: expo-camera, react-native-chart-kit, axios

## 🚀 Quick Start

### Prerequisiti
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose
- Expo CLI

### Setup Backend

```bash
cd grocewise-backend
python -m venv venv
source venv/bin/activate  # su Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Configura le variabili d'ambiente nel file `.env`:
```env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_password
MONGO_URI=mongodb://localhost:27017
OPENFOODFACTS_USER_AGENT=GroceWise (your_email@example.com)
```

Avvia MongoDB:
```bash
docker-compose up -d
```

Avvia il server:
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Setup Frontend

```bash
cd grocewise-frontend
npm install
```

Configura le variabili d'ambiente nel file `.env`:
```env
API_BASE_URL=http://localhost:8000
```

Avvia l'app:
```bash
npx expo start
```

Per mobile:
- Android: `npx expo start --android`
- iOS: `npx expo start --ios`

## 📁 Struttura del Progetto

### Backend (Clean Architecture)

```
grocewise-backend/
├── src/
│   ├── core/              # Dominio e infrastruttura
│   │   ├── containers/    # Dependency Injection
│   │   ├── factories/     # Factory Pattern
│   │   ├── models/        # Modelli Pydantic
│   │   ├── repositories/  # Repository Pattern
│   │   └── mongo.py       # MongoDB Client
│   ├── endpoints/         # API Endpoints
│   ├── services/          # Business Logic
│   └── main.py           # Application Entry
├── .env                  # Variabili ambiente
└── docker-compose.yaml   # MongoDB Config
```

### Frontend (Component-Based)

```
grocewise-frontend/
├── app/
│   ├── (screens)/        # Schermate principali
│   │   ├── index.tsx    # Gestione Frigorifero
│   │   └── analytics.tsx # Analisi Consumi
│   ├── _layout.tsx      # Layout globale
│   └── index.tsx        # Root navigation
├── src/
│   ├── components/      # Componenti UI riutilizzabili
│   ├── hooks/          # Custom React Hooks
│   ├── services/       # API Services
│   ├── utils/          # Utility functions
│   ├── constants/      # Configurazioni
│   ├── types/          # TypeScript types
│   └── styles/         # Stili condivisi
├── app.json           # Expo configuration
└── package.json       # Dependencies
```

## 🔑 Decisioni Architetturali

### Backend

**Dependency Injection Container**
- Centralizzazione della gestione delle dipendenze in `AppContainer`
- Facilita testing e manutenzione
- Segue il principio Inversion of Control

**Repository Pattern**
- Astrazione del layer di accesso ai dati
- Permite facile cambio di database senza modificare business logic
- `ProductRepository` gestisce tutte le operazioni CRUD

**Factory Pattern**
- `ProductFactory`: Costruisce prodotti da barcode OpenFoodFacts
- `DayStatsFactory`: Crea statistiche giornaliere dai dati grezzi
- Incapsula la logica di creazione complessa

**Service Layer**
- `FridgeService`: Logica di business per gestione prodotti
- `AnalyticsService`: Calcolo statistiche consumi
- Separazione chiara tra API endpoints e business logic

### Frontend

**Expo Router**
- Navigazione file-based
- Gestione automatica dello stack di navigazione
- Supporto per deep linking

**Custom Hooks**
- `useFridge`: Gestione stato frigorifero
- `useAnalytics`: Gestione dati analitici
- Logica business separata da UI

**Component Architecture**
- Componenti riutilizzabili e testabili
- Props interface chiare
- Separazione responsabilità

**API Services**
- Axios per chiamate HTTP
- Centralizzazione endpoint API
- Error handling consistente

## 📊 Funzionalità

### Gestione Prodotti
- **Scanner Barcode**: Utilizzo fotocamera per lettura codici a barre
- **Aggiunta Manuale**: Inserimento barcode e prezzo manualmente
- **Data Acquisto**: Tracciamento data di acquisto
- **Consumo Parziale**: Supporto consumo quantità parziali

### Filtri Prodotti
- **Tutti**: Visualizzazione completa inventario
- **Non Consumati**: Solo prodotti ancora disponibili
- **Consumati**: Storico prodotti consumati

### Analisi Consumi
- **Grafici Temporali**: Visualizzazione consumi nel tempo
- **Metriche Multiple**: Calorie, Proteine, Carboidrati, Grassi
- **Dettaglio Prodotto**: Analisi per singolo prodotto
- **Classifica Prodotti**: Ranking basato su rapporto nutrizione/costo

### Classifica Nutrizionale
- **Algoritmo Scoring**: Punteggio basato su:
  - Valore nutrizionale (proteine + calorie)
  - Costo giornaliero
  - Durata del prodotto
- **Top 5**: Mostra i 5 prodotti migliori
- **Interattività**: Clic per vedere dettagli prodotto

## 🔌 API Endpoints

### Fridge Management
- `GET /fridge/products/unconsumed` - Prodotti non consumati
- `GET /fridge/products/consumed` - Prodotti consumati
- `GET /fridge/products/all` - Tutti i prodotti
- `POST /fridge/products` - Aggiungi prodotto
- `POST /fridge/products/{id}/consume` - Consuma prodotto
- `DELETE /fridge/products/{id}` - Elimina prodotto
- `DELETE /fridge/products/all` - Elimina tutti

### Analytics
- `GET /analytics/consumption` - Statistiche consumi globali
- `GET /analytics/consumption/{barcode}` - Statistiche singolo prodotto

### System
- `GET /health` - Health check

## 🧪 Testing

### Backend Testing
```bash
cd grocewise-backend
pytest tests/
```

### Frontend Testing
```bash
cd grocewise-frontend
npm test
```

## 📱 Workflow Utente

1. **Aggiunta Prodotto**
   - Scansiona barcode con fotocamera
   - Inserisci prezzo opzionale
   - Seleziona data acquisto
   - Prodotto aggiunto al database

2. **Gestione Frigorifero**
   - Visualizza lista prodotti
   - Filtra per stato consumo
   - Consuma prodotto (totale o parziale)
   - Elimina prodotti non necessari

3. **Analisi Consumi**
   - Naviga alla schermata analytics
   - Visualizza grafici temporali
   - Cambia metrica (calorie, proteine, ecc.)
   - Clicca su prodotto per dettagli

4. **Ottimizzazione Spesa**
   - Consulta classifica prodotti
   - Identifica prodotti migliori rapporto qualità/prezzo
   - Usa insights per future decisioni d'acquisto

## 🔒 Sicurezza

- CORS configurato per sviluppo
- Validazione input con Pydantic
- Sanitizzazione dati OpenFoodFacts
- Gestione errori appropriata

## 🚧 Stato Sviluppo

### Funzionalità Implementate
- ✅ Gestione completa prodotti
- ✅ Scanner barcode
- ✅ Filtri prodotti
- ✅ Consumo parziale
- ✅ Analytics consumi
- ✅ Classifica prodotti
- ✅ Grafici temporali

### Miglioramenti Futuri
- 🔄 Notifiche scadenza prodotti
- 🔄 Sincronizzazione cloud
- 🔄 Condivisione inventario
- 🔄 Ricette suggerite
- 🔄 Budget tracking
- 🔄 Multi-lingua support

## 🤝 Contributi

Contributi benvenuti! Segui questi passaggi:

1. Fork il progetto
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT.

## 👥 Autori

- **Amedeo** - Sviluppo completo

## 🙏 Riconoscimenti

- OpenFoodFacts per database prodotti
- Expo per framework React Native
- FastAPI per framework backend
- MongoDB per database solution
