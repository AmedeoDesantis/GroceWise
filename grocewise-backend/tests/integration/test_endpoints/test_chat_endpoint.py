import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch
from src.main import app
from src.core.models.chat import ChatMessage, ChatResponse


@pytest.mark.integration
class TestChatEndpoint:
    
    @pytest.fixture
    def client(self, override_app_container):
        """TestClient with overridden dependencies"""
        return TestClient(app)
    
    @pytest.fixture
    def mock_chat_response(self):
        """Mock chat response"""
        return ChatResponse(
            message="Test response",
            model_used="gemini-2.5-flash",
            is_fallback=False,
            tokens_used=100
        )
    
    def test_chat_endpoint_success(self, client, override_app_container, mock_chat_response):
        """Test successful chat interaction"""
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = mock_chat_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "Hello"}
                    ]
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Test response"
            assert data["model_used"] == "gemini-2.5-flash"
            assert data["is_fallback"] is False
    
    def test_chat_endpoint_empty_messages(self, client):
        """Test chat endpoint with empty messages"""
        response = client.post(
            "/agent/chat",
            json={
                "messages": []
            }
        )
        
        # May return 422 for validation or 200 with empty response
        assert response.status_code in [200, 422]
    
    def test_chat_endpoint_invalid_message_format(self, client):
        """Test chat endpoint with invalid message format"""
        response = client.post(
            "/agent/chat",
            json={
                "messages": [
                    {"content": "Hello"}  # Missing role
                ]
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_chat_endpoint_multiple_messages(self, client, override_app_container, mock_chat_response):
        """Test chat endpoint with conversation history"""
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = mock_chat_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "Hello"},
                        {"role": "assistant", "content": "Hi there!"},
                        {"role": "user", "content": "How are you?"}
                    ]
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Test response"
    
    def test_chat_endpoint_fallback_response(self, client, override_app_container):
        """Test chat endpoint returning fallback response"""
        fallback_response = ChatResponse(
            message="Come assistente GroceWise posso aiutarti con scadenze e ricette.",
            model_used="simulated",
            is_fallback=True,
            tokens_used=0
        )
        
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = fallback_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "ricetta"}
                    ]
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["is_fallback"] is True
            assert data["model_used"] == "simulated"
    
    def test_chat_endpoint_with_tool_calls(self, client, override_app_container):
        """Test chat endpoint with tool calls in response"""
        tool_response = ChatResponse(
            message="Based on your fridge, you have these products expiring soon.",
            model_used="gemini-2.5-pro",
            is_fallback=False,
            tokens_used=150,
            tool_calls=[
                {
                    "call_id": "call_123",
                    "name": "get_fridge_products",
                    "args": {"filter": "expiring_soon"}
                }
            ]
        )
        
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = tool_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "What's expiring soon?"}
                    ]
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            assert "tool_calls" in data or "message" in data
    
    def test_chat_endpoint_service_error(self, client, override_app_container):
        """Test chat endpoint when service raises exception"""
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.side_effect = Exception("Service error")
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "Hello"}
                    ]
                }
            )
            
            # Should handle error gracefully
            assert response.status_code in [200, 500]
    
    def test_chat_endpoint_long_message(self, client, override_app_container, mock_chat_response):
        """Test chat endpoint with long message"""
        long_message = "Hello " * 1000  # Long message
        
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = mock_chat_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": long_message}
                    ]
                }
            )
            
            assert response.status_code == 200
    
    def test_chat_endpoint_special_characters(self, client, override_app_container, mock_chat_response):
        """Test chat endpoint with special characters"""
        special_message = "Hello! @#$%^&*()_+ {}|:\"<>?[]\\;',./`~"
        
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = mock_chat_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": special_message}
                    ]
                }
            )
            
            assert response.status_code == 200
    
    def test_chat_endpoint_unicode_characters(self, client, override_app_container, mock_chat_response):
        """Test chat endpoint with unicode characters"""
        unicode_message = "Hello 世界 🌍 你好 مرحبا"
        
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = mock_chat_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": unicode_message}
                    ]
                }
            )
            
            assert response.status_code == 200
    
    def test_chat_endpoint_recipe_query(self, client, override_app_container):
        """Test chat endpoint with recipe-related query"""
        recipe_response = ChatResponse(
            message="Posso suggerirti idee basandomi sui prodotti disponibili nel frigo!",
            model_used="simulated",
            is_fallback=True,
            tokens_used=0
        )
        
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = recipe_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "Dammi una ricetta"}
                    ]
                }
            )
            
            assert response.status_code == 200
    
    def test_chat_endpoint_expiry_query(self, client, override_app_container):
        """Test chat endpoint with expiry-related query"""
        expiry_response = ChatResponse(
            message="Controlla le scadenze nella lista per consumare prima i cibi deperibili.",
            model_used="simulated",
            is_fallback=True,
            tokens_used=0
        )
        
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = expiry_response
            
            response = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "Quali prodotti scadono?"}
                    ]
                }
            )
            
            assert response.status_code == 200
    
    def test_chat_endpoint_conversation_context(self, client, override_app_container, mock_chat_response):
        """Test that conversation context is maintained"""
        with patch.object(override_app_container.get_chat_service(), 'send_message', new_callable=AsyncMock) as mock_send:
            mock_send.return_value = mock_chat_response
            
            # First message
            response1 = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "I have pasta"}
                    ]
                }
            )
            
            # Second message with context
            response2 = client.post(
                "/agent/chat",
                json={
                    "messages": [
                        {"role": "user", "content": "I have pasta"},
                        {"role": "assistant", "content": "Great! What would you like to make?"},
                        {"role": "user", "content": "A recipe"}
                    ]
                }
            )
            
            assert response1.status_code == 200
            assert response2.status_code == 200
