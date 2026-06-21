from src.core.models.product import Product
from src.core.models.stats import DayStats

class DayStatsFactory:
    @staticmethod
    def build_from_product(product: Product) -> DayStats:
        time_span = (product.finish_date - product.buy_date).days + 1
        hundred_grams_units = product.weight / 100
        
        return DayStats(
            calories        =   product.nutrients.calories * hundred_grams_units / time_span,
            carbohydrates   =   product.nutrients.carbohydrates * hundred_grams_units / time_span,
            proteins        =   product.nutrients.proteins * hundred_grams_units / time_span,
            fats            =   product.nutrients.fats * hundred_grams_units / time_span,
            cost            =   product.price / time_span
        )
    @staticmethod    
    def build_empty_stats() -> DayStats:
        return DayStats()