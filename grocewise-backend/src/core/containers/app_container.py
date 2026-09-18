import os
from src.core.mongo import MongoDB
from src.core.factories.product_factory import ProductFactory
from src.core.factories.day_stat_factory import DayStatsFactory
from src.core.repositories.product_repository import ProductRepository
from src.services.fridge_service import FridgeService
from src.services.analytics_service import AnalyticsService
from src.services.chat_service import ChatService
from src.infrastructure.agents.gemini.gemini_gateway import GeminiGateway
from src.infrastructure.agents.gemini.gemini_adapter import GeminiAdapter
from src.services.override_service import OverrideService
from src.core.repositories.override_repository import OverrideRepository
from src.infrastructure.agents.tool_wrapper import ToolWrapper

class AppContainer:
    _mongo_client: MongoDB | None = None
    _fridge_service: FridgeService | None = None
    _analytics_service: AnalyticsService | None = None
    _chat_service: ChatService | None = None
    _override_service: OverrideService | None = None
    
    
    @classmethod
    def get_mongo_client(cls) -> MongoDB:
        if cls._mongo_client is None:
            cls._mongo_client = MongoDB()
        return cls._mongo_client

    @classmethod
    def get_fridge_service(cls) -> FridgeService:
        if cls._fridge_service is None:
            factory = ProductFactory(override_repository = OverrideRepository(mongo_client=cls.get_mongo_client()))
            repo = ProductRepository(mongo_client=cls.get_mongo_client(), factory=factory)
            cls._fridge_service = FridgeService(repository=repo, factory=factory)
        return cls._fridge_service

    @classmethod
    def get_override_service(cls) -> OverrideService:
        if cls._override_service is None:
            repo = OverrideRepository(mongo_client=cls.get_mongo_client())
            cls._override_service = OverrideService(override_repository=repo)
        return cls._override_service

    @classmethod
    def get_analytics_service(cls) -> AnalyticsService:
        if cls._analytics_service is None:
            factory = ProductFactory(override_repository = OverrideRepository(mongo_client=cls.get_mongo_client()))
            stats_factory = DayStatsFactory()
            repo = ProductRepository(mongo_client=cls.get_mongo_client(), factory=factory)
            cls._analytics_service = AnalyticsService(repository=repo, day_stat_factory=stats_factory)
        return cls._analytics_service

    @classmethod
    def get_chat_service(cls) -> ChatService:
        if cls._chat_service is None:
            fridge = cls.get_fridge_service()
            analytics = cls.get_analytics_service()

            cls._chat_service = ChatService(
                gateway = GeminiGateway(),
                tool_wrapper = ToolWrapper(fridge_service=fridge, analytics_service=analytics)
            )
        return cls._chat_service