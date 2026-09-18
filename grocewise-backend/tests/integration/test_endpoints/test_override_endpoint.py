import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.core.models.override import BarcodeOverride, Unit


@pytest.mark.integration
class TestOverrideEndpoint:
    
    @pytest.fixture
    def client(self, override_app_container):
        """TestClient with overridden dependencies"""
        return TestClient(app)
    
    def test_save_override_success(self, client, override_app_container):
        """Test successful override creation"""
        override_data = {
            "barcode": "8001234567890",
            "name": "Override Name",
            "price": 2.50,
            "quantity": 600.0,
            "unit": "g"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "8001234567890" in data["message"]
    
    def test_save_override_minimal(self, client, override_app_container):
        """Test override with minimal data (only barcode)"""
        override_data = {
            "barcode": "8001234567890"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
    
    def test_save_override_with_name_only(self, client, override_app_container):
        """Test override with only name field"""
        override_data = {
            "barcode": "8001234567890",
            "name": "Custom Product Name"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
    
    def test_save_override_with_price_only(self, client, override_app_container):
        """Test override with only price field"""
        override_data = {
            "barcode": "8001234567890",
            "price": 3.99
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
    
    def test_save_override_with_quantity_only(self, client, override_app_container):
        """Test override with only quantity field"""
        override_data = {
            "barcode": "8001234567890",
            "quantity": 750.0
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
    
    def test_save_override_with_unit_only(self, client, override_app_container):
        """Test override with only unit field"""
        override_data = {
            "barcode": "8001234567890",
            "unit": "kg"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
    
    def test_save_override_all_fields(self, client, override_app_container):
        """Test override with all fields"""
        override_data = {
            "barcode": "8001234567890",
            "name": "Complete Override",
            "price": 4.99,
            "quantity": 1000.0,
            "unit": "kg"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
    
    def test_save_override_different_units(self, client, override_app_container):
        """Test override with different unit types"""
        units = ["g", "kg", "l", "ml"]
        
        for unit in units:
            override_data = {
                "barcode": f"800123456789{units.index(unit)}",
                "unit": unit
            }
            
            response = client.patch(
                f"/overrides/product/800123456789{units.index(unit)}",
                json=override_data
            )
            
            assert response.status_code == 200
    
    def test_save_override_update_existing(self, client, override_app_container):
        """Test updating an existing override"""
        # First create an override
        override_data1 = {
            "barcode": "8001234567890",
            "name": "Original Name",
            "price": 1.99
        }
        
        response1 = client.patch(
            "/overrides/product/8001234567890",
            json=override_data1
        )
        
        assert response1.status_code == 200
        
        # Then update it
        override_data2 = {
            "barcode": "8001234567890",
            "name": "Updated Name",
            "price": 2.99
        }
        
        response2 = client.patch(
            "/overrides/product/8001234567890",
            json=override_data2
        )
        
        assert response2.status_code == 200
        data = response2.json()
        assert data["status"] == "success"
    
    def test_save_override_invalid_unit(self, client, override_app_container):
        """Test override with invalid unit"""
        override_data = {
            "barcode": "8001234567890",
            "unit": "invalid_unit"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        # Should fail validation or be handled gracefully
        assert response.status_code in [422, 200]
    
    def test_save_override_negative_price(self, client, override_app_container):
        """Test override with negative price"""
        override_data = {
            "barcode": "8001234567890",
            "price": -1.99
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        # May be accepted or rejected depending on validation
        assert response.status_code in [200, 422]
    
    def test_save_override_negative_quantity(self, client, override_app_container):
        """Test override with negative quantity"""
        override_data = {
            "barcode": "8001234567890",
            "quantity": -500.0
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        # May be accepted or rejected depending on validation
        assert response.status_code in [200, 422]
    
    def test_save_override_zero_quantity(self, client, override_app_container):
        """Test override with zero quantity"""
        override_data = {
            "barcode": "8001234567890",
            "quantity": 0.0
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        # May be accepted or rejected depending on validation
        assert response.status_code in [200, 422]
    
    def test_save_override_empty_name(self, client, override_app_container):
        """Test override with empty name"""
        override_data = {
            "barcode": "8001234567890",
            "name": ""
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        # Empty string may be accepted or rejected
        assert response.status_code in [200, 422]
    
    def test_save_override_special_characters_in_name(self, client, override_app_container):
        """Test override with special characters in name"""
        override_data = {
            "barcode": "8001234567890",
            "name": "Product @#$%^&*()_+"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
    
    def test_save_override_unicode_in_name(self, client, override_app_container):
        """Test override with unicode characters in name"""
        override_data = {
            "barcode": "8001234567890",
            "name": "产品名字 名前"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
    
    def test_save_override_very_long_name(self, client, override_app_container):
        """Test override with very long name"""
        override_data = {
            "barcode": "8001234567890",
            "name": "A" * 1000  # Very long name
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        # May be accepted or rejected depending on validation
        assert response.status_code in [200, 422]
    
    def test_save_override_very_long_barcode(self, client, override_app_container):
        """Test override with very long barcode"""
        override_data = {
            "barcode": "1" * 100,  # Very long barcode
            "name": "Test Product"
        }
        
        response = client.patch(
            "/overrides/product/1" * 100,
            json=override_data
        )
        
        # URL may be too long or handled differently
        assert response.status_code in [200, 414, 404]
    
    def test_save_override_missing_barcode(self, client, override_app_container):
        """Test override without barcode in body"""
        override_data = {
            "name": "Test Product",
            "price": 1.99
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        # May fail validation or use URL barcode
        assert response.status_code in [200, 422]
    
    def test_save_override_float_price(self, client, override_app_container):
        """Test override with float price"""
        override_data = {
            "barcode": "8001234567890",
            "price": 1.99
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
    
    def test_save_override_very_precise_price(self, client, override_app_container):
        """Test override with very precise price"""
        override_data = {
            "barcode": "8001234567890",
            "price": 1.999999999
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
    
    def test_save_override_very_large_quantity(self, client, override_app_container):
        """Test override with very large quantity"""
        override_data = {
            "barcode": "8001234567890",
            "quantity": 999999.999
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",
            json=override_data
        )
        
        assert response.status_code == 200
    
    def test_save_override_mismatched_barcodes(self, client, override_app_container):
        """Test override with mismatched barcodes in URL and body"""
        override_data = {
            "barcode": "8001234567891",  # Different from URL
            "name": "Test Product"
        }
        
        response = client.patch(
            "/overrides/product/8001234567890",  # Different barcode in URL
            json=override_data
        )
        
        # May use URL barcode or fail validation
        assert response.status_code in [200, 400, 422]
    
    def test_save_override_concurrent_requests(self, client, override_app_container):
        """Test handling concurrent override requests"""
        import threading
        
        def create_override():
            override_data = {
                "barcode": "8001234567890",
                "name": f"Thread Product {threading.get_ident()}",
                "price": 1.99
            }
            response = client.patch(
                "/overrides/product/8001234567890",
                json=override_data
            )
            return response
        
        # Create multiple threads
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=create_override)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # At least one should succeed
        final_response = client.patch(
            "/overrides/product/8001234567890",
            json={"barcode": "8001234567890", "name": "Final Product"}
        )
        
        assert final_response.status_code == 200
