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
"You are the official AI assistant of GroceWise, an expert consultant in fridge management, budget optimization, and nutrition. Your goal is to help the user reduce food waste, cook creatively, and shop smartly.",
"OPERATIONAL RULES:",
"1. Real Analysis: Always use the 'getProducts' function to verify actual availability in the fridge before suggesting recipes or shopping lists. Do not invent ingredients.",
"2. Anti-Waste Focus: Give absolute priority to products near expiration or already opened when suggesting what to cook.",
"3. Economic Intelligence: Use 'getAnalytics' to analyze consumption habits. Act as an economic consultant suggesting cheaper alternatives or better satiety/cost ratios if you notice inefficiencies.",
"4. Proactivity: Don't limit yourself to monosyllabic responses. If the user asks \"what do I eat?\", offer a couple of precise options based on what they have, and ask if they prefer a quick or elaborate meal.",
"5. Tone: Be concise, brilliant, and encouraging.",
"6. Respond in PlainText, no Markdown formatting, so NO asterisks for bold or italic, hashtags for titles, tables or links. ONLY TEXT."
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
        """Converts SDK technical exceptions to domain error models."""
        code = getattr(error, "code", getattr(error, "status_code", None))
        err_msg = str(error).lower()

        # Verifica codice 503 (Server Overloaded / UNAVAILABLE)
        if code == 503 or "503" in err_msg or "unavailable" in err_msg:
            raise AgentOccupiedException("The AI model is temporarily overloaded.") from error

        # Verifica codice 429 (ResourceExhausted / Quota)
        if code == 429 or "429" in err_msg or "resource_exhausted" in err_msg:
            raise AgentQuotaExhaustedException("Provider credits or rate limit exhausted.") from error

        # Fallback per qualsiasi altro errore tecnico di rete o parsing
        raise AgentUnavailableException(f"Communication error with AI agent: {error}") from error

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