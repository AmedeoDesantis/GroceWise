from datetime import datetime

from src.core.models.product import Product
from src.core.models.stats import AnalyticsResponse


class AnalyticsService:
    def __init__(self, repository=None, day_stat_factory=None):
        self.repository = repository
        self.day_stat_factory = day_stat_factory

    def get_consumption_statistics(self, start_date: datetime, end_date: datetime) -> AnalyticsResponse:
        
        products = self.repository.get_all_products()
        return self._get_consumption_statistics_from_products(products, start_date, end_date)
    
    def get_product_consumption_statistics(self, product_id: str, start_date: datetime, end_date: datetime) -> AnalyticsResponse:
        product = self.repository.get_by_id(product_id)
        if not product:
            raise ValueError(f"Product with ID {product_id} not found.")
        
        products = self.repository.get_by_barcode(product.barcode)
        return self._get_consumption_statistics_from_products(products, start_date, end_date)

    def _get_consumption_statistics_from_products(self, products: list[Product], start_date: datetime, end_date: datetime) -> AnalyticsResponse:
        daily_stats = {}
        for product in products:
            consumptions = [cons for cons in product.consumptions if start_date <= cons.date <= end_date]
                
            for cons in consumptions:
                date = cons.date.date()
                
                if date not in daily_stats:
                    daily_stats[date] = self.day_stat_factory.build_empty_stats()
                
                daily_stats[date] += self.day_stat_factory.build_from_consumption(product, cons.quantity)
                                    
        return AnalyticsResponse(daily_analytics=daily_stats)