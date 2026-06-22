from src.core.models.product import Product
from src.core.models.stats import DayStats


class DayStatsFactory:
    @staticmethod
    def build_from_product(product: Product) -> DayStats:
        """Distribuzione uniforme su buy_date → finish_date (logica legacy)."""
        time_span = (product.finish_date - product.buy_date).days + 1
        hundred_grams_units = (product.weight or 0) / 100

        nutrients = product.nutrients
        if not nutrients:
            return DayStats(cost=round(product.price / time_span, 2))

        return DayStats(
            calories=round((nutrients.calories or 0) * hundred_grams_units / time_span, 2),
            carbohydrates=round((nutrients.carbohydrates or 0) * hundred_grams_units / time_span, 2),
            proteins=round((nutrients.proteins or 0) * hundred_grams_units / time_span, 2),
            fats=round((nutrients.fats or 0) * hundred_grams_units / time_span, 2),
            cost=round(product.price / time_span, 2),
        )

    @staticmethod
    def build_from_consumption(product: Product, quantity: float) -> DayStats:
        """Statistiche proporzionali a un singolo evento di consumo."""
        weight_ratio = quantity / product.weight if product.weight and product.weight > 0 else 0.0
        hundred_grams_units = quantity / 100

        nutrients = product.nutrients
        if not nutrients:
            return DayStats(cost=round(product.price * weight_ratio, 2))

        return DayStats(
            calories=round((nutrients.calories or 0) * hundred_grams_units, 2),
            carbohydrates=round((nutrients.carbohydrates or 0) * hundred_grams_units, 2),
            proteins=round((nutrients.proteins or 0) * hundred_grams_units, 2),
            fats=round((nutrients.fats or 0) * hundred_grams_units, 2),
            cost=round(product.price * weight_ratio, 2),
        )

    @staticmethod
    def build_empty_stats() -> DayStats:
        return DayStats()
