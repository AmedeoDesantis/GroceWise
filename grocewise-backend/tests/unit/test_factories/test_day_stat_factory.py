import pytest
from datetime import datetime, timedelta
from src.core.factories.day_stat_factory import DayStatsFactory
from src.core.models.product import Product, Nutrients
from src.core.models.stats import DayStats


@pytest.mark.unit
class TestDayStatsFactory:
    
    def test_build_from_product_complete(self, sample_product):
        """Test building stats from complete product with nutrients"""
        sample_product.finish_date = datetime(2024, 1, 20, 18, 30)
        
        stats = DayStatsFactory.build_from_product(sample_product)
        
        # Time span: Jan 15 to Jan 20 = 6 days
        expected_time_span = 6
        hundred_grams_units = 500.0 / 100  # 5.0
        
        expected_calories = round(350.0 * hundred_grams_units / expected_time_span, 2)
        expected_carbs = round(70.0 * hundred_grams_units / expected_time_span, 2)
        expected_proteins = round(12.0 * hundred_grams_units / expected_time_span, 2)
        expected_fats = round(2.0 * hundred_grams_units / expected_time_span, 2)
        expected_cost = round(1.99 / expected_time_span, 2)
        
        assert stats.calories == expected_calories
        assert stats.carbohydrates == expected_carbs
        assert stats.proteins == expected_proteins
        assert stats.fats == expected_fats
        assert stats.cost == expected_cost
    
    def test_build_from_product_single_day(self, sample_product):
        """Test building stats for product consumed in one day"""
        sample_product.buy_date = datetime(2024, 1, 15, 10, 0)
        sample_product.finish_date = datetime(2024, 1, 15, 18, 30)
        
        stats = DayStatsFactory.build_from_product(sample_product)
        
        # Time span: 1 day
        expected_time_span = 1
        hundred_grams_units = 500.0 / 100  # 5.0
        
        expected_calories = round(350.0 * hundred_grams_units / expected_time_span, 2)
        
        assert stats.calories == expected_calories
        assert stats.cost == round(1.99 / expected_time_span, 2)
    
    def test_build_from_product_without_nutrients(self, sample_product):
        """Test building stats from product without nutrients"""
        sample_product.nutrients = None
        sample_product.finish_date = datetime(2024, 1, 20, 18, 30)
        
        stats = DayStatsFactory.build_from_product(sample_product)
        
        expected_time_span = 6
        expected_cost = round(1.99 / expected_time_span, 2)
        
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost == expected_cost
    
    def test_build_from_product_zero_quantity(self, sample_product):
        """Test building stats from product with zero quantity"""
        sample_product.quantity = 0.0
        sample_product.finish_date = datetime(2024, 1, 20, 18, 30)
        
        stats = DayStatsFactory.build_from_product(sample_product)
        
        expected_time_span = 6
        
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost == round(1.99 / expected_time_span, 2)
    
    def test_build_from_product_none_quantity(self, sample_product):
        """Test building stats from product with None quantity"""
        sample_product.quantity = None
        sample_product.finish_date = datetime(2024, 1, 20, 18, 30)
        
        stats = DayStatsFactory.build_from_product(sample_product)
        
        expected_time_span = 6
        
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost == round(1.99 / expected_time_span, 2)
    
    def test_build_from_product_high_values(self):
        """Test building stats with high nutritional values"""
        product = Product(
            barcode="8001234567890",
            name="High Nutrient Product",
            price=10.99,
            buy_date=datetime(2024, 1, 1, 10, 0),
            finish_date=datetime(2024, 1, 10, 18, 30),
            nutrients=Nutrients(
                calories=5000.0,
                proteins=200.0,
                carbohydrates=800.0,
                fats=300.0
            ),
            quantity=1000.0,
            unit="g"
        )
        
        stats = DayStatsFactory.build_from_product(product)
        
        expected_time_span = 10
        hundred_grams_units = 1000.0 / 100  # 10.0
        
        expected_calories = round(5000.0 * hundred_grams_units / expected_time_span, 2)
        
        assert stats.calories == expected_calories
        assert stats.cost == round(10.99 / expected_time_span, 2)
    
    def test_build_from_consumption_complete(self, sample_product):
        """Test building stats from consumption event"""
        consumed_quantity = 200.0
        
        stats = DayStatsFactory.build_from_consumption(sample_product, consumed_quantity)
        
        weight_ratio = 200.0 / 500.0  # 0.4
        hundred_grams_units = 200.0 / 100  # 2.0
        
        expected_calories = round(350.0 * hundred_grams_units, 2)
        expected_carbs = round(70.0 * hundred_grams_units, 2)
        expected_proteins = round(12.0 * hundred_grams_units, 2)
        expected_fats = round(2.0 * hundred_grams_units, 2)
        expected_cost = round(1.99 * weight_ratio, 2)
        
        assert stats.calories == expected_calories
        assert stats.carbohydrates == expected_carbs
        assert stats.proteins == expected_proteins
        assert stats.fats == expected_fats
        assert stats.cost == expected_cost
    
    def test_build_from_consumption_full_quantity(self, sample_product):
        """Test building stats from full quantity consumption"""
        consumed_quantity = 500.0  # Full quantity
        
        stats = DayStatsFactory.build_from_consumption(sample_product, consumed_quantity)
        
        weight_ratio = 500.0 / 500.0  # 1.0
        hundred_grams_units = 500.0 / 100  # 5.0
        
        expected_calories = round(350.0 * hundred_grams_units, 2)
        expected_cost = round(1.99 * weight_ratio, 2)
        
        assert stats.calories == expected_calories
        assert stats.cost == expected_cost
    
    def test_build_from_consumption_partial(self, sample_product):
        """Test building stats from partial consumption"""
        consumed_quantity = 100.0  # Partial consumption
        
        stats = DayStatsFactory.build_from_consumption(sample_product, consumed_quantity)
        
        weight_ratio = 100.0 / 500.0  # 0.2
        hundred_grams_units = 100.0 / 100  # 1.0
        
        expected_calories = round(350.0 * hundred_grams_units, 2)
        expected_cost = round(1.99 * weight_ratio, 2)
        
        assert stats.calories == expected_calories
        assert stats.cost == expected_cost
    
    def test_build_from_consumption_without_nutrients(self, sample_product):
        """Test building stats from consumption without nutrients"""
        sample_product.nutrients = None
        consumed_quantity = 200.0
        
        stats = DayStatsFactory.build_from_consumption(sample_product, consumed_quantity)
        
        weight_ratio = 200.0 / 500.0  # 0.4
        expected_cost = round(1.99 * weight_ratio, 2)
        
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost == expected_cost
    
    def test_build_from_consumption_zero_quantity(self, sample_product):
        """Test building stats from consumption with zero quantity"""
        sample_product.quantity = 0.0
        consumed_quantity = 100.0
        
        stats = DayStatsFactory.build_from_consumption(sample_product, consumed_quantity)
        
        # Division by zero should be handled
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost == 0.0
    
    def test_build_from_consumption_none_quantity(self, sample_product):
        """Test building stats from consumption with None quantity"""
        sample_product.quantity = None
        consumed_quantity = 100.0
        
        stats = DayStatsFactory.build_from_consumption(sample_product, consumed_quantity)
        
        # Division by None should be handled
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost == 0.0
    
    def test_build_from_consumption_small_quantity(self, sample_product):
        """Test building stats from very small consumption quantity"""
        consumed_quantity = 10.0  # Very small quantity
        
        stats = DayStatsFactory.build_from_consumption(sample_product, consumed_quantity)
        
        weight_ratio = 10.0 / 500.0  # 0.02
        hundred_grams_units = 10.0 / 100  # 0.1
        
        expected_calories = round(350.0 * hundred_grams_units, 2)
        expected_cost = round(1.99 * weight_ratio, 2)
        
        assert stats.calories == expected_calories
        assert stats.cost == expected_cost
    
    def test_build_empty_stats(self):
        """Test building empty stats"""
        stats = DayStatsFactory.build_empty_stats()
        
        assert stats.calories == 0.0
        assert stats.carbohydrates == 0.0
        assert stats.proteins == 0.0
        assert stats.fats == 0.0
        assert stats.cost == 0.0
    
    def test_build_from_product_long_time_span(self, sample_product):
        """Test building stats for product with long time span"""
        sample_product.buy_date = datetime(2024, 1, 1, 10, 0)
        sample_product.finish_date = datetime(2024, 12, 31, 18, 30)
        
        stats = DayStatsFactory.build_from_product(sample_product)
        
        # Time span: 366 days (leap year)
        expected_time_span = 366
        hundred_grams_units = 500.0 / 100  # 5.0
        
        expected_cost = round(1.99 / expected_time_span, 2)
        
        assert stats.cost == expected_cost
        assert stats.calories < 350.0  # Should be distributed over many days
    
    def test_build_from_product_different_units(self):
        """Test building stats with different units (should work the same)"""
        product_grams = Product(
            barcode="8001234567890",
            name="Product in grams",
            price=2.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            finish_date=datetime(2024, 1, 20, 18, 30),
            nutrients=Nutrients(
                calories=400.0,
                proteins=15.0,
                carbohydrates=65.0,
                fats=8.0
            ),
            quantity=500.0,
            unit="g"
        )
        
        product_kg = Product(
            barcode="8001234567891",
            name="Product in kg",
            price=2.99,
            buy_date=datetime(2024, 1, 15, 10, 0),
            finish_date=datetime(2024, 1, 20, 18, 30),
            nutrients=Nutrients(
                calories=400.0,
                proteins=15.0,
                carbohydrates=65.0,
                fats=8.0
            ),
            quantity=0.5,
            unit="kg"
        )
        
        stats_grams = DayStatsFactory.build_from_product(product_grams)
        stats_kg = DayStatsFactory.build_from_product(product_kg)
        
        # Since nutrients are per 100g, the kg product will have different stats
        # This test just verifies both work without errors
        assert stats_grams.cost == stats_kg.cost
