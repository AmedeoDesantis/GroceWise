import pytest
from datetime import datetime
from src.services.fridge_service import FridgeService
from src.core.models.product import Product, Nutrients


@pytest.mark.unit
class TestFridgeService:
    
    @pytest.fixture
    def fridge_service(self, mock_product_repository, mock_product_factory):
        """FridgeService instance with mocked dependencies"""
        return FridgeService(repository=mock_product_repository, factory=mock_product_factory)
    
    def test_get_all_products(self, fridge_service, mock_product_repository, sample_product):
        """Test retrieving all products"""
        mock_product_repository.get_all_products.return_value = [sample_product]
        
        result = fridge_service.get_all_products()
        
        assert len(result) == 1
        assert result[0].barcode == "8001234567890"
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_all_products_empty(self, fridge_service, mock_product_repository):
        """Test retrieving all products when empty"""
        mock_product_repository.get_all_products.return_value = []
        
        result = fridge_service.get_all_products()
        
        assert result == []
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_all_unconsumed_products(self, fridge_service, mock_product_repository, sample_product, sample_consumed_product):
        """Test retrieving unconsumed products"""
        mock_product_repository.get_all_products.return_value = [sample_product, sample_consumed_product]
        
        result = fridge_service.get_all_unconsumed_products()
        
        assert len(result) == 1
        assert result[0].barcode == "8001234567890"
        assert result[0].finish_date is None
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_all_unconsumed_products_all_consumed(self, fridge_service, mock_product_repository, sample_consumed_product):
        """Test retrieving unconsumed products when all are consumed"""
        mock_product_repository.get_all_products.return_value = [sample_consumed_product]
        
        result = fridge_service.get_all_unconsumed_products()
        
        assert result == []
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_all_unconsumed_products_empty(self, fridge_service, mock_product_repository):
        """Test retrieving unconsumed products when empty"""
        mock_product_repository.get_all_products.return_value = []
        
        result = fridge_service.get_all_unconsumed_products()
        
        assert result == []
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_all_consumed_products(self, fridge_service, mock_product_repository, sample_product, sample_consumed_product):
        """Test retrieving consumed products"""
        mock_product_repository.get_all_products.return_value = [sample_product, sample_consumed_product]
        
        result = fridge_service.get_all_consumed_products()
        
        assert len(result) == 1
        assert result[0].barcode == "8001234567891"
        assert result[0].finish_date is not None
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_all_consumed_products_all_unconsumed(self, fridge_service, mock_product_repository, sample_product):
        """Test retrieving consumed products when all are unconsumed"""
        mock_product_repository.get_all_products.return_value = [sample_product]
        
        result = fridge_service.get_all_consumed_products()
        
        assert result == []
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_get_all_consumed_products_empty(self, fridge_service, mock_product_repository):
        """Test retrieving consumed products when empty"""
        mock_product_repository.get_all_products.return_value = []
        
        result = fridge_service.get_all_consumed_products()
        
        assert result == []
        mock_product_repository.get_all_products.assert_called_once()
    
    def test_add_product_from_barcode_success(self, fridge_service, mock_product_factory, mock_product_repository):
        """Test successful product addition from barcode"""
        barcode = "8001234567890"
        price = 1.99
        buy_date = datetime(2024, 1, 15, 10, 0)
        
        mock_product = Product(
            barcode=barcode,
            name="Test Product",
            price=price,
            buy_date=buy_date,
            quantity=500.0
        )
        
        mock_product_factory.build_from_barcode.return_value = mock_product
        mock_product_repository.add_product.return_value = "507f1f77bcf86cd799439011"
        
        result = fridge_service.add_product_from_barcode(barcode, price, buy_date)
        
        assert result == "507f1f77bcf86cd799439011"
        mock_product_factory.build_from_barcode.assert_called_once_with(barcode, price, buy_date, None)
        mock_product_repository.add_product.assert_called_once_with(mock_product)
    
    def test_add_product_from_barcode_without_date(self, fridge_service, mock_product_factory, mock_product_repository):
        """Test product addition without buy date"""
        barcode = "8001234567890"
        price = 1.99
        
        mock_product = Product(
            barcode=barcode,
            name="Test Product",
            price=price,
            quantity=500.0
        )
        
        mock_product_factory.build_from_barcode.return_value = mock_product
        mock_product_repository.add_product.return_value = "507f1f77bcf86cd799439011"
        
        result = fridge_service.add_product_from_barcode(barcode, price)
        
        assert result == "507f1f77bcf86cd799439011"
        mock_product_factory.build_from_barcode.assert_called_once_with(barcode, price, None, None)
    
    def test_add_product_from_barcode_default_price(self, fridge_service, mock_product_factory, mock_product_repository):
        """Test product addition with default price"""
        barcode = "8001234567890"
        
        mock_product = Product(
            barcode=barcode,
            name="Test Product",
            price=0.0,
            quantity=500.0
        )
        
        mock_product_factory.build_from_barcode.return_value = mock_product
        mock_product_repository.add_product.return_value = "507f1f77bcf86cd799439011"
        
        result = fridge_service.add_product_from_barcode(barcode)
        
        assert result == "507f1f77bcf86cd799439011"
        mock_product_factory.build_from_barcode.assert_called_once_with(barcode, 0.0, None, None)
    
    def test_add_product_from_barcode_factory_failure(self, fridge_service, mock_product_factory):
        """Test product addition when factory fails"""
        barcode = "0000000000000"
        
        mock_product_factory.build_from_barcode.return_value = None
        
        with pytest.raises(ValueError, match="Unable to create a product from barcode"):
            fridge_service.add_product_from_barcode(barcode)
        
        mock_product_factory.build_from_barcode.assert_called_once()
    
    def test_add_product_from_barcode_with_finish_date(self, fridge_service, mock_product_factory, mock_product_repository):
        """Test product addition with finish date"""
        barcode = "8001234567890"
        price = 1.99
        buy_date = datetime(2024, 1, 15, 10, 0)
        finish_date = datetime(2024, 1, 20, 18, 30)
        
        mock_product = Product(
            barcode=barcode,
            name="Test Product",
            price=price,
            buy_date=buy_date,
            finish_date=finish_date,
            quantity=500.0
        )
        
        mock_product_factory.build_from_barcode.return_value = mock_product
        mock_product_repository.add_product.return_value = "507f1f77bcf86cd799439011"
        
        result = fridge_service.add_product_from_barcode(barcode, price, buy_date, finish_date)
        
        assert result == "507f1f77bcf86cd799439011"
        mock_product_factory.build_from_barcode.assert_called_once_with(barcode, price, buy_date, finish_date)
    
    def test_mark_product_as_consumed_success(self, fridge_service, mock_product_repository):
        """Test successful product consumption marking"""
        product_id = "507f1f77bcf86cd799439011"
        finish_date = datetime(2024, 1, 20, 18, 30)
        
        mock_product_repository.consume_product.return_value = True
        
        result = fridge_service.mark_product_as_consumed(product_id, finish_date)
        
        assert result is True
        mock_product_repository.consume_product.assert_called_once_with(product_id, finish_date)
    
    def test_mark_product_as_consumed_failure(self, fridge_service, mock_product_repository):
        """Test product consumption marking when fails"""
        product_id = "507f1f77bcf86cd799439011"
        finish_date = datetime(2024, 1, 20, 18, 30)
        
        mock_product_repository.consume_product.return_value = False
        
        result = fridge_service.mark_product_as_consumed(product_id, finish_date)
        
        assert result is False
        mock_product_repository.consume_product.assert_called_once_with(product_id, finish_date)
    
    def test_partially_consume_product_success(self, fridge_service, mock_product_repository):
        """Test successful partial product consumption"""
        product_id = "507f1f77bcf86cd799439011"
        quantity = 200.0
        consumed_at = datetime(2024, 1, 20, 10, 0)
        
        mock_product_repository.consume_product.return_value = True
        
        result = fridge_service.partially_consume_product(product_id, quantity, consumed_at)
        
        assert result is True
        mock_product_repository.consume_product.assert_called_once_with(product_id, consumed_at, quantity)
    
    def test_partially_consume_product_without_date(self, fridge_service, mock_product_repository):
        """Test partial product consumption without date"""
        product_id = "507f1f77bcf86cd799439011"
        quantity = 200.0
        
        mock_product_repository.consume_product.return_value = True
        
        result = fridge_service.partially_consume_product(product_id, quantity)
        
        assert result is True
        # Check that datetime.now() was used
        call_args = mock_product_repository.consume_product.call_args
        assert call_args[0][0] == product_id
        assert call_args[0][1] is not None  # Should be datetime
        assert call_args[0][2] == quantity
    
    def test_partially_consume_product_failure(self, fridge_service, mock_product_repository):
        """Test partial product consumption when fails"""
        product_id = "507f1f77bcf86cd799439011"
        quantity = 200.0
        
        mock_product_repository.consume_product.return_value = False
        
        result = fridge_service.partially_consume_product(product_id, quantity)
        
        assert result is False
    
    def test_partially_consume_product_full_quantity(self, fridge_service, mock_product_repository):
        """Test consuming full quantity as partial consumption"""
        product_id = "507f1f77bcf86cd799439011"
        quantity = 500.0
        
        mock_product_repository.consume_product.return_value = True
        
        result = fridge_service.partially_consume_product(product_id, quantity)
        
        assert result is True
        mock_product_repository.consume_product.assert_called_once()
    
    def test_delete_product_success(self, fridge_service, mock_product_repository):
        """Test successful product deletion"""
        product_id = "507f1f77bcf86cd799439011"
        
        mock_product_repository.delete_product.return_value = True
        
        result = fridge_service.delete_product(product_id)
        
        assert result is True
        mock_product_repository.delete_product.assert_called_once_with(product_id)
    
    def test_delete_product_failure(self, fridge_service, mock_product_repository):
        """Test product deletion when fails"""
        product_id = "507f1f77bcf86cd799439011"
        
        mock_product_repository.delete_product.return_value = False
        
        result = fridge_service.delete_product(product_id)
        
        assert result is False
        mock_product_repository.delete_product.assert_called_once_with(product_id)
    
    def test_delete_all_products_success(self, fridge_service, mock_product_repository):
        """Test successful deletion of all products"""
        mock_product_repository.delete_all.return_value = 5
        
        result = fridge_service.delete_all_products()
        
        assert result == 5
        mock_product_repository.delete_all.assert_called_once()
    
    def test_delete_all_products_empty(self, fridge_service, mock_product_repository):
        """Test deletion of all products when empty"""
        mock_product_repository.delete_all.return_value = 0
        
        result = fridge_service.delete_all_products()
        
        assert result == 0
        mock_product_repository.delete_all.assert_called_once()
    
    def test_multiple_products_mixed_status(self, fridge_service, mock_product_repository):
        """Test filtering with mixed product statuses"""
        product1 = Product(barcode="1", name="Product 1", finish_date=None)
        product2 = Product(barcode="2", name="Product 2", finish_date=datetime(2024, 1, 1))
        product3 = Product(barcode="3", name="Product 3", finish_date=None)
        product4 = Product(barcode="4", name="Product 4", finish_date=datetime(2024, 1, 2))
        
        mock_product_repository.get_all_products.return_value = [product1, product2, product3, product4]
        
        unconsumed = fridge_service.get_all_unconsumed_products()
        consumed = fridge_service.get_all_consumed_products()
        
        assert len(unconsumed) == 2
        assert len(consumed) == 2
        assert all(p.finish_date is None for p in unconsumed)
        assert all(p.finish_date is not None for p in consumed)
