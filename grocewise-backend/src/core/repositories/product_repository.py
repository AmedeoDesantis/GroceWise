from sched import Event
from bson import ObjectId
from datetime import datetime
from src.core.mongo import MongoDB
from src.core.models.product import Product, ConsumptionEvent
from src.core.factories.product_factory import ProductFactory


class ProductRepository:
    def __init__(self, mongo_client: MongoDB, factory: ProductFactory):
        self.mongo = mongo_client
        self.COLLECTION = "products_history"
        self.factory = factory

    def _model_dump(self, product: Product) -> dict:
        """Mappatura: Da Oggetto di Dominio a Dizionario Mongo"""
        return {
            "db_id": str(product.db_id) if product.db_id else None,
            "barcode": product.barcode,
            "name": product.name,
            "brand": product.brand,
            "price": product.price,
            "buy_date": product.buy_date,
            "finish_date": product.finish_date,
            "weight": product.weight,
            "remaining_weight": product.remaining_weight,
            "consumptions": [
                {"date": event.date, "quantity": event.quantity}
                for event in product.consumptions
            ],
            "ingredients": product.ingredients,
            "nutrients": {
                "calories": product.nutrients.calories if product.nutrients else None,
                "carbohydrates": product.nutrients.carbohydrates if product.nutrients else None,
                "proteins": product.nutrients.proteins if product.nutrients else None,
                "fats": product.nutrients.fats if product.nutrients else None,
            },
        }

    def add_product(self, product: Product) -> str:
        product_dict = self._model_dump(product)
        result = self.mongo.insert_one(self.COLLECTION, product_dict)
        return str(result)

    def get_by_id(self, product_id: str) -> Product | None:
        query = {"_id": ObjectId(product_id)}
        results = self.mongo.find(self.COLLECTION, query)
        if not results:
            return None
        return self.factory.build_from_dict(results[0])

    def get_products_by_date_range(self, start_date, end_date) -> list[Product]:
        """Recupera i prodotti filtrando per intervallo di date di acquisto"""
        query = {
            "buy_date": {
                "$gte": start_date,
                "$lte": end_date,
            }
        }
        raw_products = self.mongo.find(self.COLLECTION, query)
        return [self.factory.build_from_dict(raw) for raw in raw_products]

    def get_all_products(self) -> list[Product]:
        raw_products = self.mongo.find(self.COLLECTION)
        return [self.factory.build_from_dict(raw) for raw in raw_products]

    def _remaining_weight(self, product: Product) -> float:
        if product.remaining_weight is not None:
            return product.remaining_weight
        return product.weight or 0.0

    def add_consumption(
        self,
        product_id: str,
        event: ConsumptionEvent,
        remaining_weight: float,
        finish_date: datetime | None = None,
    ) -> bool:
        query = {"_id": ObjectId(product_id)}
        consumption_event = {"date": event.date, "quantity": event.quantity}
        update_fields = {"remaining_weight": remaining_weight}
        if finish_date is not None:
            update_fields["finish_date"] = finish_date
            
        self.mongo.update_one_push(self.COLLECTION, query, {"consumptions": consumption_event})
        self.mongo.update_one(self.COLLECTION, query, update_fields)
        return True


    def consume_product(self, product_id: str, consumed_at: datetime, quantity: float | None = None) -> bool:
        product = self.get_by_id(product_id)
        if not product or product.finish_date is not None:
            return False
        
        remaining = self._remaining_weight(product)
        
        if quantity is not None:
            if quantity <= 0 or quantity > remaining:
                return False
        else:
            quantity = remaining
            
        consumption = ConsumptionEvent(date=consumed_at, quantity=quantity)
        remaining_weight = int(remaining - quantity)
        
        if remaining_weight == 0:
            finish_date = consumed_at
        else:
            finish_date = None
            
        return self.add_consumption(
            product_id, consumption, remaining_weight=remaining_weight, finish_date=finish_date
        )

    def delete_product(self, product_id: str) -> bool:
        query_filtro = {"_id": ObjectId(product_id)}
        return self.mongo.delete_one(self.COLLECTION, query_filtro)

    def delete_all(self) -> int:
        return self.mongo.delete_all(self.COLLECTION)
