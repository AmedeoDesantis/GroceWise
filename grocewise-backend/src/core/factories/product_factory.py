import openfoodfacts
from src.core.models.product import Product, Nutrients, ConsumptionEvent
from src.core.models.override import BarcodeOverride
from typing import Optional
import logging
import os
import re

logger = logging.getLogger(__name__)


class ProductFactory:
    def __init__(self, override_repository):
        self.client = openfoodfacts.API(
            user_agent=os.getenv("OPENFOODFACTS_USER_AGENT", "GroceWise (amedeo.des@gmail.com)"),
            username=os.getenv("OPENFOODFACTS_USERNAME"),
            password=os.getenv("OPENFOODFACTS_PASSWORD"),
        )
        self.product_override_repository = override_repository

    def _build_nutrients(self, raw_nutrients: dict) -> Nutrients:
        return Nutrients(
            calories=round(raw_nutrients.get("calories", raw_nutrients.get("energy-kcal_100g", 0))),   
            proteins=round(raw_nutrients.get("proteins", raw_nutrients.get("proteins_100g", 0.0)), 2),
            carbohydrates=round(raw_nutrients.get("carbohydrates", raw_nutrients.get("carbohydrates_100g", 0.0)), 2),
            fats=round(raw_nutrients.get("fats", raw_nutrients.get("fat_100g", 0.0)), 2),
        )

    def _get_localized_name(self, raw_product: dict) -> str:
        localization_priority = ["en", "it", "fr", "de"]
        base_key = ["product_name", "generic_name"]
        for key in base_key:
            for lang in localization_priority:
                localized_key = f"{key}_{lang}"
                if localized_key in raw_product and raw_product[localized_key].strip() != "":
                    return raw_product[localized_key]
        return raw_product.get("product_name", "unknown product name")

    def _get_quantity(self, raw_product: dict) -> Optional[float]:
        
        quantity = raw_product.get("product_quantity", None)
        

        if not quantity:
            quantity_items = [q for key, q in raw_product.items() if key.startswith("quantity") or key.endswith("quantity")]
            for quantity in quantity_items:
                    numbers = re.sub(r"[^\d.]", "", str(quantity))
                    if numbers != "":  
                        return float(numbers)
            return 0.0
        
        #drained/undrained version case
        return float(re.sub(r'[\\/].*', '', str(quantity)).strip())
    
    def _get_unit(self, raw_product: dict) -> Optional[str]:
        unit = raw_product.get("product_quantity_unit", None) 
        
        if unit:
            return unit

        unit_items = [q for key, q in raw_product.items() if key.startswith("unit") or key.endswith("unit")]
        for unit in unit_items:
            if unit in ['g', 'kg', 'ml', 'l']:
                return unit
        return None    

    def _get_ingredients(self, raw_product: dict) -> Optional[list]:
        ingredients = raw_product.get("ingredients", None)
        ids = []
        if isinstance(ingredients, list):
            for ingredient in ingredients:
                if isinstance(ingredient, dict) and "id" in ingredient:
                    ids.append(ingredient["id"])
                elif isinstance(ingredient, str):
                    ids.append(ingredient)
        return ids

    def _parse_consumptions(self, raw_consumptions: list) -> list[ConsumptionEvent]:
        events = []
        for item in raw_consumptions or []:
            if isinstance(item, dict) and "date" in item and "quantity" in item:
                events.append(ConsumptionEvent(date=item["date"], quantity=item["quantity"]))
        return events

    def build_from_barcode(self, barcode: str, price: float = 0.0, buy_date=None, finish_date=None) -> Optional[Product]:
        try:
            response = self.client.product.get(barcode)

            if not response:
                logger.warning(f"Barcode {barcode} not found on OpenFoodFacts. Generating fallback.")
                return None
            raw_product = response
            product = Product(
                db_id=None,
                barcode=barcode,
                name=self._get_localized_name(raw_product),
                brand=raw_product.get("brands", "unknown"),
                price=price,
                buy_date=buy_date,
                finish_date=finish_date,
                ingredients=self._get_ingredients(raw_product),
                nutrients=self._build_nutrients(raw_product.get("nutriments", {})),
                quantity=self._get_quantity(raw_product),
                unit=self._get_unit(raw_product),
                remaining_quantity=None,
                consumptions=[],
            )
            
            override = self.product_override_repository.get_override(barcode)
            if override:
                product = self._apply_override(product, override)
            
            product.remaining_quantity = product.quantity
            return product
        except Exception as e:
            logger.error(f"Error in factory during product creation {barcode}: {str(e)}")
            return None

    def _apply_override(self, product: Product, override: BarcodeOverride) -> Product:
        if override.name:
            product.name = override.name
        if override.price is not None:
            product.price = override.price
        if override.quantity is not None:
            product.quantity = override.quantity
        if override.unit:
            product.unit = override.unit
        return product

    def build_from_dict(self, data: dict) -> Product:
        """RECONSTRUCTION: Reads structured dictionary from MongoDB"""
        nutrients_data = data.get("nutrients", {})
        nutrients = self._build_nutrients(nutrients_data)
        quantity = data.get("quantity", 0.0)
        consumptions = self._parse_consumptions(data.get("consumptions", []))

        
        if data.get("finish_date") and not consumptions:
            consumptions = [
                ConsumptionEvent(date=data["finish_date"], quantity=quantity)
            ]
        
        product =  Product(
            db_id=str(data.get("_id")),
            barcode=data.get("barcode", ""),
            name=data.get("name", ""),
            brand=data.get("brand", "unknown"),
            price=data.get("price", 0.0),
            buy_date=data.get("buy_date"),
            finish_date=data.get("finish_date"),
            nutrients=nutrients,
            ingredients=data.get("ingredients", []),
            quantity=data.get("quantity", 0.0),
            unit=data.get("unit", ""),
            remaining_quantity=0.0,
            consumptions=consumptions,
        )
        
        override = self.product_override_repository.get_override(product.barcode)
        if override:
            product = self._apply_override(product, override)
        
        product.remaining_quantity = product.quantity    
        for event in consumptions:
            product.remaining_quantity -= event.quantity

        return product
