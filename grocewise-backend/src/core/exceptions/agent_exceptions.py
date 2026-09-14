class AgentException(Exception):
    """Base exception for the agent subsystem."""
    pass

class AgentOccupiedException(AgentException):
    """Raised when the provider is overloaded (e.g., HTTP 503 Service Unavailable)."""
    pass

class AgentQuotaExhaustedException(AgentException):
    """Raised when token limits or rate limits are exceeded (e.g., HTTP 429)."""
    pass

class AgentUnavailableException(AgentException):
    """Raised for connection errors, timeouts, or generic service failures."""
    pass