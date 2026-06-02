from pydantic import BaseModel
from typing import Optional

class Nutrients(BaseModel):
    calories: Optional[float] = None
    carbohydrates: Optional[float] = None
    proteins: Optional[float] = None
    fats: Optional[float] = None
    
    
class Product(BaseModel):
    barcode: str
    name: str
    brand: Optional[str] = None
    price: float = 0.0
    buy_date: Optional[str] = None
    finish_date: Optional[str] = None
    nutrients: Optional[Nutrients] = None
    ingredients: Optional[list] = None
    weight: Optional[float] = None