from datetime import datetime

from sympy import Product
from src.core.repositories.product_repository import ProductRepository
from src.core.factories.product_factory import ProductFactory


class FridgeService:
    def __init__(self, repository: ProductRepository, factory: ProductFactory):
        self.repository = repository
        self.factory = factory

    def get_all_products(self) -> list[Product]:
        return self.repository.get_all_products()

    def get_all_unconsumed_products(self) -> list[Product]:
        """Retrieves all products not yet consumed (finish_date is None)"""
        all_products = self.repository.get_all_products()
        return [p for p in all_products if p.finish_date is None]
    
    def get_all_consumed_products(self) -> list[Product]:
        """Retrieves all products already consumed (finish_date is not None)"""
        all_products = self.repository.get_all_products()
        return [p for p in all_products if p.finish_date is not None]
    
    def add_product_from_barcode(
        self, barcode: str, price: float = 0.0, buy_date=None, finish_date=None
    ) -> str:
        product = self.factory.build_from_barcode(barcode, price, buy_date, finish_date)
        if not product:
            raise ValueError(f"Unable to create a product from barcode: {barcode}")

        return self.repository.add_product(product)

    def mark_product_as_consumed(self, product_id: str, finish_date: datetime) -> bool:
        return self.repository.consume_product(product_id, finish_date)

    def partially_consume_product(
        self, product_id: str, quantity: float, consumed_at: datetime | None = None
    ) -> bool:
        consumed_at = consumed_at or datetime.now()
        return self.repository.consume_product(product_id, consumed_at, quantity)

    def delete_product(self, product_id: str) -> bool:
        return self.repository.delete_product(product_id)

    def delete_all_products(self) -> int:
        return self.repository.delete_all()
