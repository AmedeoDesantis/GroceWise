from src.core.repositories.product_repository import ProductRepository
from src.core.factories.product_factory import ProductFactory

class FridgeService:
    def __init__(self, repository: ProductRepository, factory: ProductFactory):
        self.repository = repository
        self.factory = factory
    
    def get_all_products(self) -> list:
        """Recupera tutti i prodotti dal database e li restituisce come lista di Product"""
        return self.repository.get_all_products()

    def get_all_unconsumed_products(self) -> list:
        """Recupera tutti i prodotti non ancora consumati (finish_date is None)"""
        all_products = self.repository.get_all_products()
        return [p for p in all_products if p.finish_date is None]

    def add_product_from_barcode(self, barcode: str, price: float = 0.0, buy_date=None, finish_date=None) -> str:
        """LOGICA DI BUSINESS: Coordina la fabbricazione e ordina al repository di salvare"""
        product = self.factory.build_from_barcode(barcode, price, buy_date, finish_date)
        if not product:
            raise ValueError(f"Impossibile creare un prodotto dal barcode: {barcode}")    
        
        return self.repository.add_product(product)

    def mark_product_as_consumed(self, product_id: str, finish_date) -> bool:
        """Orchestra la consumazione di un alimento"""
        return self.repository.mark_product_as_consumed(product_id, finish_date)