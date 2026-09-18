import pytest
from datetime import datetime
from src.services.analytics_service import AnalyticsService
from src.core.models.product import Product, Nutrients, ConsumptionEvent
from src.core.models.stats import DayStats
from src.core.factories.day_stat_factory import DayStatsFactory


@pytest.mark.unit
class TestAnalyticsService:
    
    @pytest.fixture
    def analytics_service(self, mock_product_repository):
        """AnalyticsService instance with mocked dependencies"""
        stats_factory = DayStatsFactory()
        return AnalyticsService(repository=mock_product_repository, day_stat_factory=stats_factory)
    
    def test_get_consumption_statistics_empty(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics with no products"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        mock_product_repository.get_all_products.return_value = []
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert result.daily_analytics == {}
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_consumption_statistics_no_consumptions(self, analytics_service, mock_product_repository, sample_product):
        """Test getting consumption statistics with products but no consumptions"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        mock_product_repository.get_all_products.return_value = [sample_product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert result.daily_analytics == {}
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_consumption_statistics_single_consumption(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics with single consumption"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
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
        
        mock_product_repository.get_all_products.return_value = [product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert len(result.daily_analytics) == 1
        assert datetime(2024, 1, 15).date() in result.daily_analytics
        stats = result.daily_analytics[datetime(2024, 1, 15).date()]
        assert stats.calories > 0
    
    def test_get_consumption_statistics_multiple_consumptions_same_day(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics with multiple consumptions on same day"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0),
                ConsumptionEvent(date=datetime(2024, 1, 15, 18, 0), quantity=100.0)
            ]
        )
        
        mock_product_repository.get_all_products.return_value = [product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert len(result.daily_analytics) == 1
        assert datetime(2024, 1, 15).date() in result.daily_analytics
        stats = result.daily_analytics[datetime(2024, 1, 15).date()]
        # Should have accumulated stats from both consumptions
        assert stats.calories > 0
    
    def test_get_consumption_statistics_multiple_days(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics across multiple days"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0),
                ConsumptionEvent(date=datetime(2024, 1, 16, 12, 0), quantity=150.0),
                ConsumptionEvent(date=datetime(2024, 1, 20, 18, 0), quantity=100.0)
            ]
        )
        
        mock_product_repository.get_all_products.return_value = [product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert len(result.daily_analytics) == 3
        assert datetime(2024, 1, 15).date() in result.daily_analytics
        assert datetime(2024, 1, 16).date() in result.daily_analytics
        assert datetime(2024, 1, 20).date() in result.daily_analytics
    
    def test_get_consumption_statistics_date_filtering(self, analytics_service, mock_product_repository):
        """Test that consumption statistics are filtered by date range"""
        start_date = datetime(2024, 1, 15)
        end_date = datetime(2024, 1, 20)
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 10, 10, 0), quantity=200.0),  # Before range
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=150.0),  # In range
                ConsumptionEvent(date=datetime(2024, 1, 18, 12, 0), quantity=100.0),  # In range
                ConsumptionEvent(date=datetime(2024, 1, 25, 18, 0), quantity=50.0)   # After range
            ]
        )
        
        mock_product_repository.get_all_products.return_value = [product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert len(result.daily_analytics) == 2
        assert datetime(2024, 1, 10).date() not in result.daily_analytics
        assert datetime(2024, 1, 15).date() in result.daily_analytics
        assert datetime(2024, 1, 18).date() in result.daily_analytics
        assert datetime(2024, 1, 25).date() not in result.daily_analytics
    
    def test_get_consumption_statistics_multiple_products(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics from multiple products"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
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
        
        mock_product_repository.get_all_products.return_value = [product1, product2]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert len(result.daily_analytics) == 1
        stats = result.daily_analytics[datetime(2024, 1, 15).date()]
        # Should have accumulated stats from both products
        assert stats.calories > 0
    
    def test_get_product_consumption_statistics_success(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics for specific product"""
        barcode = "8001234567890"
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        product = Product(
            barcode=barcode,
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0)
            ]
        )
        
        mock_product_repository.get_by_barcode.return_value = [product]
        
        result = analytics_service.get_product_consumption_statistics(barcode, start_date, end_date)
        
        assert len(result.daily_analytics) == 1
        assert datetime(2024, 1, 15).date() in result.daily_analytics
        mock_product_repository.get_by_barcode.assert_called_once_with(barcode)
    
    def test_get_product_consumption_statistics_not_found(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics for non-existent product"""
        barcode = "0000000000000"
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        mock_product_repository.get_by_barcode.return_value = None
        
        result = analytics_service.get_product_consumption_statistics(barcode, start_date, end_date)
        
        assert result.daily_analytics == {}
        mock_product_repository.get_by_barcode.assert_called_once_with(barcode)
    
    def test_get_product_consumption_statistics_multiple_instances(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics for product with multiple instances"""
        barcode = "8001234567890"
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        product1 = Product(
            barcode=barcode,
            name="Test Product 1",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=200.0)
            ]
        )
        
        product2 = Product(
            barcode=barcode,
            name="Test Product 2",
            price=2.99,
            quantity=300.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 16, 12, 0), quantity=150.0)
            ]
        )
        
        mock_product_repository.get_by_barcode.return_value = [product1, product2]
        
        result = analytics_service.get_product_consumption_statistics(barcode, start_date, end_date)
        
        assert len(result.daily_analytics) == 2
        assert datetime(2024, 1, 15).date() in result.daily_analytics
        assert datetime(2024, 1, 16).date() in result.daily_analytics
    
    def test_get_consumption_statistics_without_nutrients(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics for products without nutrients"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
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
        
        mock_product_repository.get_all_products.return_value = [product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert len(result.daily_analytics) == 1
        stats = result.daily_analytics[datetime(2024, 1, 15).date()]
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost > 0  # Should still calculate cost
    
    def test_get_consumption_statistics_zero_quantity_consumption(self, analytics_service, mock_product_repository):
        """Test getting consumption statistics with zero quantity consumption"""
        start_date = datetime(2024, 1, 1)
        end_date = datetime(2024, 1, 31)
        
        product = Product(
            barcode="8001234567890",
            name="Test Product",
            price=1.99,
            quantity=500.0,
            nutrients=Nutrients(calories=350.0, proteins=12.0, carbohydrates=70.0, fats=2.0),
            consumptions=[
                ConsumptionEvent(date=datetime(2024, 1, 15, 10, 0), quantity=0.0)
            ]
        )
        
        mock_product_repository.get_all_products.return_value = [product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        # Zero quantity should still create a day entry with zero stats
        assert len(result.daily_analytics) == 1
        stats = result.daily_analytics[datetime(2024, 1, 15).date()]
        assert stats.calories == 0.0
    
    def test_get_consumption_statistics_boundary_dates(self, analytics_service, mock_product_repository):
        """Test consumption statistics with boundary dates"""
        start_date = datetime(2024, 1, 15)
        end_date = datetime(2024, 1, 20)
        
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
        
        mock_product_repository.get_all_products.return_value = [product]
        
        result = analytics_service.get_consumption_statistics(start_date, end_date)
        
        assert len(result.daily_analytics) == 2
        assert datetime(2024, 1, 15).date() in result.daily_analytics
        assert datetime(2024, 1, 20).date() in result.daily_analytics
        assert datetime(2024, 1, 14).date() not in result.daily_analytics
        assert datetime(2024, 1, 21).date() not in result.daily_analytics
