from src.core.models.override import BarcodeOverride
from src.core.repositories.override_repository import OverrideRepository


class OverrideService:
    def __init__(self, override_repository: OverrideRepository):
        self.override_repository = override_repository

    def save_override(self, override: BarcodeOverride):
        self.override_repository.save_override(override)