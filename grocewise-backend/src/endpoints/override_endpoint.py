from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from src.core.models.override import BarcodeOverride
from src.services.override_service import OverrideService
from src.core.containers.app_container import AppContainer

router = APIRouter(prefix="/overrides", tags=["Overrides"])

@router.patch("/product/{barcode}")
def resolve_product_override(
    updates: BarcodeOverride, 
    service: OverrideService = Depends(AppContainer.get_override_service)
    ):

    service.save_override(updates)
    return {"status": "success", "message": f"Override saved for barcode {updates.barcode}"}