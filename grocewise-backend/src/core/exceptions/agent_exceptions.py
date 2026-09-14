class AgentException(Exception):
    """Eccezione base per il sottosistema agentico."""
    pass

class AgentOccupiedException(AgentException):
    """Sollevata quando il provider è sovraccarico (es. HTTP 503 Service Unavailable)."""
    pass

class AgentQuotaExhaustedException(AgentException):
    """Sollevata al superamento dei limiti di token o rate limit (es. HTTP 429)."""
    pass

class AgentUnavailableException(AgentException):
    """Sollevata per errori di connessione, timeout o disservizio generico."""
    pass