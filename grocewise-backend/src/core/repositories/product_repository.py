from bson import ObjectId
from src.core.mongo import MongoDB
from src.core.models.product import Product
from src.core.factories.product_factory import ProductFactory

class ProductRepository:
    def __init__(self, mongo_client: MongoDB, factory: ProductFactory):
        self.mongo = mongo_client
        self.COLLECTION = "products_history"
        self.factory = factory
        
    def _model_dump(self, product: Product) -> dict:
        """Mappatura: Da Oggetto di Dominio a Dizionario Mongo"""
        return {
            "db_id" : str(product.db_id) if product.db_id else None,
            "barcode": product.barcode,
            "name": product.name,
            "brand": product.brand,
            "price": product.price,
            "buy_date": product.buy_date,
            "finish_date": product.finish_date,
            "weight": product.weight,
            "ingredients": product.ingredients,
            "nutrients": {
                "calories": product.nutrients.calories,
                "carbohydrates": product.nutrients.carbohydrates,
                "proteins": product.nutrients.proteins,
                "fats": product.nutrients.fats
            }
        }
        
    def add_product(self, product: Product) -> str:
        """Salvataggio puro sul DB"""
        product_dict = self._model_dump(product)
        result = self.mongo.insert_one(self.COLLECTION, product_dict)
        return str(result)
    
    def get_products_by_date_range(self, start_date, end_date) -> list[Product]:
        """Recupera i prodotti filtrando per intervallo di date di acquisto"""
        query = {
            "buy_date": {
                "$gte": start_date,
                "$lte": end_date
            }
        }
        raw_products = self.mongo.find(self.COLLECTION, query)
        return [self.factory.build_from_dict(raw) for raw in raw_products]
    
    def get_all_products(self) -> list[Product]:
        """Recupera i documenti e li mappa in oggetti di Dominio usando la Factory"""
        raw_products = self.mongo.find(self.COLLECTION)
        return [self.factory.build_from_dict(raw) for raw in raw_products]
    
    def update_product(self, product_id: str, updated_fields: dict) -> bool:
        """Aggiorna convertendo la stringa ID in un vero ObjectId di Mongo"""
        query_filtro = {"_id": ObjectId(product_id)}
        return self.mongo.update_one(self.COLLECTION, query_filtro, updated_fields)
    
    def mark_product_as_consumed(self, product_id: str, finish_date) -> bool:
        return self.update_product(product_id, {"finish_date": finish_date})
    
    def delete_product(self, product_id: str) -> bool:
        query_filtro = {"_id": ObjectId(product_id)}
        return self.mongo.delete_one(self.COLLECTION, query_filtro)
    
    def delete_all(self) -> int:
        """Metodo di utilità per i test: cancella tutti i prodotti e ritorna il numero di documenti eliminati"""
        return self.mongo.delete_all(self.COLLECTION)