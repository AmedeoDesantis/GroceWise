import openfoodfacts
from src.core.models.product import Product, Nutrients, ConsumptionEvent
from typing import Optional
import logging
import os
import re

logger = logging.getLogger(__name__)


class ProductFactory:
    def __init__(self):
        self.client = openfoodfacts.API(
            user_agent=os.getenv("OPENFOODFACTS_USER_AGENT", "GroceWise (amedeo.des@gmail.com)"),
            username=os.getenv("OPENFOODFACTS_USERNAME"),
            password=os.getenv("OPENFOODFACTS_PASSWORD"),
        )

    def _build_nutrients(self, raw_nutrients: dict) -> Nutrients:
        return Nutrients(
            calories=raw_nutrients.get("calories", raw_nutrients.get("energy-kcal_100g", 0)),
            proteins=raw_nutrients.get("proteins", raw_nutrients.get("proteins_100g", 0.0)),
            carbohydrates=raw_nutrients.get("carbohydrates", raw_nutrients.get("carbohydrates_100g", 0.0)),
            fats=raw_nutrients.get("fats", raw_nutrients.get("fat_100g", 0.0)),
        )

    def _get_localized_name(self, raw_product: dict) -> str:
        localization_priority = ["it", "en", "fr", "de"]
        base_key = ["product_name", "generic_name"]
        for key in base_key:
            for lang in localization_priority:
                localized_key = f"{key}_{lang}"
                if localized_key in raw_product and raw_product[localized_key].strip() != "":
                    return raw_product[localized_key]
        return raw_product.get("product_name", "unknown product name")

    def _get_weight(self, raw_product: dict) -> Optional[float]:
        quantity_items = [q for key, q in raw_product.items() if key.startswith("quantity")]
        for quantity in quantity_items:
            if isinstance(quantity, str):
                numbers = re.sub(r"[^\d.]", "", str(quantity))
                if numbers != "":
                    return float(numbers)
        return 0.0

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
                logger.warning(f"Barcode {barcode} non trovato su OpenFoodFacts. Generazione fallback.")
                return None

            raw_product = response
            nutrients = self._build_nutrients(raw_product.get("nutriments", {}))
            weight = self._get_weight(raw_product)

            return Product(
                db_id=None,
                barcode=barcode,
                name=self._get_localized_name(raw_product),
                brand=raw_product.get("brands", "unknown"),
                price=price,
                buy_date=buy_date,
                finish_date=finish_date,
                ingredients=self._get_ingredients(raw_product),
                nutrients=nutrients,
                weight=weight,
                remaining_weight=weight,
                consumptions=[],
            )
        except Exception as e:
            logger.error(f"Errore nella factory durante la creazione dell'alimento {barcode}: {str(e)}")
            return None

    def build_from_dict(self, data: dict) -> Product:
        """RICOSTRUZIONE: Legge il dizionario strutturato proveniente da MongoDB"""
        nutrients_data = data.get("nutrients", {})
        nutrients = self._build_nutrients(nutrients_data)
        weight = data.get("weight", 0.0) or 0.0
        consumptions = self._parse_consumptions(data.get("consumptions", []))

        remaining_weight = data.get("remaining_weight")
        if remaining_weight is None:
            # Migrazione documenti legacy con finish_date
            if data.get("finish_date") is not None:
                remaining_weight = 0.0
                if not consumptions and weight > 0:
                    consumptions = [
                        ConsumptionEvent(date=data["finish_date"], quantity=weight)
                    ]
            else:
                remaining_weight = weight

        return Product(
            db_id=str(data.get("_id")),
            barcode=data.get("barcode", ""),
            name=data.get("name", ""),
            brand=data.get("brand", "unknown"),
            price=data.get("price", 0.0),
            buy_date=data.get("buy_date"),
            finish_date=data.get("finish_date"),
            nutrients=nutrients,
            ingredients=data.get("ingredients", []),
            weight=weight,
            remaining_weight=remaining_weight,
            consumptions=consumptions,
        )
