import pytest
from mongomock import MongoClient
from datetime import datetime
from unittest.mock import Mock, MagicMock
from src.core.mongo import MongoDB
from src.core.models.product import Product, Nutrients, ConsumptionEvent
from src.core.models.stats import DayStats
from src.core.models.override import BarcodeOverride
from src.core.containers.app_container import AppContainer
from src.core.factories.product_factory import ProductFactory
from src.core.factories.day_stat_factory import DayStatsFactory
from src.core.repositories.product_repository import ProductRepository
from src.core.repositories.override_repository import OverrideRepository
from src.services.fridge_service import FridgeService
from src.services.analytics_service import AnalyticsService


@pytest.fixture
def mock_mongo_client():
    """MongoDB client mock per i test"""
    return MongoClient()


@pytest.fixture
def mock_mongodb(mock_mongo_client):
    """Mock MongoDB instance"""
    mock_db = mock_mongo_client["grocewise_db"]
    
    # Create a mock MongoDB class
    mock_mongo = Mock(spec=MongoDB)
    mock_mongo.client = mock_mongo_client
    mock_mongo.db = mock_db
    mock_mongo._get_coll = lambda collection_name: mock_db[collection_name]
    mock_mongo.insert_one = lambda collection_name, data: str(mock_db[collection_name].insert_one(data).inserted_id)
    mock_mongo.update_one = lambda collection_name, query, update_data: mock_db[collection_name].update_one(query, {"$set": update_data}).modified_count > 0
    mock_mongo.update_one_push = lambda collection_name, query, update_data: mock_db[collection_name].update_one(query, {"$push": update_data}).modified_count > 0
    mock_mongo.delete_one = lambda collection_name, query: mock_db[collection_name].delete_one(query).deleted_count > 0
    mock_mongo.delete_all = lambda collection_name: mock_db[collection_name].delete_many({}).deleted_count
    mock_mongo.find = lambda collection_name, query={}: list(mock_db[collection_name].find(query))
    
    return mock_mongo


@pytest.fixture
def mock_override_repository():
    """Mock OverrideRepository"""
    repo = Mock(spec=OverrideRepository)
    repo.get_override = Mock(return_value=None)
    return repo


@pytest.fixture
def mock_product_factory(mock_override_repository):
    """Mock ProductFactory"""
    factory = Mock(spec=ProductFactory)
    factory.product_override_repository = mock_override_repository
    return factory


@pytest.fixture
def mock_product_repository():
    """Mock ProductRepository"""
    return Mock(spec=ProductRepository)


@pytest.fixture
def mock_fridge_service(mock_product_repository, mock_product_factory):
    """Mock FridgeService"""
    return FridgeService(repository=mock_product_repository, factory=mock_product_factory)


@pytest.fixture
def mock_analytics_service(mock_product_repository):
    """Mock AnalyticsService"""
    stats_factory = DayStatsFactory()
    return AnalyticsService(repository=mock_product_repository, day_stat_factory=stats_factory)


@pytest.fixture
def sample_product():
    """Sample Product for testing"""
    return Product(
        db_id="507f1f77bcf86cd799439011",
        barcode="8001234567890",
        name="Test Product",
        brand="Test Brand",
        price=1.99,
        buy_date=datetime(2024, 1, 15, 10, 0, 0),
        finish_date=None,
        nutrients=Nutrients(
            calories=350.0,
            proteins=12.0,
            carbohydrates=70.0,
            fats=2.0
        ),
        ingredients=["ingredient1", "ingredient2"],
        quantity=500.0,
        unit="g",
        remaining_quantity=500.0,
        consumptions=[]
    )


@pytest.fixture
def sample_consumed_product():
    """Sample consumed Product for testing"""
    return Product(
        db_id="507f1f77bcf86cd799439012",
        barcode="8001234567891",
        name="Consumed Product",
        brand="Test Brand",
        price=2.99,
        buy_date=datetime(2024, 1, 10, 10, 0, 0),
        finish_date=datetime(2024, 1, 15, 18, 30, 0),
        nutrients=Nutrients(
            calories=400.0,
            proteins=15.0,
            carbohydrates=60.0,
            fats=10.0
        ),
        ingredients=["ingredient1", "ingredient2"],
        quantity=300.0,
        unit="g",
        remaining_quantity=0.0,
        consumptions=[
            ConsumptionEvent(date=datetime(2024, 1, 15, 18, 30, 0), quantity=300.0)
        ]
    )


@pytest.fixture
def sample_barcode_override():
    """Sample BarcodeOverride for testing"""
    return BarcodeOverride(
        barcode="8001234567890",
        name="Override Name",
        price=2.50,
        quantity=600.0,
        unit="g"
    )


@pytest.fixture
def sample_day_stats():
    """Sample DayStats for testing"""
    return DayStats(
        calories=2500.0,
        carbohydrates=300.0,
        proteins=80.0,
        fats=90.0,
        cost=5.50
    )


@pytest.fixture
def reset_app_container():
    """Reset AppContainer singleton state between tests"""
    original_mongo = AppContainer._mongo_client
    original_fridge = AppContainer._fridge_service
    original_analytics = AppContainer._analytics_service
    original_chat = AppContainer._chat_service
    original_override = AppContainer._override_service
    
    yield
    
    AppContainer._mongo_client = original_mongo
    AppContainer._fridge_service = original_fridge
    AppContainer._analytics_service = original_analytics
    AppContainer._chat_service = original_chat
    AppContainer._override_service = original_override


@pytest.fixture
def override_app_container(mock_mongodb, reset_app_container):
    """Override AppContainer with mock dependencies"""
    AppContainer._mongo_client = mock_mongodb
    AppContainer._fridge_service = None
    AppContainer._analytics_service = None
    AppContainer._chat_service = None
    AppContainer._override_service = None
    return AppContainer
