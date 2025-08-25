from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime

from app.schemas.chat import ChatRequest, ChatResponse, ConversationSummary, MessageDetail
from app.services.chat_service import ChatService
from app.core.config import settings

router = APIRouter()


def get_chat_service() -> ChatService:
    """Dependency para obtener servicio de chat"""
    return ChatService()


@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service)
) -> ChatResponse:
    """Endpoint principal para chat con el asistente especializado"""
    
    try:
        # Generar session_id si no se proporciona
        session_id = request.session_id or str(uuid.uuid4())
        
        # Generar respuesta
        result = await chat_service.generate_response(
            message=request.message,
            session_id=session_id,
            conversation_history=request.conversation_history,
            user_id=request.user_id,
            temperature=request.temperature
        )
        
        return ChatResponse(
            response=result["response"],
            session_id=result["session_id"],
            timestamp=result["timestamp"],
            tokens_used=result.get("tokens_used"),
            response_time_ms=result.get("response_time_ms")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando respuesta: {str(e)}")


@router.get("/history/{session_id}", response_model=List[MessageDetail])
async def get_conversation_history(
    session_id: str,
    limit: int = 20,
    chat_service: ChatService = Depends(get_chat_service)
) -> List[MessageDetail]:
    """Obtener historial de conversación"""
    
    try:
        history = await chat_service.get_conversation_history(session_id, limit)
        
        messages = []
        for msg in history:
            messages.append(MessageDetail(
                id=msg["id"],
                role=msg["role"],
                content=msg["content"],
                timestamp=msg["timestamp"],
                tokens_used=msg.get("tokens_used"),
                response_time_ms=msg.get("response_time_ms")
            ))
        
        return messages
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo historial: {str(e)}")


@router.get("/analytics")
async def get_chat_analytics(
    session_id: Optional[str] = None,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Obtener analíticas de chat"""
    
    try:
        analytics = await chat_service.get_chat_analytics(session_id)
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo analíticas: {str(e)}")


@router.post("/model/switch")
async def switch_model(
    model_id: str,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Cambiar modelo de chat (para usar modelos fine-tuned)"""
    
    try:
        success = await chat_service.set_fine_tuned_model(model_id)
        
        if success:
            return {
                "success": True,
                "message": f"Modelo cambiado a {model_id}",
                "current_model": model_id
            }
        else:
            raise HTTPException(status_code=400, detail="Modelo no disponible")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cambiando modelo: {str(e)}")


@router.get("/models")
async def list_available_models(
    chat_service: ChatService = Depends(get_chat_service)
):
    """Listar modelos disponibles"""
    
    try:
        # Modelos base disponibles
        base_models = [
            "gpt-4o-mini",
            "gpt-3.5-turbo",
            "gpt-3.5-turbo-1106",
            "gpt-4",
            "gpt-4-1106-preview"
        ]
        
        return {
            "current_model": chat_service.current_model,
            "base_models": base_models,
            "fine_tuned_models": []  # Se llenará con modelos fine-tuned localmente
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listando modelos: {str(e)}")


@router.post("/feedback")
async def submit_feedback(
    run_id: str,
    feedback_score: float,
    feedback_comment: str = "",
    chat_service: ChatService = Depends(get_chat_service)
):
    """Enviar feedback a LangSmith"""
    
    try:
        success = await chat_service.log_feedback(run_id, feedback_score, feedback_comment)
        
        if success:
            return {
                "success": True,
                "message": "Feedback enviado exitosamente"
            }
        else:
            raise HTTPException(status_code=400, detail="No se pudo enviar el feedback")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error enviando feedback: {str(e)}")


@router.get("/langsmith-analytics")
async def get_langsmith_analytics(
    project_name: Optional[str] = None,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Obtener analíticas desde LangSmith"""
    
    try:
        analytics = await chat_service.get_langsmith_analytics(project_name)
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo analíticas: {str(e)}")


@router.post("/create-dataset")
async def create_langsmith_dataset(
    dataset_name: str,
    session_ids: Optional[List[str]] = None,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Crear un dataset en LangSmith a partir de conversaciones"""
    
    try:
        # Obtener conversaciones de la base de datos local
        conversations = []
        
        if session_ids:
            for session_id in session_ids:
                history = await chat_service.get_conversation_history(session_id)
                for i in range(0, len(history), 2):  # Tomar pares user-assistant
                    if i + 1 < len(history):
                        user_msg = history[i]
                        assistant_msg = history[i + 1]
                        
                        if user_msg["role"] == "user" and assistant_msg["role"] == "assistant":
                            conversations.append({
                                "user_message": user_msg["content"],
                                "assistant_response": assistant_msg["content"],
                                "session_id": session_id,
                                "timestamp": user_msg["timestamp"],
                                "model": "unknown"
                            })
        
        if not conversations:
            raise HTTPException(status_code=400, detail="No se encontraron conversaciones válidas")
        
        success = await chat_service.create_langsmith_dataset(dataset_name, conversations)
        
        if success:
            return {
                "success": True,
                "message": f"Dataset '{dataset_name}' creado con {len(conversations)} ejemplos"
            }
        else:
            raise HTTPException(status_code=400, detail="No se pudo crear el dataset")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creando dataset: {str(e)}")


@router.post("/test")
async def test_chat():
    """Endpoint de prueba para verificar conectividad"""
    
    return {
        "status": "ok",
        "message": "Chat API funcionando correctamente",
        "timestamp": datetime.now(),
        "config": {
            "max_conversation_history": settings.MAX_CONVERSATION_HISTORY,
            "langsmith_enabled": settings.LANGCHAIN_TRACING_V2,
            "langsmith_project": settings.LANGCHAIN_PROJECT if settings.LANGCHAIN_TRACING_V2 else None
        }
    }
