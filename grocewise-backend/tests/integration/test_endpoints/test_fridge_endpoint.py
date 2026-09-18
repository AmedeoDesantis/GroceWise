import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from src.main import app


@pytest.mark.integration
class TestFridgeEndpoint:
    
    @pytest.fixture
    def client(self, override_app_container):
        """TestClient with overridden dependencies"""
        return TestClient(app)
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert response.json() == {"status": "healthy", "service": "GroceWise Backend"}
    
    def test_get_unconsumed_products_empty(self, client):
        """Test getting unconsumed products when empty"""
        response = client.get("/fridge/products/unconsumed")
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_unconsumed_products_success(self, client, override_app_container):
        """Test getting unconsumed products with data"""
        # Add a test product to the mock database
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            brand="Test Brand",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            finish_date=None,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            quantity=500.0,
            unit="g",
            remaining_quantity=500.0
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get("/fridge/products/unconsumed")
        
        assert response.status_code == 200
        products = response.json()
        assert len(products) >= 1
        assert any(p["barcode"] == "8001234567890" for p in products)
    
    def test_get_consumed_products_empty(self, client):
        """Test getting consumed products when empty"""
        response = client.get("/fridge/products/consumed")
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_consumed_products_success(self, client, override_app_container):
        """Test getting consumed products with data"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients, ConsumptionEvent
        
        product = Product(
            barcode="8001234567891",
            name="Consumed Product",
            brand="Test Brand",
            price=2.99,
            buy_date=datetime(2024, 1, 10, 10, 0),
            finish_date=datetime(2024, 1, 15, 18, 30),
            nutrients=Nutrients(calories=400.0, proteins=15.0, carbohydrates=60.0, fats=10.0),
            quantity=300.0,
            unit="g",
            remaining_quantity=0.0,
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 18, 30), quantity=300.0)
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get("/fridge/products/consumed")
        
        assert response.status_code == 200
        products = response.json()
        assert len(products) >= 1
        assert any(p["barcode"] == "8001234567891" for p in products)
    
    def test_get_all_products_empty(self, client):
        """Test getting all products when empty"""
        response = client.get("/fridge/products/all")
        
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_all_products_success(self, client, override_app_container):
        """Test getting all products with data"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        nuts = Nutrients(
            calories = 0,
            fats = 0,
            proteins= 0,
            carbohydrates= 0
        )
        
        product1 = Product(
            barcode="8001234567890",
            name="Product 1",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            nutrients= nuts
        )
        
        product2 = Product(
            barcode="8001234567891",
            name="Product 2",
            price=2.99,
            buy_date=datetime(2024, 1, 16, 10, 0),
            quantity=300.0,
            nutrients= nuts
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product1)
        fridge_service.repository.add_product(product2)
        
        response = client.get("/fridge/products/all")
        
        assert response.status_code == 200
        products = response.json()
        assert len(products) >= 2
    
    def test_add_product_success(self, client, override_app_container):
        """Test successful product addition"""
        from unittest.mock import Mock, patch
        from src.core.models.product import Product, Nutrients
        
        
        nuts = Nutrients(
                    calories = 0,
                    fats = 0,
                    proteins= 0,
                    carbohydrates= 0
                )
                
        product = Product(
            barcode="8001234567890",
            name="Product 1",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            nutrients= nuts,
            consumptions=[]
            )
        
        with patch.object(override_app_container.get_fridge_service().factory, 'build_from_barcode', return_value=product):
            response = client.post(
                "/fridge/products",
                params={
                    "barcode": "8001234567890",
                    "price": 1.99
                }
            )
            
            assert response.status_code == 201
            data = response.json()
            assert data["status"] == "success"
            assert "inserted_id" in data
    
    def test_add_product_invalid_barcode_too_short(self, client):
        """Test product addition with too short barcode"""
        response = client.post(
            "/fridge/products",
            params={
                "barcode": "1234567",  # Too short
                "price": 1.99
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_add_product_invalid_barcode_too_long(self, client):
        """Test product addition with too long barcode"""
        response = client.post(
            "/fridge/products",
            params={
                "barcode": "12345678901234",  # Too long
                "price": 1.99
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_add_product_negative_price(self, client):
        """Test product addition with negative price"""
        response = client.post(
            "/fridge/products",
            params={
                "barcode": "8001234567890",
                "price": -1.99  # Negative price
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_add_product_with_custom_date(self, client, override_app_container):
        """Test product addition with custom buy date"""
        from unittest.mock import Mock, patch
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        
        nuts = Nutrients(
                    calories = 0,
                    fats = 0,
                    proteins= 0,
                    carbohydrates= 0
                )
                
        product = Product(
            barcode="8001234567890",
            name="Product 1",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            nutrients= nuts,
            consumptions = []
        )
        
        custom_date = datetime(2024, 1, 15, 10, 0)
        
        with patch.object(override_app_container.get_fridge_service().factory, 'build_from_barcode', return_value=product):
            response = client.post(
                "/fridge/products",
                params={
                    "barcode": "8001234567890",
                    "price": 1.99,
                    "buy_date": custom_date.isoformat()
                }
            )
            
            assert response.status_code == 201

    def test_consume_product_success(self, client, override_app_container):
        """Test successful product consumption"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        # First add a product
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            remaining_quantity=500.0,
            nutrients=Nutrients(
                    calories = 0,
                    fats = 0,
                    proteins= 0,
                    carbohydrates= 0
                ),
            consumptions=[]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        product_id = fridge_service.repository.add_product(product)
        
        # Then consume it
        response = client.post(
            f"/fridge/products/{product_id}/consume",
            params={
                "quantity": 200.0
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
    def test_consume_product_correct(self, client, override_app_container):
        """Test successful product consumption"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        # First add a product
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            remaining_quantity=500.0,
            nutrients=Nutrients(
                    calories = 0,
                    fats = 0,
                    proteins= 0,
                    carbohydrates= 0
                ),
            consumptions=[]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        product_id = fridge_service.repository.add_product(product)
        
        # Then consume it
        response = client.post(
            f"/fridge/products/{product_id}/consume",
            params={
                "quantity": 200.0
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        products = client.get(f"/fridge/products/unconsumed").json()
        product = next(filter(lambda p: p['db_id'] == product_id, products))
        
        assert product['consumptions'] != []
        assert product['remaining_quantity'] == 300

        
    def test_multiple_consumptions_product_correct(self, client, override_app_container):
        """Test successful product consumption"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        # First add a product
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            remaining_quantity=500.0,
            nutrients=Nutrients(
                    calories = 0,
                    fats = 0,
                    proteins= 0,
                    carbohydrates= 0
                ),
            consumptions=[]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        product_id = fridge_service.repository.add_product(product)
        
        # Then consume it
        response = client.post(
            f"/fridge/products/{product_id}/consume",
            params={
                "quantity": 200.0
            }
        )
        response = client.post(
                f"/fridge/products/{product_id}/consume",
                params={
                    "quantity": 200.0
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        products = client.get(f"/fridge/products/unconsumed").json()
        product = next(filter(lambda p: p['db_id'] == product_id, products))
        
        assert product['consumptions'] != []
        assert product['remaining_quantity'] == 100
        
    def test_unordered_consumption_product_correct(self, client, override_app_container):
        """Test successful product consumption"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        # First add a product
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            remaining_quantity=500.0,
            nutrients=Nutrients(
                    calories = 0,
                    fats = 0,
                    proteins= 0,
                    carbohydrates= 0
                ),
            consumptions=[]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        product_id = fridge_service.repository.add_product(product)

        response = client.post(
            f"/fridge/products/{product_id}/consume",
            params={
                "quantity": 200.0,
                "consumed_at" : datetime(2024, 1, 18)
            }
        )

        # Then consume it
        response = client.post(
            f"/fridge/products/{product_id}/consume",
            params={
                "quantity": 200.0,
                "consumed_at" : datetime(2024, 1, 16)
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        
        products = client.get(f"/fridge/products/unconsumed").json()
        product = next(filter(lambda p: p['db_id'] == product_id, products))
        
        assert product['consumptions'] != []
        assert product['remaining_quantity'] == 100

    
    
    def test_consume_product_full_quantity(self, client, override_app_container):
        """Test consuming full product quantity"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            remaining_quantity=500.0,
            nutrients=Nutrients(
                    calories = 0,
                    fats = 0,
                    proteins= 0,
                    carbohydrates= 0
                ),
            consumptions=[]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        product_id = fridge_service.repository.add_product(product)
        
        response = client.post(
            f"/fridge/products/{product_id}/consume"
        )  # No quantity = consume all
        
        assert response.status_code == 200
    
    def test_consume_product_invalid_id(self, client):
        """Test consuming product with invalid ID"""
        response = client.post(
            "/fridge/products/invalid_id_123456789012/consume",
            params={"quantity": 100.0}
        )
        
        assert response.status_code == 422  # Validation error (invalid ID format)
    
    def test_consume_product_invalid_quantity(self, client, override_app_container):
        """Test consuming product with invalid quantity"""
        from datetime import datetime
        from src.core.models.product import Product
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            remaining_quantity=500.0
        )
        
        fridge_service = override_app_container.get_fridge_service()
        product_id = fridge_service.repository.add_product(product)
        
        response = client.post(
            f"/fridge/products/{product_id}/consume",
            params={"quantity": -100.0}  # Negative quantity
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_delete_product_success(self, client, override_app_container):
        """Test successful product deletion"""
        from datetime import datetime
        from src.core.models.product import Product
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0
        )
        
        fridge_service = override_app_container.get_fridge_service()
        product_id = fridge_service.repository.add_product(product)
        
        response = client.delete(f"/fridge/products/{product_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert product_id in data["message"]
    
    def test_delete_product_not_found(self, client):
        """Test deleting non-existent product"""
        from bson import ObjectId
        fake_id = str(ObjectId())
        
        response = client.delete(f"/fridge/products/{fake_id}")
        
        assert response.status_code == 404
    
    def test_delete_product_invalid_id(self, client):
        """Test deleting product with invalid ID"""
        response = client.delete("/fridge/products/invalid_id")
        
        assert response.status_code == 422  # Validation error
    
    def test_delete_all_products_success(self, client, override_app_container):
        """Test successful deletion of all products"""
        from datetime import datetime
        from src.core.models.product import Product, Nutrients
        
        # Add some products
        nuts = Nutrients(
            calories = 0,
            fats = 0,
            proteins= 0,
            carbohydrates= 0
        )
        
        product1 = Product(
            barcode="8001234567890",
            name="Product 1",
            price=1.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            quantity=500.0,
            nutrients= nuts
        )
        
        product2 = Product(
            barcode="8001234567891",
            name="Product 2",
            price=2.99,
            buy_date=datetime(2024, 1, 16, 10, 0),
            quantity=300.0,
            nutrients= nuts
        )
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product1)
        fridge_service.repository.add_product(product2)
        
        response = client.delete("/fridge/products/all")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "Deleted" in data["message"]
    
    def test_delete_all_products_empty(self, client):
        """Test deleting all products when empty"""
        response = client.delete("/fridge/products/all")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "Deleted 0 products" in data["message"]
