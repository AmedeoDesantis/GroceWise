# GroceWise Backend

Backend API per GroceWise - Sistema di gestione intelligente dell'inventario alimentare costruito con FastAPI e MongoDB.

## 📋 Panoramica

Il backend fornisce un'API RESTful per la gestione dei prodotti alimentari, il tracciamento dei consumi e l'analisi delle statistiche nutrizionali. Segue i principi della Clean Architecture con separazione chiara dei livelli.

## 🏗️ Architettura

### Clean Architecture Layers

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│      (API Endpoints)                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Business Logic Layer           │
│      (Services)                     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Domain Layer                   │
│      (Models, Factories)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Infrastructure Layer           │
│      (Repositories, MongoDB)        │
└─────────────────────────────────────┘
```

### Design Patterns Implementati

**Dependency Injection Container**
- `AppContainer` centralizza la gestione delle dipendenze
- Fornisce istanze singleton di servizi e repository
- Facilita testing e manutenzione

**Repository Pattern**
- `ProductRepository` astrae l'accesso ai dati MongoDB
- Operazioni CRUD standardizzate
- Facile mocking per unit testing

**Factory Pattern**
- `ProductFactory`: Costruzione prodotti da barcode OpenFoodFacts
- `DayStatsFactory`: Creazione statistiche dai dati grezzi
- Incapsula logica di trasformazione complessa

**Service Layer Pattern**
- `FridgeService`: Logica business gestione frigorifero
- `AnalyticsService`: Calcolo statistiche consumi
- Separazione tra API e logica di dominio

## 📁 Struttura del Progetto

```
grocewise-backend/
├── src/
│   ├── core/                      # Dominio e Infrastruttura
│   │   ├── containers/
│   │   │   └── app_container.py  # Dependency Injection Container
│   │   ├── factories/
│   │   │   ├── product_factory.py # Factory prodotti OpenFoodFacts
│   │   │   └── day_stat_factory.py # Factory statistiche
│   │   ├── models/
│   │   │   ├── product.py        # Modello Prodotto
│   │   │   └── stats.py          # Modello Statistiche
│   │   ├── repositories/
│   │   │   └── product_repository.py # Repository MongoDB
│   │   └── mongo.py              # MongoDB Client wrapper
│   ├── endpoints/                # API Endpoints
│   │   ├── fridge_endpoint.py    # Endpoints gestione frigo
│   │   └── analytics_endpoint.py # Endpoints analisi
│   ├── services/                 # Business Logic
│   │   ├── fridge_service.py     # Servizio gestione prodotti
│   │   └── analytics_service.py  # Servizio analisi consumi
│   └── main.py                   # Application entry point
├── .env                          # Variabili ambiente
├── docker-compose.yaml           # MongoDB configuration
└── requirements.txt              # Python dependencies
```

## 🚀 Setup e Installazione

### Prerequisiti
- Python 3.12+
- Docker & Docker Compose
- pip

### Installazione

```bash
# Clona il repository
cd grocewise-backend

# Crea ambiente virtuale
python -m venv venv

# Attiva ambiente virtuale
# Su Windows:
venv\Scripts\activate
# Su Linux/Mac:
source venv/bin/activate

# Installa dipendenze
pip install -r requirements.txt
```

### Configurazione Ambiente

Crea file `.env` nella root del progetto:

```env
# MongoDB Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password
MONGO_URI=mongodb://localhost:27017

# OpenFoodFacts Configuration
OPENFOODFACTS_USER_AGENT=GroceWise (your_email@example.com)
OPENFOODFACTS_USERNAME=your_username
OPENFOODFACTS_PASSWORD=your_password
```

### Avvio MongoDB

```bash
docker-compose up -d
```

Questo avvia un container MongoDB con le credenziali specificate nel `.env`.

### Avvio Server

```bash
# Modalità sviluppo (con hot reload)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Modalità produzione
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

L'API sarà disponibile su `http://localhost:8000`

### Documentazione API

Una volta avviato il server, accedi a:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔌 API Endpoints

### System

#### Health Check
```http
GET /health
```
Response:
```json
{
  "status": "healthy",
  "service": "GroceWise Backend"
}
```

### Fridge Management

#### Get Unconsumed Products
```http
GET /fridge/products/unconsumed
```
Response: Array di prodotti non consumati

#### Get Consumed Products
```http
GET /fridge/products/consumed
```
Response: Array di prodotti consumati

#### Get All Products
```http
GET /fridge/products/all
```
Response: Tutti i prodotti nel database

#### Add Product
```http
POST /fridge/products?barcode={barcode}&price={price}&buy_date={buy_date}
```
Parameters:
- `barcode` (required): Codice a barre del prodotto (8-13 caratteri)
- `price` (optional): Prezzo del prodotto (default: 0.0)
- `buy_date` (optional): Data acquisto in formato ISO (default: now)

Response:
```json
{
  "status": "success",
  "inserted_id": "507f1f77bcf86cd799439011"
}
```

#### Consume Product
```http
POST /fridge/products/{product_id}/consume?consumed_at={consumed_at}&quantity={quantity}
```
Parameters:
- `product_id` (required): ID MongoDB del prodotto (24 caratteri)
- `consumed_at` (optional): Data consumo (default: now)
- `quantity` (optional): Quantità in grammi (se omessa consuma tutto)

Response:
```json
{
  "status": "success",
  "message": "Product 507f1f77bcf86cd799439011 consumption recorded"
}
```

#### Delete Product
```http
DELETE /fridge/products/{product_id}
```
Response:
```json
{
  "status": "success",
  "message": "Product 507f1f77bcf86cd799439011 deleted"
}
```

#### Delete All Products
```http
DELETE /fridge/products/all
```
Response:
```json
{
  "status": "success",
  "message": "Deleted 5 products"
}
```

### Analytics

#### Get Consumption Statistics
```http
GET /analytics/consumption?start_date={start_date}&end_date={end_date}
```
Parameters:
- `start_date` (required): Data inizio formato YYYY-MM-DD
- `end_date` (required): Data fine formato YYYY-MM-DD

Response:
```json
{
  "daily_analytics": {
    "2024-01-01": {
      "calories": 2500,
      "proteins": 80,
      "carbohydrates": 300,
      "fats": 90
    }
  }
}
```

#### Get Product Consumption Statistics
```http
GET /analytics/consumption/{barcode}?start_date={start_date}&end_date={end_date}
```
Parameters:
- `barcode` (required): Codice a barre del prodotto
- `start_date` (required): Data inizio formato YYYY-MM-DD
- `end_date` (required): Data fine formato YYYY-MM-DD

Response: Stesso formato dell'endpoint globale ma filtrato per prodotto

## 🧩 Componenti Principali

### AppContainer (Dependency Injection)

Centralizza la creazione e gestione delle dipendenze:

```python
class AppContainer:
    _mongo_client = MongoDB()

    @classmethod
    def get_fridge_service(cls) -> FridgeService:
        factory = ProductFactory()
        repository = ProductRepository(mongo_client=cls._mongo_client, factory=factory)
        return FridgeService(repository=repository, factory=factory)
```

**Vantaggi:**
- Controllo centralizzato delle dipendenze
- Facilità di testing (mocking semplice)
- Gestione lifecycle delle istanze
- Single source of truth per configurazione

### ProductFactory

Gestisce la creazione di prodotti da diverse fonti:

**Metodo `build_from_barcode`:**
- Interroga OpenFoodFacts API
- Estrae dati nutrizionali e informazioni prodotto
- Localizza nome prodotto (priorità: italiano, inglese, francese, tedesco)
- Gestisce errori e fallback

**Metodo `build_from_dict`:**
- Ricostruisce oggetti Product da MongoDB
- Gestisce migrazione dati legacy
- Calcola remaining_quantity per documenti vecchi

### ProductRepository

Implementa il Repository Pattern per accesso dati MongoDB:

**Operazioni principali:**
- `add_product`: Inserisce nuovo prodotto
- `get_by_id`: Recupera prodotto per ID
- `get_all_products`: Recupera tutti i prodotti
- `get_products_by_date_range`: Filtra per intervallo date
- `consume_product`: Gestisce consumo (totale/parziale)
- `delete_product`: Elimina prodotto
- `delete_all`: Elimina tutti i prodotti

**Caratteristiche:**
- Astrazione completa del layer database
- Gestione conversione Model ↔ Dict
- Logica business di consumo complessa

### FridgeService

Contiene la logica di business per gestione frigorifero:

**Metodi principali:**
- `get_all_unconsumed_products`: Filtra prodotti con `finish_date = None`
- `get_all_consumed_products`: Filtra prodotti con `finish_date != None`
- `add_product_from_barcode`: Crea prodotto da barcode
- `partially_consume_product`: Gestisce consumo parziale
- `delete_product`: Eliminazione prodotto

**Responsabilità:**
- Validazione business rules
- Coordinamento tra Factory e Repository
- Logica di dominio specifica

### AnalyticsService

Gestisce calcolo statistiche consumi:

**Funzionalità:**
- Aggregazione dati consumi per date
- Calcolo metriche nutrizionali
- Filtraggio per intervallo temporale
- Supporto analisi per singolo prodotto

## 🔒 Sicurezza

### CORS
Configurato per permettere richieste da qualsiasi origine (da limitare in produzione):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Validazione Input
- Pydantic models per validazione automatica
- Query parameters validation
- Path parameters constraints
- Custom error messages

### Error Handling
- HTTPException per errori API
- Try-catch blocks in tutti gli endpoint
- Logging degli errori
- Messaggi di errore user-friendly

## 🧪 Testing

### Unit Tests

```bash
# Installa dipendenze testing
pip install pytest pytest-asyncio httpx

# Esegui tests
pytest tests/

# Con coverage
pytest tests/ --cov=src --cov-report=html
```

### Integration Tests

```bash
# Avvia MongoDB per testing
docker-compose -f docker-compose.test.yaml up -d

# Esegui integration tests
pytest tests/integration/
```

### API Testing

Usa Swagger UI (`/docs`) per test manuali o strumenti come Postman/Insomnia.

## 📊 Database Schema

### Collection: `products_history`

```json
{
  "_id": ObjectId("..."),
  "barcode": "8001234567890",
  "name": "Pasta Barilla",
  "brand": "Barilla",
  "price": 1.29,
  "buy_date": ISODate("2024-01-15T10:00:00Z"),
  "finish_date": ISODate("2024-01-20T18:30:00Z"),
  "quantity": 500,
  "unit": "g",
  "remaining_quantity": 0,
  "nutrients": {
    "calories": 350,
    "proteins": 12,
    "carbohydrates": 70,
    "fats": 2
  },
  "ingredients": ["durum_wheat_semolina", "water"],
  "consumptions": [
    {
      "date": ISODate("2024-01-20T18:30:00Z"),
      "quantity": 500
    }
  ]
}
```

## 🔧 Troubleshooting

### MongoDB Connection Error
```bash
# Verifica che MongoDB sia in esecuzione
docker ps

# Controlla logs MongoDB
docker logs grocewise_mongo

# Riavvia MongoDB
docker-compose restart
```

### OpenFoodFacts API Error
- Verifica credenziali nel `.env`
- Controlla connessione internet
- OpenFoodFacts potrebbe avere rate limiting

### Port Already in Use
```bash
# Trova processo sulla porta 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Linux/Mac

# Cambia porta nel comando uvicorn
uvicorn src.main:app --port 8001
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build immagine
docker build -t grocewise-backend .

# Run container
docker run -p 8000:8000 \
  -e MONGO_URI=mongodb://mongo:27017 \
  --network grocewise-network \
  grocewise-backend
```

### Production Considerations
- Usa variabili ambiente per configurazione
- Implementa rate limiting
- Aggiungi autenticazione JWT
- Configura HTTPS
- Set up monitoring e logging
- Use production WSGI server (Gunicorn)

## 📈 Performance

### Ottimizzazioni Implementate
- Connection pooling MongoDB
- Lazy loading delle dipendenze
- Caching delle factory instances
- Query ottimizzate con indici MongoDB

### Indici MongoDB Consigliati
```javascript
db.products_history.createIndex({ "barcode": 1 })
db.products_history.createIndex({ "buy_date": 1 })
db.products_history.createIndex({ "finish_date": 1 })
db.products_history.createIndex({ "barcode": 1, "buy_date": 1 })
```

## 🤝 Contributi

Per contribuire al backend:

1. Segui i principi Clean Architecture
2. Aggiungi unit tests per nuove funzionalità
3. Aggiorna documentazione API
4. Segui PEP 8 per stile codice
5. Usa type hints Python

## 📄 Licenza

MIT License - Vedi file LICENSE nella root del progetto
