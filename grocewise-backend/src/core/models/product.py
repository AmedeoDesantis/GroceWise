from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Nutrients(BaseModel):
    calories: Optional[float] = None
    carbohydrates: Optional[float] = None
    proteins: Optional[float] = None
    fats: Optional[float] = None

class ConsumptionEvent(BaseModel):
    date: datetime
    quantity: float


class Product(BaseModel):
    db_id: Optional[str] = None
    barcode: str
    name: str
    brand: Optional[str] = None
    price: float = 0.0
    buy_date: Optional[datetime] = None
    finish_date: Optional[datetime] = None
    nutrients: Optional[Nutrients] = None
    ingredients: Optional[list] = None
    weight: Optional[float] = None
    remaining_weight: Optional[float] = None
    consumptions: list[ConsumptionEvent] = Field(default_factory=list)
