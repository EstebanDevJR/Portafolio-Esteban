from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    """Esquema para un mensaje de chat"""
    role: MessageRole
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Esquema para petición de chat"""
    message: str = Field(..., min_length=1, max_length=2000, description="Mensaje del usuario")
    session_id: Optional[str] = Field(None, description="ID de sesión para mantener contexto")
    conversation_history: Optional[List[ChatMessage]] = Field(default=[], description="Historial de conversación")
    user_id: Optional[str] = Field(None, description="ID del usuario (opcional)")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Temperatura para generación")


class ChatResponse(BaseModel):
    """Esquema para respuesta de chat"""
    response: str
    session_id: str
    timestamp: datetime
    tokens_used: Optional[int] = None
    response_time_ms: Optional[int] = None


class ConversationSummary(BaseModel):
    """Resumen de conversación"""
    id: int
    session_id: str
    message_count: int
    created_at: datetime
    last_message_at: Optional[datetime]
    is_active: bool


class MessageDetail(BaseModel):
    """Detalle de mensaje"""
    id: int
    role: MessageRole
    content: str
    timestamp: datetime
    tokens_used: Optional[int] = None
    response_time_ms: Optional[int] = None
