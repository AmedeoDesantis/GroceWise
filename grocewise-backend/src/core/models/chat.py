from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Any, Dict

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ToolCall(BaseModel):
    call_id: Optional[str] = None
    name: str
    args: Dict[str, Any] = Field(default_factory=dict)

class ToolResult(BaseModel):
    call_id: Optional[str] = None
    name: str
    data: Any

class ChatResponse(BaseModel):
    message: str
    model_used: str
    tool_calls: List[ToolCall] = Field(default_factory=list)
    is_fallback: bool = False
    tokens_used: int = 0
    raw_parts_backup: Optional[Any] = None 

    @property
    def has_tool_calls(self) -> bool:
        return len(self.tool_calls) > 0

