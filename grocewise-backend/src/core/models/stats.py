from __future__ import annotations 
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

class DayStats(BaseModel):
    calories: float = 0.0
    carbohydrates: float = 0.0
    proteins: float = 0.0
    fats: float = 0.0
    cost: float = 0.0 

    def __iadd__(self, other: DayStats) -> DayStats:
        self.calories = round(self.calories + other.calories, 2)
        self.carbohydrates = round(self.carbohydrates + other.carbohydrates, 2)
        self.proteins = round(self.proteins + other.proteins, 2)
        self.fats = round(self.fats + other.fats, 2)
        self.cost = round(self.cost + other.cost, 2)
        return self

class AnalyticsResponse(BaseModel):
    daily_analytics: Dict[datetime, DayStats] = {}