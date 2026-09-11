# GroceWise - Smart Food Inventory Management

GroceWise is a mobile application for intelligent food inventory management that combines product tracking, consumption analytics, and nutritional ranking.

## 📋 Overview

GroceWise helps users to:

* **Track food items** using an integrated barcode scanner.


* **Monitor consumption** with detailed temporal analytics.


* **Optimize grocery spending** through product rankings based on value for money.


* **Manage the fridge** using filters for consumed and unconsumed items.



## 🏗️ System Architecture

The project follows a microservice-style split with a clear separation between frontend and backend:

```
grocewise/
├── grocewise-backend/    # REST API built with Python/FastAPI
├── grocewise-frontend/   # React Native/Expo mobile app
└── docker-compose.yaml   # MongoDB configuration

```

### Technology Stack

**Backend:**

* **Framework**: FastAPI (Python)


* **Database**: MongoDB (via Docker)


* **Architecture**: Clean Architecture with Dependency Injection


* **Patterns**: Repository, Factory, Service Layer



**Frontend:**

* **Framework**: React Native with Expo


* **Navigation**: Expo Router


* **Styling**: Custom StyleSheet design system


* **Libraries**: `expo-camera`, `react-native-chart-kit`, `axios`


## 🚀 Quick Start

### Prerequisites

* Python 3.12+


* Node.js 18+


* Docker & Docker Compose


* Expo CLI



### Backend Setup

```bash
cd grocewise-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

```

Configure your environment variables in the `.env` file:

```env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_password
MONGO_URI=mongodb://localhost:27017
OPENFOODFACTS_USER_AGENT=GroceWise (your_email@example.com)

```

Start the MongoDB database:

```bash
docker-compose up -d

```

Run the development server:

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

```

### Frontend Setup

```bash
cd grocewise-frontend
npm install

```

Configure your environment variables in `.env`:

```env
API_BASE_URL=http://localhost:8000

```

Start the development client:

```bash
npx expo start

```

Targeting mobile platforms:

* Android: `npx expo start --android`

* iOS: `npx expo start --ios`


## 📁 Project Structure

### Backend (Clean Architecture)

```
grocewise-backend/
├── src/
│   ├── core/              # Domain & Infrastructure
│   │   ├── containers/    # Dependency Injection
│   │   ├── factories/     # Factory Pattern
│   │   ├── models/        # Pydantic Models
│   │   ├── repositories/  # Repository Pattern
│   │   └── mongo.py       # MongoDB Client
│   ├── endpoints/         # API Endpoints
│   ├── services/          # Business Logic
│   └── main.py            # Application Entry Point
├── .env                   # Environment Variables
└── docker-compose.yaml    # MongoDB Config

```

### Frontend (Component-Based)

```
grocewise-frontend/
├── app/
│   ├── (screens)/         # Core Screens
│   │   ├── index.tsx      # Fridge Management
│   │   └── analytics.tsx  # Consumption Analytics
│   ├── _layout.tsx        # Global Layout
│   └── index.tsx          # Root Navigation
├── src/
│   ├── components/        # Reusable UI Components
│   ├── hooks/             # Custom React Hooks
│   ├── services/          # API Services
│   ├── utils/             # Utility Functions
│   ├── constants/         # App Constants
│   ├── types/             # TypeScript Types
│   └── styles/            # Shared Styles
├── app.json               # Expo Configuration
└── package.json           # Dependencies

```

## 🔑 Architectural Decisions

### Backend

**Dependency Injection Container**

* Centralizes system dependency management within `AppContainer`.


* Facilitates testing and long-term maintainability.


* Follows the Inversion of Control (IoC) principle.



**Repository Pattern**

* Abstracts persistence and data access layers.


* Allows switching database implementations without altering core domain logic.


* `ProductRepository` handles all database CRUD operations.



**Factory Pattern**

* `ProductFactory`: Constructs product entities by querying OpenFoodFacts barcode data.


* `DayStatsFactory`: Assembles daily consumption stats from raw transactional items.


* Encapsulates complex entity instantiation and data transformation logic.



**Service Layer**

* `FridgeService`: Contains core inventory management business logic.


* `AnalyticsService`: Calculates consumption statistics and metrics.


* Maintains a clear decoupling between API delivery endpoints and domain rules.



### Frontend

**Expo Router**

* File-based routing system.


* Automatic navigation stack orchestration.


* Built-in deep linking support.



**Custom Hooks**

* `useFridge`: Manages fridge collection state and operations.


* `useAnalytics`: Manages analytics and statistical calculation states.


* Isolates business workflows from view components.



**Component Architecture**

* Modular, reusable, and isolated UI components.


* Explicit, typed props interfaces.


* Clear separation of layout and presentation responsibilities.



**API Services**

* Axios-based HTTP clients.


* Centralized endpoint mapping.


* Consistent error interception and handling.



## 📊 Features

### Product Management

* **Barcode Scanner**: Camera-based barcode reading.


* **Manual Entry**: Manual input for barcodes, prices, and quantities.


* **Purchase Date**: Tracks purchase dates for cost ammortization.


* **Partial Consumption**: Supports logging fractional portions of products.



### Product Filters

* **All**: Displays full inventory history.


* **Unconsumed**: Filters exclusively for active, available stock.


* **Consumed**: Historical view of completed/consumed items.



### Consumption Analytics

* **Temporal Charts**: Displays intake trends across customizable date ranges.


* **Multiple Metrics**: Tracks Calories, Proteins, Carbohydrates, and Fats.


* **Product Breakdown**: Deep dive into individual product trends.


* **Product Rankings**: Ranks products based on their nutrition-to-cost efficiency.



### Nutritional Ranking

* **Scoring Algorithm**: Composite score based on:
* Nutritional profile (proteins + calories).


* Daily amortized cost.


* Duration/lifespan of the product.




* **Top 5**: Visualizes top-performing pantry items.


* **Interactivity**: Tap items to inspect specific historical records.



## 🔌 API Endpoints

### Fridge Management

* `GET /fridge/products/unconsumed` - List unconsumed products.


* `GET /fridge/products/consumed` - List consumed products.


* `GET /fridge/products/all` - List all products.


* `POST /fridge/products` - Add a new product.


* `POST /fridge/products/{id}/consume` - Record consumption.


* `DELETE /fridge/products/{id}` - Delete a product.


* `DELETE /fridge/products/all` - Delete all products.



### Analytics

* `GET /analytics/consumption` - Aggregate consumption statistics.


* `GET /analytics/consumption/{barcode}` - Consumption statistics for a single product.



### System

* `GET /health` - Health check status.



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

## 📱 User Workflow

1. **Product Ingestion**

* Scan product barcode using device camera.


* Enter purchase price (optional).


* Set purchase date.


* Product is persisted to the database.




2. **Fridge Management**

* Inspect product inventory.


* Filter by consumption state.


* Consume product (fully or partially).


* Delete unnecessary items.




3. **Consumption Analytics**

* Navigate to the Analytics screen.


* Inspect temporal consumption charts.


* Switch between tracked macronutrients and calories.


* Select products for itemized breakdowns.




4. **Grocery Optimization**

* Review product efficiency rankings.


* Identify top-value nutritional staples.


* Use insights to optimize future purchasing decisions.





## 🔒 Security

* CORS configured for development environments.


* Automated schema validation via Pydantic.


* Sanitized external API payloads from OpenFoodFacts.


* Centralized error and exception handling.



## 🚧 Development Status

### Implemented Features

* ✅ Full product lifecycle management


* ✅ Barcode scanning


* ✅ Product inventory filtering


* ✅ Partial product consumption


* ✅ Consumption analytics


* ✅ Product ranking algorithm


* ✅ Temporal data charts



### Roadmap & Future Enhancements

* 🔄 Product expiration alerts and push notifications


* 🔄 Cloud multi-device data synchronization


* 🔄 Shared household inventory management


* 🔄 Recipe generation engine


* 🔄 Budget tracking tools


* 🔄 Internationalization (i18n) support



## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.


2. Create your feature branch (`git checkout -b feature/AmazingFeature`).


3. Commit your changes (`git commit -m 'Add AmazingFeature'`).


4. Push to your branch (`git push origin feature/AmazingFeature`).


5. Open a Pull Request.



## 📄 License

Distributed under the MIT License. See the `LICENSE` file for details.

## 👥 Authors

* **Amedeo** - Full-stack development

## 🙏 Acknowledgements

* OpenFoodFacts for the nutritional product database.


* Expo for the React Native cross-platform toolkit.


* FastAPI for the high-performance backend framework.


* MongoDB for persistent data storage.