# GroceWise Backend

Backend API for GroceWise - Intelligent food inventory management system built with FastAPI and MongoDB.

## 📋 Overview

The backend provides a RESTful API for food product management, consumption tracking, and nutritional statistics analysis. It follows Clean Architecture principles with clear layer separation.

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
- `AppContainer` centralizes dependency management
- Provides singleton instances of services and repositories
- Facilitates testing and maintenance

**Repository Pattern**
- `ProductRepository` abstracts MongoDB data access
- Standardized CRUD operations
- Easy mocking for unit testing

**Factory Pattern**
- `ProductFactory`: Product construction from OpenFoodFacts barcodes
- `DayStatsFactory`: Statistics creation from raw data
- Encapsulates complex transformation logic

**Service Layer Pattern**
- `FridgeService`: Fridge management business logic
- `AnalyticsService`: Consumption statistics calculation
- Separation between API and domain logic

## 📁 Project Structure

```
grocewise-backend/
├── src/
│   ├── core/                      # Dominio e Infrastruttura
│   │   ├── containers/
│   │   │   └── app_container.py  # Dependency Injection Container
│   │   ├── factories/
│   │   │   ├── product_factory.py # OpenFoodFacts product factory
│   │   │   └── day_stat_factory.py # Statistics factory
│   │   ├── models/
│   │   │   ├── product.py        # Product Model
│   │   │   └── stats.py          # Statistics Model
│   │   ├── repositories/
│   │   │   └── product_repository.py # MongoDB Repository
│   │   └── mongo.py              # MongoDB Client wrapper
│   ├── endpoints/                # API Endpoints
│   │   ├── fridge_endpoint.py    # Fridge management endpoints
│   │   └── analytics_endpoint.py # Analytics endpoints
│   ├── services/                 # Business Logic
│   │   ├── fridge_service.py     # Product management service
│   │   └── analytics_service.py  # Consumption analysis service
│   └── main.py                   # Application entry point
├── .env                          # Variabili ambiente
├── docker-compose.yaml           # MongoDB configuration
└── requirements.txt              # Python dependencies
```

## 🚀 Setup and Installation

### Prerequisites
- Python 3.12+
- Docker & Docker Compose
- pip

### Installation

```bash
# Clone the repository
cd grocewise-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Configuration

Create `.env` file in the project root:

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

### Starting the Server

```bash
# Development mode (with hot reload)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is started, access:
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
Response: Array of unconsumed products

#### Get Consumed Products
```http
GET /fridge/products/consumed
```
Response: Array of consumed products

#### Get All Products
```http
GET /fridge/products/all
```
Response: All products in the database

#### Add Product
```http
POST /fridge/products?barcode={barcode}&price={price}&buy_date={buy_date}
```
Parameters:
- `barcode` (required): Product barcode (8-13 characters)
- `price` (optional): Product price (default: 0.0)
- `buy_date` (optional): Purchase date in ISO format (default: now)

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
- `product_id` (required): MongoDB product ID (24 characters)
- `consumed_at` (optional): Consumption date (default: now)
- `quantity` (optional): Quantity in grams (if omitted, consumes everything)

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
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format

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
- `barcode` (required): Product barcode
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format

Response: Same format as the global endpoint but filtered by product

## 🧩 Main Components

### AppContainer (Dependency Injection)

Centralizes creation and management of dependencies:

```python
class AppContainer:
    _mongo_client = MongoDB()

    @classmethod
    def get_fridge_service(cls) -> FridgeService:
        factory = ProductFactory()
        repository = ProductRepository(mongo_client=cls._mongo_client, factory=factory)
        return FridgeService(repository=repository, factory=factory)
```

**Advantages:**
- Centralized dependency control
- Ease of testing (simple mocking)
- Instance lifecycle management
- Single source of truth for configuration

### ProductFactory

Manages product creation from different sources:

**Method `build_from_barcode`:**
- Queries OpenFoodFacts API
- Extracts nutritional data and product information
- Localizes product name (priority: English, Italian, French, German)
- Handles errors and fallbacks

**Method `build_from_dict`:**
- Reconstructs Product objects from MongoDB
- Handles legacy data migration
- Calculates remaining_quantity for old documents

### ProductRepository

Implements the Repository Pattern for MongoDB data access:

**Main operations:**
- `add_product`: Inserts new product
- `get_by_id`: Retrieves product by ID
- `get_all_products`: Retrieves all products
- `get_products_by_date_range`: Filters by date range
- `consume_product`: Handles consumption (total/partial)
- `delete_product`: Deletes product
- `delete_all`: Deletes all products

**Features:**
- Complete database layer abstraction
- Model ↔ Dict conversion management
- Complex consumption business logic

### FridgeService

Contains business logic for fridge management:

**Main methods:**
- `get_all_unconsumed_products`: Filters products with `finish_date = None`
- `get_all_consumed_products`: Filters products with `finish_date != None`
- `add_product_from_barcode`: Creates product from barcode
- `partially_consume_product`: Handles partial consumption
- `delete_product`: Product deletion

**Responsibilities:**
- Business rules validation
- Coordination between Factory and Repository
- Specific domain logic

### AnalyticsService

Manages consumption statistics calculation:

**Features:**
- Consumption data aggregation by date
- Nutritional metrics calculation
- Time range filtering
- Single product analysis support

## 🔒 Security

### CORS
Configured to allow requests from any origin (to be limited in production):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation
- Pydantic models for automatic validation
- Query parameters validation
- Path parameters constraints
- Custom error messages

### Error Handling
- HTTPException for API errors
- Try-catch blocks in all endpoints
- Error logging
- User-friendly error messages

## 🧪 Testing

### Unit Tests

```bash
# Install testing dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# With coverage
pytest tests/ --cov=src --cov-report=html
```

### Integration Tests

```bash
# Start MongoDB for testing
docker-compose -f docker-compose.test.yaml up -d

# Run integration tests
pytest tests/integration/
```

### API Testing

Use Swagger UI (`/docs`) for manual testing or tools like Postman/Insomnia.

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
# Check that MongoDB is running
docker ps

# Check MongoDB logs
docker logs grocewise_mongo

# Restart MongoDB
docker-compose restart
```

### OpenFoodFacts API Error
- Verify credentials in `.env`
- Check internet connection
- OpenFoodFacts might have rate limiting

### Port Already in Use
```bash
# Find process on port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # Linux/Mac

# Change port in uvicorn command
uvicorn src.main:app --port 8001
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t grocewise-backend .

# Run container
docker run -p 8000:8000 \
  -e MONGO_URI=mongodb://mongo:27017 \
  --network grocewise-network \
  grocewise-backend
```

### Production Considerations
- Use environment variables for configuration
- Implement rate limiting
- Add JWT authentication
- Configure HTTPS
- Set up monitoring and logging
- Use production WSGI server (Gunicorn)

## 📈 Performance

### Implemented Optimizations
- MongoDB connection pooling
- Lazy loading of dependencies
- Caching of factory instances
- Optimized queries with MongoDB indexes

### Recommended MongoDB Indexes
```javascript
db.products_history.createIndex({ "barcode": 1 })
db.products_history.createIndex({ "buy_date": 1 })
db.products_history.createIndex({ "finish_date": 1 })
db.products_history.createIndex({ "barcode": 1, "buy_date": 1 })
```

## 🤝 Contributions

To contribute to the backend:

1. Follow Clean Architecture principles
2. Add unit tests for new features
3. Update API documentation
4. Follow PEP 8 for code style
5. Use Python type hints

## 📄 License

MIT License - See LICENSE file in the project root
