from enum import Enum

from pydantic import BaseModel
from typing import Optional

class Unit(str, Enum):
    GRAM = "g"
    KILOGRAM = "kg"
    LITER = "l"
    MILLILITER = "ml"

class BarcodeOverride(BaseModel):
    barcode: str
    name: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[float] = None
    unit: Optional[Unit] = None
    

