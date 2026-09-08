from src.core.models.override import BarcodeOverride

class OverrideRepository:
    def __init__(self, mongo_client):
        # Riceve l'istanza della tua classe MongoDB
        self.mongo = mongo_client
        self.collection_name = "barcode_overrides"

    def get_override(self, barcode: str) -> BarcodeOverride | None:
        results = self.mongo.find(self.collection_name, {"barcode": barcode})
        return BarcodeOverride(**results[0]) if results else None

    def save_override(self, override: BarcodeOverride):
        data = override.model_dump(exclude_unset=True) 
        existing = self.mongo.find(self.collection_name, {"barcode": override.barcode})
        
        if existing:
            self.mongo.update_one(
                self.collection_name, 
                {"barcode": override.barcode}, 
                data
            )
        else:
            self.mongo.insert_one(
                self.collection_name, 
                data
            )