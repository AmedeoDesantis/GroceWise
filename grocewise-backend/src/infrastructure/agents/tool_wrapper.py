# src/infrastructure/agents/tool_wrapper.py
from typing import List, Optional, Callable, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

from src.services.fridge_service import FridgeService
from src.services.analytics_service import AnalyticsService

class ProductFilter(str, Enum):
    ALL = "all"
    UNCONSUMED = "unconsumed"
    CONSUMED = "consumed"

class ToolWrapper:
    """Facade che espone le azioni per l'agente AI."""

    def __init__(self, fridge_service: FridgeService, analytics_service: AnalyticsService):
        self._fridge = fridge_service
        self._analytics = analytics_service

    async def get_products(self, filter: ProductFilter = ProductFilter.UNCONSUMED) -> List[Dict[str, Any]]:
        """Recupera i prodotti presenti nel frigorifero filtrati per stato."""
        filter_str = filter.value if isinstance(filter, ProductFilter) else str(filter).lower()
        match filter_str:
            case "consumed":
                products = self._fridge.get_all_consumed_products()
            case "all":
                products = self._fridge.repository.get_all_products()
            case _:
                products = self._fridge.get_all_unconsumed_products()
        return [p.model_dump(mode="json") for p in products]

    async def get_analytics(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Recupera le statistiche di consumo nutrizionale e di spesa."""
        now = datetime.now()
        parsed_end = datetime.fromisoformat(end_date.replace("Z", "+00:00")) if end_date else now
        parsed_start = (
            datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            if start_date else parsed_end - timedelta(days=30)
        )
        stats = self._analytics.get_consumption_statistics(parsed_start, parsed_end)
        return stats.model_dump(mode="json")

    async def add_product(self, barcode: str, price: float = 0.0, buy_date: Optional[str] = None) -> str:
        """Aggiunge un alimento al frigorifero leggendo le informazioni dal codice a barre."""
        effective_date = buy_date or datetime.now().isoformat()
        return str(self._fridge.add_product_from_barcode(barcode, price, effective_date))


    def get_tools(self) -> List[Callable[..., Any]]:
        """Restituisce le funzioni grezze per la registrazione dello schema nell'SDK."""
        return [self.get_products, self.get_analytics, self.add_product]

    def get_callable_map(self) -> Dict[str, Callable[..., Any]]:
        """Mappa i nomi delle funzioni agli handler eseguibili."""
        return {
            "get_products": self.get_products,
            "getProducts": self.get_products,
            "get_analytics": self.get_analytics,
            "getAnalytics": self.get_analytics,
            "add_product": self.add_product,
            "addProduct": self.add_product,
        }