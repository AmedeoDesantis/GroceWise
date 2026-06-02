import openfoodfacts
from src.models.product import Product, Nutrients
from typing import Optional
import logging
import os
import re

logger = logging.getLogger(__name__)

class ProductFactory:
    def __init__(self):
        # Utilizziamo l'API Python nativa come richiesto
        self.client = openfoodfacts.API(user_agent=os.getenv("OPENFOODFACTS_USER_AGENT", "GroceWise (amedeo.des@gmail.com)"),
                                        username = os.getenv("OPENFOODFACTS_USERNAME"),
                                        password = os.getenv("OPENFOODFACTS_PASSWORD"))

    def _build_nutrients(self, raw_nutrients: dict) -> Nutrients:
        """Metodo privato: fabbrica il sotto-oggetto dei nutrienti"""
                
        return Nutrients(
            calories        =   raw_nutrients.get("energy-kcal_100g", 0),
            proteins        =   raw_nutrients.get("proteins_100g", 0.0),
            carbohydrates   =   raw_nutrients.get("carbohydrates_100g", 0.0),
            fats            =   raw_nutrients.get("fat_100g", 0.0)
        )

    def _get_localized_name(self, raw_product: dict) -> str:
        localization_priority = ["it", "en", "fr", "de"] 
        base_key = ['product_name', 'generic_name'] 
        for key in base_key:
            for lang in localization_priority:
                localized_key = f"{key}_{lang}"
                if localized_key in raw_product and raw_product[localized_key].strip() != "":
                    return raw_product[localized_key]

        return "unknown product name"
    
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
                id = ""
                if 'id' in ingredient:
                    id = ingredient['id']
                    ids.append(id)
        
        return ids

        

    def build_from_barcode(self, barcode: str, price: float = 0.0, buy_date=None, finish_date=None) -> Optional[Product]:
        try:
            # Chiamata nativa tramite l'SDK Python
            response = self.client.product.get(code = barcode)
            
            raw_product = {}
            nutrients = self._build_nutrients(response.get("nutriments", {}))  # Struttura nutrienti vuota di default
            
            # Gestiamo il caso "Product Not Found" (response è None o status != 1)
            if response:
                raw_product = response
                nutrients = self._build_nutrients(raw_product.get("nutriments", {}))
            else:
                logger.warning(f"Barcode {barcode} non trovato su OpenFoodFacts. Generazione prodotto di fallback.")

            # Costruiamo comunque l'oggetto Product: se raw_product è vuoto,
            # verranno usati i valori di stringa di default ("unknown", ecc.)
            product = Product(
                barcode       =     barcode,
                name          =     self._get_localized_name(raw_product),
                brand         =     raw_product.get("brands", "unknown"),
                price         =     price,
                buy_date      =     buy_date,
                finish_date   =     finish_date,
                ingredients   =     self._get_ingredients(raw_product),
                nutrients     =     nutrients,
                weight        =     self._get_weight(raw_product)
            )
            
            return product

        except Exception as e:
            logger.error(f"Errore nella factory durante la creazione dell'alimento {barcode}: {str(e)}")
            return None
        
    def build_from_dict(self, data: dict) -> Product:
        nutrients_data = data.get("nutrients", {})
        
        # Gestiamo la ricostruzione sia se nutrients è un dict sia se è già l'oggetto Pydantic
        if isinstance(nutrients_data, dict):
            nutrients = self._build_nutrients(nutrients_data)
        else:
            nutrients = nutrients_data
        
        return Product(
            barcode=data.get("barcode", ""),
            name=data.get("name", ""),
            brand=data.get("brand"),
            category=data.get("category"),
            price=data.get("price", 0.0),
            buy_date=data.get("buy_date"),
            finish_date=data.get("finish_date"),
            nutrients=nutrients,
            ingredients=data.get("ingredients")
        )