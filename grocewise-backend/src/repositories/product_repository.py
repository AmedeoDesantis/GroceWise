from src.core.mongo import MongoDB
from src.models.product import Product
from src.factories.product_factory import ProductFactory

class ProductRepository:
    def __init__(self, mongo_client: MongoDB):
        self.mongo = mongo_client
        self.COLLECTION = "products history"
        
    def _model_dump(self, product: Product) -> dict:
        """Metodo privato: converte un oggetto Product in un dizionario pronto per MongoDB"""
        return {
            "barcode": product.barcode,
            "name": product.name,
            "brand": product.brand,
            "price": product.price,
            "buy_date": product.buy_date,
            "finish_date": product.finish_date,
            "nutrients": {
                "calories": product.nutrients.calories,
                "carbohydrates": product.nutrients.carbohydrates,
                "proteins": product.nutrients.proteins,
                "fats": product.nutrients.fats
            },
            "ingredients": product.ingredients
        }
        
    def add_product(self, product: Product) -> str:
        """Aggiunge un prodotto al database e ritorna l'ID assegnato"""
        coll = self.mongo._get_coll(self.COLLECTION)
        product_dict = self._model_dump(product)
        result = coll.insert_one(product_dict)
        return str(result.inserted_id)
    
    def get_all_products(self) -> list[Product]:
        """Recupera tutti i prodotti dal database e li restituisce come lista di Product"""
        coll = self.mongo._get_coll(self.COLLECTION)
        raw_products = coll.find()
        products = []
        for raw in raw_products:
            product = ProductFactory().build_from_dict(raw)
            products.append(product)
        return products
        
    