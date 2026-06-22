from datetime import datetime, timedelta
from src.core.models.stats import AnalyticsResponse


class AnalyticsService:
    def __init__(self, repository=None, factory=None):
        self.repository = repository
        self.factory = factory

    def get_consumption_statistics(self, start_date: datetime, end_date: datetime):
        daily_stats = {}
        range_start = start_date.date()
        range_end = end_date.date()

        for product in self.repository.get_all_products():
            if product.consumptions:
                for event in product.consumptions:
                    event_day = event.date.date()
                    if range_start <= event_day <= range_end:
                        if event_day not in daily_stats:
                            daily_stats[event_day] = self.factory.build_empty_stats()
                        daily_stats[event_day] += self.factory.build_from_consumption(
                            product, event.quantity
                        )
            elif product.finish_date and product.buy_date:
                product_start = product.buy_date.date()
                product_end = product.finish_date.date()

                if product_end < range_start or product_start > range_end:
                    continue

                for day_delta in range((product_end - product_start).days + 1):
                    current_day = product_start + timedelta(days=day_delta)
                    if range_start <= current_day <= range_end:
                        if current_day not in daily_stats:
                            daily_stats[current_day] = self.factory.build_empty_stats()
                        daily_stats[current_day] += self.factory.build_from_product(product)

        return AnalyticsResponse(daily_analytics=daily_stats)
