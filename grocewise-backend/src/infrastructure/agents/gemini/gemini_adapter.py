from typing import List
from google.genai import types
from src.core.models.chat import ChatMessage, ToolResult

class GeminiAdapter:
    """Traduce i modelli di dominio negli oggetti tipizzati dell'SDK Google Gemini."""

    def to_content(self, message: ChatMessage) -> types.Content:
        role = "model" if message.role in ("assistant", "model") else "user"
        return types.Content(
            role=role,
            parts=[types.Part.from_text(text=message.content)]
        )

    def to_contents(self, messages: List[ChatMessage]) -> List[types.Content]:
        return [self.to_content(m) for m in messages if m.role != "system"]

    def to_tool_part(self, result: ToolResult) -> types.Part:
        return types.Part.from_function_response(
            name=result.name,
            response={"data": result.data}  # Wrap in {"data": ...} per evitare errore 400 su array
        )