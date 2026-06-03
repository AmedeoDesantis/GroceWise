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
        coll = self.mongo._get_coll(self.COLLECTION)
        product_dict = self._model_dump(product)
        result = coll.insert_one(product_dict)
        return str(result.inserted_id)
    
    def get_all_products(self) -> list[Product]:
        """Recupera i documenti e li mappa in oggetti di Dominio usando la Factory"""
        raw_products = self.mongo.find(self.COLLECTION)
        return [self.factory.build_from_dict(raw) for raw in raw_products]
    
    def update_product(self, product_id: str, updated_fields: dict) -> bool:
        """Aggiorna convertendo la stringa ID in un vero ObjectId di Mongo"""
        coll = self.mongo._get_coll(self.COLLECTION)
        query_filtro = {"_id": ObjectId(product_id)}
        
        result = coll.update_one(query_filtro, {"$set": updated_fields})
        return result.modified_count > 0
    
    def mark_product_as_consumed(self, product_id: str, finish_date) -> bool:
        return self.update_product(product_id, {"finish_date": finish_date})