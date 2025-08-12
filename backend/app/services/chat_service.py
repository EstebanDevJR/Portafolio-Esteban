import openai
from typing import List, Dict, Any, Optional
import time
import json
from datetime import datetime
from loguru import logger

from app.core.config import settings
from app.services.prompt_service import prompt_service
from app.models.conversation import Conversation, Message
from app.core.database import get_db
from langchain_core.runnables import RunnableLambda
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from app.schemas.chat import ChatMessage, MessageRole


class ChatService:
    """Servicio principal para el chatbot especializado"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.current_model = settings.FINE_TUNING_MODEL  # Modelo por defecto
    
    async def generate_response(
        self,
        message: str,
        session_id: str,
        conversation_history: Optional[List[ChatMessage]] = None,
        user_id: Optional[str] = None,

        temperature: float = 0.7,
        model_override: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generar respuesta del chatbot usando prompt especializado"""
        
        start_time = time.time()
        
        try:
            # Preparar historial de conversación
            history = []
            if conversation_history:
                history = [
                    {"role": msg.role.value, "content": msg.content} 
                    for msg in conversation_history[-settings.MAX_CONVERSATION_HISTORY:]
                ]
            

            prompt_messages = await self._build_chat_prompt(message, history)
            
            # Generar respuesta con LangChain runnables (pipeline simple)
            model_to_use = model_override or self.current_model
            llm = ChatOpenAI(model=model_to_use, temperature=temperature, api_key=settings.OPENAI_API_KEY).bind(max_tokens=1000)

            def to_chat_messages(msgs: List[Dict[str, str]]):
                lc_msgs = []
                for m in msgs:
                    role = m.get("role")
                    content = m.get("content", "")
                    if role == "system":
                        lc_msgs.append(SystemMessage(content=content))
                    elif role == "assistant":
                        lc_msgs.append(AIMessage(content=content))
                    else:
                        lc_msgs.append(HumanMessage(content=content))
                return lc_msgs

            pipeline = RunnableLambda(to_chat_messages) | llm
            lc_output = pipeline.invoke(prompt_messages)
            response = {
                "content": lc_output.content,
                "tokens_used": None,
                "model": model_to_use,
            }
            
            # Calcular tiempo de respuesta
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Guardar conversación en base de datos
            await self._save_conversation(
                session_id=session_id,
                user_message=message,
                assistant_response=response["content"],
                user_id=user_id,

                tokens_used=response.get("tokens_used"),
                response_time_ms=response_time_ms
            )
            
            # Preparar respuesta
            result = {
                "response": response["content"],
                "session_id": session_id,
                "timestamp": datetime.now(),
                "rag_sources": [],
                "tokens_used": response.get("tokens_used"),
                "response_time_ms": response_time_ms,
                "model_used": model_to_use,
                "rag_enabled": False
            }
            
            logger.info(f"Respuesta generada en {response_time_ms}ms para sesión {session_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error generando respuesta: {e}")
            raise
    
    async def _build_chat_prompt(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> List[Dict[str, str]]:
        """Construir prompt para el chat"""
        
        messages = []

        # Prompt del sistema generado desde PromptService con toda la info de Esteban
        system_prompt = prompt_service.get_system_prompt()
        messages.append({"role": "system", "content": system_prompt})
        
        # Agregar historial de conversación (si viene de la request)
        if conversation_history:
            messages.extend(conversation_history)

        # Agregar mensaje actual del usuario (sin duplicar historial en el contenido)
        messages.append({"role": "user", "content": user_message})
        
        return messages
    
    # Método OpenAI directo removido: usamos pipeline con LangChain
    
    async def _save_conversation(
        self,
        session_id: str,
        user_message: str,
        assistant_response: str,
        user_id: Optional[str] = None,
        tokens_used: Optional[int] = None,
        response_time_ms: Optional[int] = None
    ):
        """Guardar conversación en SQLite local"""
        
        try:
            db = next(get_db())
            
            # Buscar o crear conversación
            conversation = db.query(Conversation).filter(
                Conversation.session_id == session_id
            ).first()
            
            if not conversation:
                conversation = Conversation(
                    session_id=session_id,
                    user_id=user_id,
                    is_active=True
                )
                db.add(conversation)
                db.flush()
            
            # Guardar mensaje del usuario
            user_msg = Message(
                conversation_id=conversation.id,
                role="user",
                content=user_message,
                timestamp=datetime.now()
            )
            db.add(user_msg)
            
            # Guardar respuesta del asistente
            assistant_msg = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=assistant_response,
                tokens_used=tokens_used,
                response_time_ms=response_time_ms,
                timestamp=datetime.now()
            )
            db.add(assistant_msg)
            
            db.commit()
            
        except Exception as e:
            logger.error(f"Error guardando conversación: {e}")
            db.rollback()
        finally:
            db.close()
    
    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Obtener historial de conversación desde SQLite"""
        
        try:
            db = next(get_db())
            
            conversation = db.query(Conversation).filter(
                Conversation.session_id == session_id
            ).first()
            
            if not conversation:
                return []
            
            messages = db.query(Message).filter(
                Message.conversation_id == conversation.id
            ).order_by(Message.timestamp.desc()).limit(limit).all()
            
            history = []
            for msg in reversed(messages):  # Orden cronológico
                history.append({
                    "id": msg.id,
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp,
                    "tokens_used": msg.tokens_used,
                    "response_time_ms": msg.response_time_ms
                })
            
            return history
            
        except Exception as e:
            logger.error(f"Error obteniendo historial: {e}")
            return []
        finally:
            db.close()
    
    async def set_fine_tuned_model(self, model_id: str) -> bool:
        """Cambiar a un modelo fine-tuned específico"""
        
        try:
            # Verificar que el modelo existe
            models = self.client.models.list()
            available_models = [model.id for model in models.data]
            
            if model_id in available_models:
                self.current_model = model_id
                logger.info(f"Modelo cambiado a: {model_id}")
                return True
            else:
                logger.warning(f"Modelo {model_id} no disponible")
                return False
                
        except Exception as e:
            logger.error(f"Error cambiando modelo: {e}")
            return False
    
    async def get_chat_analytics(self, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Obtener analíticas de chat desde SQLite"""
        
        try:
            db = next(get_db())
            
            # Consultas base
            conversations_query = db.query(Conversation)
            messages_query = db.query(Message)
            
            if session_id:
                conversation = conversations_query.filter(
                    Conversation.session_id == session_id
                ).first()
                if conversation:
                    messages_query = messages_query.filter(
                        Message.conversation_id == conversation.id
                    )
                else:
                    return {}
            
            # Estadísticas básicas
            total_conversations = conversations_query.count()
            total_messages = messages_query.count()
            
            # Estadísticas de mensajes
            assistant_messages = messages_query.filter(Message.role == "assistant").all()
            
            if assistant_messages:
                avg_response_time = sum(
                    msg.response_time_ms for msg in assistant_messages 
                    if msg.response_time_ms
                ) / len([msg for msg in assistant_messages if msg.response_time_ms])
                
                total_tokens = sum(
                    msg.tokens_used for msg in assistant_messages 
                    if msg.tokens_used
                )
            else:
                avg_response_time = 0
                total_tokens = 0
            
            analytics = {
                "total_conversations": total_conversations,
                "total_messages": total_messages,
                "avg_response_time_ms": avg_response_time,
                "total_tokens_used": total_tokens,
                "current_model": self.current_model
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error obteniendo analíticas: {e}")
            return {"current_model": self.current_model}
        finally:
            db.close()
