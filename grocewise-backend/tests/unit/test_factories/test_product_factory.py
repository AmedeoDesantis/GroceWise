import pytest
from unittest.mock import Mock, patch
from datetime import datetime
from src.core.factories.product_factory import ProductFactory
from src.core.models.product import Product, Nutrients
from src.core.models.override import BarcodeOverride


@pytest.mark.unit
class TestProductFactory:
    
    @pytest.fixture
    def product_factory(self, mock_override_repository):
        """ProductFactory instance with mocked dependencies"""
        return ProductFactory(override_repository=mock_override_repository)
    
    def test_build_nutrients(self, product_factory):
        """Test nutrient building from raw data"""
        raw_nutrients = {
            "calories": 350,
            "proteins_100g": 12.5,
            "carbohydrates_100g": 70.2,
            "fat_100g": 2.1
        }
        
        nutrients = product_factory._build_nutrients(raw_nutrients)
        
        assert nutrients.calories == 350
        assert nutrients.proteins == 12.5
        assert nutrients.carbohydrates == 70.2
        assert nutrients.fats == 2.1
    
    def test_build_nutrients_with_alternative_keys(self, product_factory):
        """Test nutrient building with alternative OpenFoodFacts keys"""
        raw_nutrients = {
            "energy-kcal_100g": 400,
            "proteins_100g": 15.0,
            "carbohydrates_100g": 65.0,
            "fat_100g": 8.0
        }
        
        nutrients = product_factory._build_nutrients(raw_nutrients)
        
        assert nutrients.calories == 400
        assert nutrients.proteins == 15.0
        assert nutrients.carbohydrates == 65.0
        assert nutrients.fats == 8.0
    
    def test_build_nutrients_empty(self, product_factory):
        """Test nutrient building with empty data"""
        raw_nutrients = {}
        
        nutrients = product_factory._build_nutrients(raw_nutrients)
        
        assert nutrients.calories == 0
        assert nutrients.proteins == 0.0
        assert nutrients.carbohydrates == 0.0
        assert nutrients.fats == 0.0
    
    def test_get_localized_name_english(self, product_factory):
        """Test getting localized name with English priority"""
        raw_product = {
            "product_name_en": "English Name",
            "product_name_it": "Italian Name",
            "product_name_fr": "French Name"
        }
        
        name = product_factory._get_localized_name(raw_product)
        
        assert name == "English Name"
    
    def test_get_localized_name_italian(self, product_factory):
        """Test getting localized name with Italian fallback"""
        raw_product = {
            "product_name_it": "Italian Name",
            "product_name_fr": "French Name"
        }
        
        name = product_factory._get_localized_name(raw_product)
        
        assert name == "Italian Name"
    
    def test_get_localized_name_fallback(self, product_factory):
        """Test getting localized name with fallback to base key"""
        raw_product = {
            "product_name": "Base Name"
        }
        
        name = product_factory._get_localized_name(raw_product)
        
        assert name == "Base Name"
    
    def test_get_localized_name_generic_name(self, product_factory):
        """Test getting localized name with generic_name"""
        raw_product = {
            "generic_name_en": "Generic English",
            "product_name": "Base Name"
        }
        
        name = product_factory._get_localized_name(raw_product)
        
        assert name == "Generic English"
    
    def test_get_quantity_simple(self, product_factory):
        """Test getting simple quantity"""
        raw_product = {
            "product_quantity": "500"
        }
        
        quantity = product_factory._get_quantity(raw_product)
        
        assert quantity == 500.0
    
    def test_get_quantity_with_drained(self, product_factory):
        """Test getting quantity with drained/undrained notation"""
        raw_product = {
            "product_quantity": "400  / 560"
        }
        
        quantity = product_factory._get_quantity(raw_product)
        
        assert quantity == 400.0
    
    def test_get_quantity_from_alternative_fields(self, product_factory):
        """Test getting quantity from alternative fields"""
        raw_product = {
            "quantity": "250 g"
        }
        
        quantity = product_factory._get_quantity(raw_product)
        
        assert quantity == 250.0
    
    def test_get_quantity_none(self, product_factory):
        """Test getting quantity when not available"""
        raw_product = {}
        
        quantity = product_factory._get_quantity(raw_product)
        
        assert quantity == 0.0
    
    def test_get_unit_grams(self, product_factory):
        """Test getting unit in grams"""
        raw_product = {
            "product_quantity_unit": "g"
        }
        
        unit = product_factory._get_unit(raw_product)
        
        assert unit == "g"
    
    def test_get_unit_from_alternative_fields(self, product_factory):
        """Test getting unit from alternative fields"""
        raw_product = {
            "serving_size_unit": "ml"
        }
        
        unit = product_factory._get_unit(raw_product)
        
        assert unit == 'ml' 
    
    def test_get_unit_none(self, product_factory):
        """Test getting unit when not available"""
        raw_product = {}
        
        unit = product_factory._get_unit(raw_product)
        
        assert unit is None
    
    def test_get_ingredients_list(self, product_factory):
        """Test getting ingredients from list"""
        raw_product = {
            "ingredients": [
                {"id": "en:wheat"},
                {"id": "en:water"},
                {"id": "en:salt"}
            ]
        }
        
        ingredients = product_factory._get_ingredients(raw_product)
        
        assert ingredients == ["en:wheat", "en:water", "en:salt"]
    
    def test_get_ingredients_mixed(self, product_factory):
        """Test getting ingredients from mixed format"""
        raw_product = {
            "ingredients": [
                {"id": "en:wheat"},
                "water",
                {"id": "en:salt"}
            ]
        }
        
        ingredients = product_factory._get_ingredients(raw_product)
        
        assert ingredients == ["en:wheat", "water", "en:salt"]
    
    def test_get_ingredients_none(self, product_factory):
        """Test getting ingredients when not available"""
        raw_product = {}
        
        ingredients = product_factory._get_ingredients(raw_product)
        
        assert ingredients == []
    
    def test_parse_consumptions(self, product_factory):
        """Test parsing consumption events"""
        raw_consumptions = [
            {"date": datetime(2024, 1, 15, 10, 0), "quantity": 100.0},
            {"date": datetime(2024, 1, 16, 12, 0), "quantity": 150.0}
        ]
        
        consumptions = product_factory._parse_consumptions(raw_consumptions)
        
        assert len(consumptions) == 2
        assert consumptions[0].quantity == 100.0
        assert consumptions[1].quantity == 150.0
    
    def test_parse_consumptions_empty(self, product_factory):
        """Test parsing empty consumptions"""
        consumptions = product_factory._parse_consumptions([])
        
        assert consumptions == []
    
    def test_parse_consumptions_invalid(self, product_factory):
        """Test parsing invalid consumptions"""
        raw_consumptions = [
            {"date": datetime(2024, 1, 15, 10, 0)},  # Missing quantity
            {"quantity": 100.0}  # Missing date
        ]
        
        consumptions = product_factory._parse_consumptions(raw_consumptions)
        
        assert consumptions == []
    
    @patch('src.core.factories.product_factory.openfoodfacts')
    def test_build_from_barcode_success(self, mock_openfoodfacts, product_factory):
        """Test successful product building from barcode"""
        # Mock OpenFoodFacts API response
        mock_api = Mock()
        mock_api.product.get.return_value = {
            "product_name_en": "Test Product",
            "brands": "Test Brand",
            "product_quantity": "500",
            "product_quantity_unit": "g",
            "nutriments": {
                "calories": 350,
                "proteins_100g": 12.0,
                "carbohydrates_100g": 70.0,
                "fat_100g": 2.0
            },
            "ingredients": [{"id": "en:wheat"}, {"id": "en:water"}]
        }
        mock_openfoodfacts.API.return_value = mock_api
        product_factory.client = mock_api

        product = product_factory.build_from_barcode("8001234567890", price=1.99)
        
        assert product is not None
        assert product.barcode == "8001234567890"
        assert product.name == "Test Product"
        assert product.brand == "Test Brand"
        assert product.price == 1.99
        assert product.quantity == 500.0
        assert product.unit == "g"
        assert product.remaining_quantity == 500.0
    
    @patch('src.core.factories.product_factory.openfoodfacts')
    def test_build_from_barcode_not_found(self, mock_openfoodfacts, product_factory):
        """Test product building when barcode not found"""
        mock_api = Mock()
        mock_api.product.get.return_value = None
        mock_openfoodfacts.API.return_value = mock_api
        
        product = product_factory.build_from_barcode("0000000000000")
        
        assert product is None
    
    @patch('src.core.factories.product_factory.openfoodfacts')
    def test_build_from_barcode_with_override(self, mock_openfoodfacts, product_factory, sample_barcode_override, mock_override_repository):
        """Test product building with barcode override"""
        mock_api = Mock()
        mock_api.product.get.return_value = {
            "product_name_en": "Original Name",
            "brands": "Original Brand",
            "product_quantity": "500",
            "product_quantity_unit": "g",
            "nutriments": {
                "calories": 350,
                "proteins_100g": 12.0,
                "carbohydrates_100g": 70.0,
                "fat_100g": 2.0
            },
            "ingredients": [{"id": "en:wheat"}]
        }
        mock_openfoodfacts.API.return_value = mock_api
        
        mock_override_repository.get_override.return_value = sample_barcode_override
        
        product = product_factory.build_from_barcode("8001234567890", price=1.99)
        
        assert product is not None
        assert product.name == "Override Name"
        assert product.price == 2.50
        assert product.quantity == 600.0
    
    def test_apply_override_all_fields(self, product_factory, sample_product, sample_barcode_override):
        """Test applying override with all fields"""
        result = product_factory._apply_override(sample_product, sample_barcode_override)
        
        assert result.name == "Override Name"
        assert result.price == 2.50
        assert result.quantity == 600.0
        assert result.unit == "g"
    
    def test_apply_override_partial_fields(self, product_factory, sample_product):
        """Test applying override with partial fields"""
        partial_override = BarcodeOverride(
            barcode="8001234567890",
            name="Partial Override",
            price=3.00
        )
        
        result = product_factory._apply_override(sample_product, partial_override)
        
        assert result.name == "Partial Override"
        assert result.price == 3.00
        assert result.quantity == 500.0  # Unchanged
        assert result.unit == "g"  # Unchanged
    
    def test_build_from_dict_complete(self, product_factory, mock_override_repository):
        """Test building product from complete dictionary"""
        data = {
            "_id": "507f1f77bcf86cd799439011",
            "barcode": "8001234567890",
            "name": "Test Product",
            "brand": "Test Brand",
            "price": 1.99,
            "buy_date": datetime(2024, 1, 15, 10, 0),
            "finish_date": datetime(2024, 1, 20, 18, 30),
            "nutrients": {
                "calories": 350,
                "proteins": 12.0,
                "carbohydrates": 70.0,
                "fats": 2.0
            },
            "ingredients": ["en:wheat", "en:water"],
            "quantity": 500.0,
            "unit": "g",
            "consumptions": [
                {"date": datetime(2024, 1, 20, 18, 30), "quantity": 500.0}
            ]
        }
        
        product = product_factory.build_from_dict(data)
        
        assert product.db_id == "507f1f77bcf86cd799439011"
        assert product.barcode == "8001234567890"
        assert product.name == "Test Product"
        assert product.remaining_quantity == 0.0
    
    def test_build_from_dict_legacy_data(self, product_factory, mock_override_repository):
        """Test building product from legacy data (without consumptions)"""
        data = {
            "_id": "507f1f77bcf86cd799439011",
            "barcode": "8001234567890",
            "name": "Legacy Product",
            "brand": "Test Brand",
            "price": 1.99,
            "buy_date": datetime(2024, 1, 15, 10, 0),
            "finish_date": datetime(2024, 1, 20, 18, 30),
            "nutrients": {
                "calories": 350,
                "proteins": 12.0,
                "carbohydrates": 70.0,
                "fats": 2.0
            },
            "ingredients": ["en:wheat"],
            "quantity": 500.0,
            "unit": "g"
        }
        
        product = product_factory.build_from_dict(data)
        
        assert product.db_id == "507f1f77bcf86cd799439011"
        assert len(product.consumptions) == 1  # Auto-generated from finish_date
        assert product.remaining_quantity == 0.0
    
    def test_build_from_dict_with_override(self, product_factory, sample_barcode_override, mock_override_repository):
        """Test building product from dict with override"""
        data = {
            "_id": "507f1f77bcf86cd799439011",
            "barcode": "8001234567890",
            "name": "Original Name",
            "brand": "Original Brand",
            "price": 1.99,
            "buy_date": datetime(2024, 1, 15, 10, 0),
            "quantity": 500.0,
            "unit": "g"
        }
        
        mock_override_repository.get_override.return_value = sample_barcode_override
        
        product = product_factory.build_from_dict(data)
        
        assert product.name == "Override Name"
        assert product.price == 2.50
        assert product.quantity == 600.0
    
    def test_build_from_dict_partial_consumption(self, product_factory):
        """Test building product with partial consumption"""
        data = {
            "_id": "507f1f77bcf86cd799439011",
            "barcode": "8001234567890",
            "name": "Partially Consumed",
            "quantity": 500.0,
            "consumptions": [
                {"date": datetime(2024, 1, 20, 10, 0), "quantity": 200.0}
            ]
        }
        
        product = product_factory.build_from_dict(data)
        
        assert product.remaining_quantity == 300.0
