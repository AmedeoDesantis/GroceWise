# src/infrastructure/agents/gemini/gemini_gateway.py
import os
from typing import List, Callable, Optional, Any
from google import genai
from google.genai import types

from src.core.models.chat import ChatMessage, ChatResponse, ToolCall, ToolResult
from src.core.exceptions.agent_exceptions import (
    AgentOccupiedException,
    AgentQuotaExhaustedException,
    AgentUnavailableException,
)
from src.infrastructure.agents.gemini.gemini_adapter import GeminiAdapter

SYSTEM_PROMPT = (
"Sei l'assistente AI ufficiale di GroceWise, un consulente esperto nella gestione del frigorifero, nell'ottimizzazione del budget e nella nutrizione. Il tuo obiettivo è aiutare l'utente a ridurre gli sprechi alimentari, cucinare in modo creativo e fare spese intelligenti.",
"REGOLE OPERATIVE:",
"1. Analisi Reale: Usa sempre la funzione 'getProducts' per verificare l'effettiva disponibilità nel frigo prima di suggerire ricette o liste della spesa. Non inventare ingredienti.",
"2. Focus Anti-Spreco: Dai priorità assoluta ai prodotti vicini alla scadenza o già aperti quando suggerisci cosa cucinare.",
"3. Intelligenza Economica: Sfrutta 'getAnalytics' per analizzare le abitudini di consumo. Agisci come consulente economico suggerendo alternative più economiche o con un miglior rapporto sazietà/costo se noti inefficienze.",
"4. Proattività: Non limitarti a rispondere a monosillabi. Se l'utente chiede \"cosa mangio?\", offri un paio di opzioni precise basate su ciò che ha, e chiedi se preferisce un pasto veloce o elaborato.",
"5. Tono: Sii conciso, brillante e incoraggiante.",
"6. Rispondi in PlainText, no formattazioni Markdown, quindi NO asterischi per il grassetto o corsivo, cancelletti per i titoli, tabelle o link. SOLO TESTO."
)
class GeminiGateway:
    def __init__(self):
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.adapter = GeminiAdapter()

    async def generate(
        self,
        model: str,
        messages: List[ChatMessage],
        tools: Optional[List[Callable[..., Any]]] = None
    ) -> ChatResponse:
        contents = self.adapter.to_contents(messages)
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=tools,
            temperature=0.7,
            max_output_tokens=500
        )
        try:
            response = await self.client.aio.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
            return self._to_chat_response(response, model)
        except Exception as exc:
            self._map_and_raise(exc)

    async def generate_followup(
        self,
        model: str,
        messages: List[ChatMessage],
        first_response: ChatResponse,
        results: List[ToolResult]
    ) -> ChatResponse:
        contents = self.adapter.to_contents(messages)
        contents.append(
            types.Content(role="model", parts=first_response.raw_parts_backup or [])
        )

        tool_parts = [self.adapter.to_tool_part(r) for r in results]
        contents.append(types.Content(role="user", parts=tool_parts))

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.7,
            max_output_tokens=500
        )
        try:
            response = await self.client.aio.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
            return self._to_chat_response(response, model)
        except Exception as exc:
            self._map_and_raise(exc)

    def _map_and_raise(self, error: Exception) -> None:
        """Converte le eccezioni tecniche dell'SDK nei modelli di errore di dominio."""
        code = getattr(error, "code", getattr(error, "status_code", None))
        err_msg = str(error).lower()

        # Verifica codice 503 (Server Overloaded / UNAVAILABLE)
        if code == 503 or "503" in err_msg or "unavailable" in err_msg:
            raise AgentOccupiedException("Il modello AI è temporaneamente sovraccarico.") from error

        # Verifica codice 429 (ResourceExhausted / Quota)
        if code == 429 or "429" in err_msg or "resource_exhausted" in err_msg:
            raise AgentQuotaExhaustedException("Crediti o rate-limit del provider esauriti.") from error

        # Fallback per qualsiasi altro errore tecnico di rete o parsing
        raise AgentUnavailableException(f"Errore di comunicazione con l'agente AI: {error}") from error

    def _to_chat_response(self, response: types.GenerateContentResponse, model: str) -> ChatResponse:
        tool_calls = [
            ToolCall(call_id=c.id, name=c.name, args=dict(c.args or {}))
            for c in (response.function_calls or [])
        ]
        raw_parts = response.candidates[0].content.parts if response.candidates else None
        tokens = response.usage_metadata.total_token_count if response.usage_metadata else 0

        return ChatResponse(
            message=(response.text or "").strip(),
            model_used=model,
            tool_calls=tool_calls,
            tokens_used=tokens,
            raw_parts_backup=raw_parts
        )