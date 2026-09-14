# src/services/chat_service.py
import asyncio
import os
from typing import List
import inspect

from src.core.models.chat import ChatMessage, ChatResponse, ToolResult
from src.infrastructure.agents.gemini.gemini_gateway import GeminiGateway
from src.infrastructure.agents.tool_wrapper import ToolWrapper

from src.core.exceptions.agent_exceptions import (
    AgentOccupiedException,
    AgentQuotaExhaustedException,
    AgentException
)

FLASH_MODEL = os.getenv("GEMINI_FLASH_MODEL", "gemini-2.5-flash")
PRO_MODEL = os.getenv("GEMINI_PRO_MODEL", "gemini-2.5-pro")

class ChatService:
    def __init__(self, gateway: GeminiGateway, tool_wrapper: ToolWrapper):
        self.gateway = gateway
        self.wrapper = tool_wrapper

    async def send_message(self, messages: List[ChatMessage]) -> ChatResponse:
        try:
            return await self._execute_cycle(messages)
        except AgentOccupiedException:
            await asyncio.sleep(10)
            try:
                return await self._execute_cycle(messages)
            except AgentException:
                return self._create_fallback_response(messages)
            
        except AgentQuotaExhaustedException:
            return self._create_fallback_response(messages)
        
        except AgentException:
            return self._create_fallback_response(messages)

    async def _execute_cycle(self, messages: List[ChatMessage]) -> ChatResponse:
        response = await self.gateway.generate(
            model=FLASH_MODEL,
            messages=messages,
            tools=self.wrapper.get_tools()
        )

        if response.has_tool_calls:
            results: List[ToolResult] = []
            callable_map = self.wrapper.get_callable_map()

            for call in response.tool_calls:
                fn = callable_map.get(call.name)
                if fn:
                    data = await fn(**call.args) if inspect.iscoroutinefunction(fn) else fn(**call.args)
                else:
                    data = {"error": f"Tool '{call.name}' non supportato"}
                results.append(ToolResult(call_id=call.call_id, name=call.name, data=data))

            return await self.gateway.generate_followup(
                model=PRO_MODEL,
                messages=messages,
                first_response=response,
                results=results
            )

        if len(response.message or "") >= 50:
            return response

        return await self.gateway.generate(
            model=PRO_MODEL,
            messages=messages,
            tools=self.wrapper.get_tools()
        )

    def _create_fallback_response(self, messages: List[ChatMessage]) -> ChatResponse:
        last_user = next((m.content.lower() for m in reversed(messages) if m.role == "user"), "")
        reply = "Come assistente GroceWise posso aiutarti con scadenze e ricette[cite: 1]."
        if "ricetta" in last_user or "cucinare" in last_user:
            reply = "Posso suggerirti idee basandomi sui prodotti disponibili nel frigo[cite: 1]!"
        elif "scadenza" in last_user:
            reply = "Controlla le scadenze nella lista per consumare prima i cibi deperibili[cite: 1]."

        return ChatResponse(
            message=reply,
            model_used="simulated",
            is_fallback=True,
            tokens_used=0
        )