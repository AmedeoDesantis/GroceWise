from datetime import datetime, timedelta
from src.core.models.stats import AnalyticsResponse

class AnalyticsService:
    def __init__(self, repository = None, factory = None):
        self.repository = repository
        self.factory = factory

    def get_consumption_statistics(self, start_date: datetime, end_date: datetime):
        
        daily_stats = {}
        
        products_in_range = self.repository.get_products_by_date_range(start_date, end_date)
        
        for product in products_in_range:
            start_date = product.buy_date.date()
            end_date = product.finish_date.date()
                        
            for day_delta in range((end_date - start_date).days + 1):
                current_day = start_date + timedelta(days=day_delta)
                if current_day not in daily_stats:
                    daily_stats[current_day] = self.factory.build_empty_stats()
                
                daily_stats[current_day] += self.factory.build_from_product(product)
    
        return AnalyticsResponse(daily_analytics=daily_stats)