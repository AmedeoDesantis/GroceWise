import pytest
from datetime import datetime
from bson import ObjectId
from src.core.repositories.product_repository import ProductRepository
from src.core.models.product import Product, Nutrients, ConsumptionEvent


@pytest.mark.unit
class TestProductRepository:
    
    @pytest.fixture
    def product_repository(self, mock_mongodb, mock_product_factory):
        """ProductRepository instance with mocked dependencies"""
        return ProductRepository(mongo_client=mock_mongodb, factory=mock_product_factory)
    
    def test_model_dump_complete(self, product_repository, sample_product):
        """Test model dump with complete product"""
        result = product_repository._model_dump(sample_product)
        
        assert result["barcode"] == "8001234567890"
        assert result["name"] == "Test Product"
        assert result["brand"] == "Test Brand"
        assert result["price"] == 1.99
        assert result["quantity"] == 500.0
        assert result["unit"] == "g"
        assert result["remaining_quantity"] == 500.0
        assert len(result["consumptions"]) == 0
        assert result["nutrients"]["calories"] == 350.0
        assert result["nutrients"]["proteins"] == 12.0
    
    def test_model_dump_without_nutrients(self, product_repository, sample_product):
        """Test model dump without nutrients"""
        sample_product.nutrients = None
        
        result = product_repository._model_dump(sample_product)
        
        assert result["nutrients"]["calories"] is None
        assert result["nutrients"]["proteins"] is None
        assert result["nutrients"]["carbohydrates"] is None
        assert result["nutrients"]["fats"] is None
    
    def test_model_dump_with_consumptions(self, product_repository, sample_product):
        """Test model dump with consumption events"""
        sample_product.consumptions = [
            ConsumptionEvent(date=datetime(2024, 1, 20, 10, 0), quantity=200.0),
            ConsumptionEvent(date=datetime(2024, 1, 21, 12, 0), quantity=300.0)
        ]
        
        result = product_repository._model_dump(sample_product)
        
        assert len(result["consumptions"]) == 2
        assert result["consumptions"][0]["quantity"] == 200.0
        assert result["consumptions"][1]["quantity"] == 300.0
    
    def test_add_product_success(self, product_repository, sample_product, mock_mongodb):
        """Test successful product addition"""
        sample_product.db_id = None
        
        result = product_repository.add_product(sample_product)
        
        assert result is not None
        assert isinstance(result, str)
    
    def test_add_product_with_existing_id(self, product_repository, sample_product, mock_mongodb):
        """Test adding product with existing ID"""
        sample_product.db_id = "507f1f77bcf86cd799439011"
        
        result = product_repository.add_product(sample_product)
        
        assert result is not None
        assert isinstance(result, str)
    
    def test_get_by_id_success(self, product_repository, mock_mongodb, mock_product_factory):
        """Test successful product retrieval by ID"""
        product_id = str(ObjectId())
        mock_data = {
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "brand": "Test Brand",
            "price": 1.99,
            "quantity": 500.0,
            "unit": "g"
        }
        
        mock_mongodb.db["products_history"].insert_one(mock_data)
        mock_product_factory.build_from_dict.return_value = Product(
            db_id=product_id,
            barcode="8001234567890",
            name="Test Product",
            quantity=500.0
        )
        
        result = product_repository.get_by_id(product_id)
        
        assert result is not None
        assert result.barcode == "8001234567890"
    
    def test_get_by_id_not_found(self, product_repository, mock_mongodb):
        """Test product retrieval when not found"""
        product_id = str(ObjectId())
        
        result = product_repository.get_by_id(product_id)
        
        assert result is None
    
    def test_get_by_barcode_success(self, product_repository, mock_mongodb, mock_product_factory):
        """Test successful product retrieval by barcode"""
        barcode = "8001234567890"
        mock_data = [
            {
                "_id": ObjectId(),
                "barcode": barcode,
                "name": "Product 1",
                "quantity": 500.0
            },
            {
                "_id": ObjectId(),
                "barcode": barcode,
                "name": "Product 2",
                "quantity": 300.0
            }
        ]
        
        mock_mongodb.db["products_history"].insert_many(mock_data)
        
        result = product_repository.get_by_barcode(barcode)
        
        assert result is not None
        assert len(result) == 2
    
    def test_get_by_barcode_not_found(self, product_repository, mock_mongodb):
        """Test product retrieval by barcode when not found"""
        barcode = "0000000000000"
        
        result = product_repository.get_by_barcode(barcode)
        
        assert result is None
    
    def test_get_products_by_date_range(self, product_repository, mock_mongodb, mock_product_factory):
        """Test product retrieval by date range"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        mock_data = [
            {
                "_id": ObjectId(),
                "barcode": "8001234567890",
                "name": "Product 1",
                "buy_date": datetime(2024, 1, 15),
                "quantity": 500.0
            },
            {
                "_id": ObjectId(),
                "barcode": "8001234567891",
                "name": "Product 2",
                "buy_date": datetime(2024, 1, 20),
                "quantity": 300.0
            }
        ]
        
        mock_mongodb.db["products_history"].insert_many(mock_data)
        
        result = product_repository.get_products_by_date_range(start_date, end_date)
        
        assert len(result) == 2
    
    def test_get_products_by_date_range_empty(self, product_repository, mock_mongodb):
        """Test product retrieval by date range with no results"""
        start_date = datetime(2024, 6, 1)
        end_date = datetime(2024, 6, 30)
        
        result = product_repository.get_products_by_date_range(start_date, end_date)
        
        assert result == []
    
    def test_get_all_products(self, product_repository, mock_mongodb, mock_product_factory):
        """Test retrieving all products"""
        mock_data = [
            {
                "_id": ObjectId(),
                "barcode": "8001234567890",
                "name": "Product 1",
                "quantity": 500.0
            },
            {
                "_id": ObjectId(),
                "barcode": "8001234567891",
                "name": "Product 2",
                "quantity": 300.0
            }
        ]
        
        mock_mongodb.db["products_history"].insert_many(mock_data)
        
        result = product_repository.get_all_products()
        
        assert len(result) == 2
    
    def test_get_all_products_empty(self, product_repository, mock_mongodb):
        """Test retrieving all products when database is empty"""
        result = product_repository.get_all_products()
        
        assert result == []
    
    def test_remaining_quantity_with_value(self, product_repository, sample_product):
        """Test remaining quantity calculation with existing value"""
        sample_product.remaining_quantity = 200.0
        
        result = product_repository._remaining_quantity(sample_product)
        
        assert result == 200.0
    
    def test_remaining_quantity_without_value(self, product_repository, sample_product):
        """Test remaining quantity calculation without existing value"""
        sample_product.remaining_quantity = None
        sample_product.quantity = 500.0
        
        result = product_repository._remaining_quantity(sample_product)
        
        assert result == 500.0
    
    def test_remaining_quantity_none_quantity(self, product_repository, sample_product):
        """Test remaining quantity calculation with None quantity"""
        sample_product.remaining_quantity = None
        sample_product.quantity = None
        
        result = product_repository._remaining_quantity(sample_product)
        
        assert result == 0.0
    
    def test_add_consumption_with_finish_date(self, product_repository, mock_mongodb):
        """Test adding consumption with finish date"""
        product_id = str(ObjectId())
        event = ConsumptionEvent(date=datetime(2024, 1, 20, 10, 0), quantity=200.0)
        remaining_quantity = 300.0
        finish_date = datetime(2024, 1, 20, 10, 0)
        
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "quantity": 500.0
        })
        
        result = product_repository.add_consumption(
            product_id, event, remaining_quantity, finish_date
        )
        
        assert result is True
    
    def test_add_consumption_without_finish_date(self, product_repository, mock_mongodb):
        """Test adding consumption without finish date"""
        product_id = str(ObjectId())
        event = ConsumptionEvent(date=datetime(2024, 1, 20, 10, 0), quantity=200.0)
        remaining_quantity = 300.0
        
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "quantity": 500.0
        })
        
        result = product_repository.add_consumption(
            product_id, event, remaining_quantity, finish_date=None
        )
        
        assert result is True
    
    def test_consume_product_full(self, product_repository, mock_mongodb, mock_product_factory):
        """Test consuming entire product"""
        product_id = str(ObjectId())
        consumed_at = datetime(2024, 1, 20, 10, 0)
        
        mock_product = Product(
            db_id=product_id,
            barcode="8001234567890",
            name="Test Product",
            quantity=500.0,
            remaining_quantity=500.0,
            finish_date=None
        )
        
        mock_product_factory.build_from_dict.return_value = mock_product
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "quantity": 500.0,
            "remaining_quantity": 500.0
        })
        
        result = product_repository.consume_product(product_id, consumed_at, quantity=None)
        
        assert result is True
    
    def test_consume_product_partial(self, product_repository, mock_mongodb, mock_product_factory):
        """Test consuming partial product"""
        product_id = str(ObjectId())
        consumed_at = datetime(2024, 1, 20, 10, 0)
        quantity = 200.0
        
        mock_product = Product(
            db_id=product_id,
            barcode="8001234567890",
            name="Test Product",
            quantity=500.0,
            remaining_quantity=500.0,
            finish_date=None
        )
        
        mock_product_factory.build_from_dict.return_value = mock_product
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "quantity": 500.0,
            "remaining_quantity": 500.0
        })
        
        result = product_repository.consume_product(product_id, consumed_at, quantity=quantity)
        
        assert result is True
    
    def test_consume_product_not_found(self, product_repository, mock_mongodb):
        """Test consuming non-existent product"""
        product_id = str(ObjectId())
        consumed_at = datetime(2024, 1, 20, 10, 0)
        
        result = product_repository.consume_product(product_id, consumed_at)
        
        assert result is False
    
    def test_consume_product_already_consumed(self, product_repository, mock_mongodb, mock_product_factory):
        """Test consuming already consumed product"""
        product_id = str(ObjectId())
        consumed_at = datetime(2024, 1, 20, 10, 0)
        
        mock_product = Product(
            db_id=product_id,
            barcode="8001234567890",
            name="Test Product",
            quantity=500.0,
            remaining_quantity=0.0,
            finish_date=datetime(2024, 1, 15, 10, 0)
        )
        
        mock_product_factory.build_from_dict.return_value = mock_product
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "quantity": 500.0,
            "remaining_quantity": 0.0,
            "finish_date": datetime(2024, 1, 15, 10, 0)
        })
        
        result = product_repository.consume_product(product_id, consumed_at)
        
        assert result is False
    
    def test_consume_product_invalid_quantity(self, product_repository, mock_mongodb, mock_product_factory):
        """Test consuming with invalid quantity"""
        product_id = str(ObjectId())
        consumed_at = datetime(2024, 1, 20, 10, 0)
        quantity = 600.0  # More than available
        
        mock_product = Product(
            db_id=product_id,
            barcode="8001234567890",
            name="Test Product",
            quantity=500.0,
            remaining_quantity=500.0,
            finish_date=None
        )
        
        mock_product_factory.build_from_dict.return_value = mock_product
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "quantity": 500.0,
            "remaining_quantity": 500.0
        })
        
        result = product_repository.consume_product(product_id, consumed_at, quantity=quantity)
        
        assert result is False
    
    def test_consume_product_zero_quantity(self, product_repository, mock_mongodb, mock_product_factory):
        """Test consuming with zero quantity"""
        product_id = str(ObjectId())
        consumed_at = datetime(2024, 1, 20, 10, 0)
        quantity = 0.0
        
        mock_product = Product(
            db_id=product_id,
            barcode="8001234567890",
            name="Test Product",
            quantity=500.0,
            remaining_quantity=500.0,
            finish_date=None
        )
        
        mock_product_factory.build_from_dict.return_value = mock_product
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product",
            "quantity": 500.0,
            "remaining_quantity": 500.0
        })
        
        result = product_repository.consume_product(product_id, consumed_at, quantity=quantity)
        
        assert result is False
    
    def test_delete_product_success(self, product_repository, mock_mongodb):
        """Test successful product deletion"""
        product_id = str(ObjectId())
        
        mock_mongodb.db["products_history"].insert_one({
            "_id": ObjectId(product_id),
            "barcode": "8001234567890",
            "name": "Test Product"
        })
        
        result = product_repository.delete_product(product_id)
        
        assert result is True
    
    def test_delete_product_not_found(self, product_repository, mock_mongodb):
        """Test deleting non-existent product"""
        product_id = str(ObjectId())
        
        result = product_repository.delete_product(product_id)
        
        assert result is False
    
    def test_delete_all(self, product_repository, mock_mongodb):
        """Test deleting all products"""
        mock_data = [
            {"_id": ObjectId(), "barcode": "8001234567890", "name": "Product 1"},
            {"_id": ObjectId(), "barcode": "8001234567891", "name": "Product 2"}
        ]
        
        mock_mongodb.db["products_history"].insert_many(mock_data)
        
        result = product_repository.delete_all()
        
        assert result == 2
    
    def test_delete_all_empty(self, product_repository, mock_mongodb):
        """Test deleting all products when database is empty"""
        result = product_repository.delete_all()
        
        assert result == 0
