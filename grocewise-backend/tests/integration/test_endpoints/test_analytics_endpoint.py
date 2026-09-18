import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from src.main import app


@pytest.mark.integration
class TestAnalyticsEndpoint:
    
    @pytest.fixture
    def client(self, override_app_container):
        """TestClient with overridden dependencies"""
        return TestClient(app)
    
    def test_get_consumption_statistics_empty(self, client):
        """Test getting consumption statistics with no data"""
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "daily_analytics" in data
        assert data["daily_analytics"] == {}
    
    def test_get_consumption_statistics_success(self, client, override_app_container):
        """Test getting consumption statistics with data"""
        from src.core.models.product import Product, Nutrients, ConsumptionEvent
        
        # Add a product with consumption data
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0),
                ConsumptionEvent(date=datetime(2024, 1, 16, 12, 0), quantity=150.0)
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "daily_analytics" in data
        assert len(data["daily_analytics"]) == 2
    
    def test_get_consumption_statistics_invalid_date_format(self, client):
        """Test getting consumption statistics with invalid date format"""
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "01/01/2024",  # Wrong format
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 400
    
    def test_get_consumption_statistics_start_after_end(self, client):
        """Test getting consumption statistics with start date after end date"""
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-31",
                "end_date": "2024-01-01"  # Before start
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "Start date must be before or equal to end date" in data["detail"]
    
    def test_get_consumption_statistics_missing_params(self, client):
        """Test getting consumption statistics without required parameters"""
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-01"
                # Missing end_date
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_get_consumption_statistics_date_filtering(self, client, override_app_container):
        """Test that consumption statistics are filtered by date range"""
        from src.core.models.product import Product, Nutrients, ConsumptionEvent
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 10, 10, 0), quantity=200.0),  # Before range
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=150.0),  # In range
                ConsumptionEvent(date=datetime(2024, 1, 25, 12, 0), quantity=100.0)   # After range
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-15",
                "end_date": "2024-01-20"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["daily_analytics"]) == 1
        assert str(datetime(2024, 1, 15).date()) in data["daily_analytics"]
    
    def test_get_unordered_consumption_statistics_date_filtering(self, client, override_app_container):
            """Test that consumption statistics are filtered by date range"""
            from src.core.models.product import Product, Nutrients, ConsumptionEvent
            
            product = Product(
                barcode="8001234567890",
                name="Test Product",
                price=1.99,
                quantity=500.0,
                nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
                consumptions=[
                    ConsumptionEvent(date=datetime(2024, 1, 10, 10, 0), quantity=200.0),  # Before range
                    ConsumptionEvent(date=datetime(2024, 1, 25, 10, 0), quantity=150.0),  # In range
                    ConsumptionEvent(date=datetime(2024, 1, 15, 12, 0), quantity=100.0)   # After range
                ]
            )
            
            fridge_service = override_app_container.get_fridge_service()
            fridge_service.repository.add_product(product)
            
            response = client.get(
                "/analytics/consumption",
                params={
                    "start_date": "2024-01-15",
                    "end_date": "2024-01-20"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["daily_analytics"]) == 1
            assert str(datetime(2024, 1, 15).date()) in data["daily_analytics"]
        
      
    def test_get_product_consumption_statistics_success(self, client, override_app_container):
        """Test getting consumption statistics for specific product"""
        from src.core.models.product import Product, Nutrients, ConsumptionEvent
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0)
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get(
            "/analytics/consumption/8001234567890",
            params={
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "daily_analytics" in data
        assert len(data["daily_analytics"]) == 1
    
    def test_get_product_consumption_statistics_not_found(self, client):
        """Test getting consumption statistics for non-existent product"""
        response = client.get(
            "/analytics/consumption/0000000000000",
            params={
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["daily_analytics"] == {}
    
    def test_get_product_consumption_statistics_invalid_date_format(self, client):
        """Test getting product consumption statistics with invalid date format"""
        response = client.get(
            "/analytics/consumption/8001234567890",
            params={
                "start_date": "invalid-date",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 400
    
    def test_get_product_consumption_statistics_missing_params(self, client):
        """Test getting product consumption statistics without required parameters"""
        response = client.get(
            "/analytics/consumption/8001234567890",
            params={
                "start_date": "2024-01-01"
                # Missing end_date
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_get_consumption_statistics_multiple_products(self, client, override_app_container):
        """Test getting consumption statistics from multiple products"""
        from src.core.models.product import Product, Nutrients, ConsumptionEvent
        
        product1 = Product(
            barcode="8001234567890",
            name="Product 1",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0)
            ]
        )
        
        product2 = Product(
            barcode="8001234567891",
            name="Product 2",
            price=2.99,
            quantity=300.0,
            nutrients=Nutrients(calories=400.0, proteins=15.0, carbohydrates=60.0, fats=10.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 12, 0), quantity=100.0)
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product1)
        fridge_service.repository.add_product(product2)
        
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["daily_analytics"]) == 1
        # Should have accumulated stats from both products
        stats = data["daily_analytics"][str(datetime(2024, 1, 15).date())]
        assert stats["calories"] > 0
    
    def test_get_consumption_statistics_same_day_multiple_consumptions(self, client, override_app_container):
        """Test getting consumption statistics with multiple consumptions on same day"""
        from src.core.models.product import Product, Nutrients, ConsumptionEvent
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0),
                ConsumptionEvent(date=datetime(2024, 1, 15, 18, 0), quantity=100.0),
                ConsumptionEvent(date=datetime(2024, 1, 15, 22, 0), quantity=50.0)
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["daily_analytics"]) == 1
        # Should have accumulated stats from all consumptions
        stats = data["daily_analytics"][str(datetime(2024, 1, 15).date())]
        assert stats["calories"] > 0
    
    def test_get_consumption_statistics_without_nutrients(self, client, override_app_container):
        """Test getting consumption statistics for products without nutrients"""
        from src.core.models.product import Product, ConsumptionEvent
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=None,
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0)
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-01",
                "end_date": "2024-01-31"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["daily_analytics"]) == 1
        stats = data["daily_analytics"][str(datetime(2024, 1, 15).date())]
        assert stats["calories"] == 0.0
        assert stats["cost"] > 0  # Should still calculate cost
    
    def test_get_consumption_statistics_boundary_dates(self, client, override_app_container):
        """Test consumption statistics with boundary dates"""
        from src.core.models.product import Product, Nutrients, ConsumptionEvent
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 0, 0), quantity=200.0),  # Start boundary
                ConsumptionEvent(date=datetime(2024, 1, 20, 23, 59), quantity=100.0),  # End boundary
                ConsumptionEvent(date=datetime(2024, 1, 14, 23, 59), quantity=50.0),  # Before start
                ConsumptionEvent(date=datetime(2024, 1, 21, 0, 0), quantity=75.0)   # After end
            ]
        )
        
        fridge_service = override_app_container.get_fridge_service()
        fridge_service.repository.add_product(product)
        
        response = client.get(
            "/analytics/consumption",
            params={
                "start_date": "2024-01-15",
                "end_date": "2024-01-20"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["daily_analytics"]) == 2
        assert str(datetime(2024, 1, 15).date()) in data["daily_analytics"]
        assert str(datetime(2024, 1, 20).date()) in data["daily_analytics"]
