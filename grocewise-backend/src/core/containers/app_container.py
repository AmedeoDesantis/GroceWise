from src.core.mongo import MongoDB
from src.core.factories.product_factory import ProductFactory
from src.core.factories.day_stat_factory import DayStatsFactory
from src.core.repositories.product_repository import ProductRepository
from src.services.fridge_service import FridgeService
from src.services.analytics_service import AnalyticsService

class AppContainer:
    """
    Composition Root dell'applicazione GroceWise.
    Si occupa di centralizzare l'inizializzazione dei componenti software
    e di risolvere l'albero delle dipendenze di tutti gli strati.
    """
    _mongo_client = MongoDB()

    @classmethod
    def get_mongo_client(cls) -> MongoDB:
        """Restituisce l'istanza condivisa e sicura del client MongoDB"""
        return cls._mongo_client

    @classmethod
    def get_fridge_service(cls) -> FridgeService:
        """
        Assemblatore (Provider) per il servizio del frigo.
        Costruisce l'albero delle dipendenze partendo dal basso (Infrastruttura)
        fino all'alto (Dominio/Servizio).
        """
        factory = ProductFactory()
        repository = ProductRepository(mongo_client=cls._mongo_client, factory=factory)
        return FridgeService(repository=repository, factory=factory)
    
    @classmethod
    def get_analytics_service(cls) -> AnalyticsService:
        """
        Assemblatore (Provider) per il servizio di analisi dei consumi.
        Costruisce l'albero delle dipendenze partendo dal basso (Infrastruttura)
        fino all'alto (Dominio/Servizio).
        """
        factory = DayStatsFactory()
        repository = ProductRepository(mongo_client=cls._mongo_client, factory=ProductFactory())
        return AnalyticsService(repository=repository, factory=factory)
