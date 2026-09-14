from fastapi import APIRouter, Depends
from src.core.models.chat import ChatRequest, ChatResponse
from src.services.chat_service import ChatService
from src.core.containers.app_container import AppContainer

router = APIRouter(prefix="/agent", tags=["AI Agent"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    payload: ChatRequest,
    chat_service: ChatService = Depends(AppContainer.get_chat_service)
):
    return await chat_service.send_message(payload.messages)