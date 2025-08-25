import openai
from typing import List, Dict, Any, Optional
import time
import json
import os
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

# LangSmith imports
from langsmith import Client
from langchain_core.tracers import LangChainTracer
from langchain_core.callbacks import CallbackManager
from langchain_core.runnables import RunnableConfig


class ChatService:
    """Servicio principal para el chatbot especializado"""
    
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.current_model = settings.FINE_TUNING_MODEL  # Modelo por defecto
        
        # Configurar LangSmith
        self._setup_langsmith()
    
    def _setup_langsmith(self):
        """Configurar LangSmith para tracing y monitoring"""
        try:
            if settings.LANGCHAIN_TRACING_V2 and settings.LANGCHAIN_API_KEY:
                # Configurar variables de entorno para LangSmith
                os.environ["LANGCHAIN_TRACING_V2"] = "true"
                os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
                os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
                os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGCHAIN_ENDPOINT
                
                # Inicializar cliente de LangSmith
                self.langsmith_client = Client(
                    api_key=settings.LANGCHAIN_API_KEY,
                    api_url=settings.LANGCHAIN_ENDPOINT
                )
                
                # Configurar tracer
                self.tracer = LangChainTracer(
                    project_name=settings.LANGCHAIN_PROJECT,
                    client=self.langsmith_client
                )
                
                # Configurar callback manager
                self.callback_manager = CallbackManager([self.tracer])
                
                logger.info(f"LangSmith configurado exitosamente para proyecto: {settings.LANGCHAIN_PROJECT}")
            else:
                self.langsmith_client = None
                self.tracer = None
                self.callback_manager = None
                logger.info("LangSmith no está habilitado")
                
        except Exception as e:
            logger.warning(f"Error configurando LangSmith: {e}")
            self.langsmith_client = None
            self.tracer = None
            self.callback_manager = None
    
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
            

            # Usar el sistema de prompts optimizado
            prompt_config = prompt_service.get_optimized_prompt(message, history)
            template = prompt_config["template"]
            parser = prompt_config["parser"]
            variables = prompt_config["variables"]
            
            # Generar prompt messages usando el template optimizado
            prompt_messages = template.format_messages(**variables)
            
            # Generar respuesta con LangChain runnables (pipeline simple)
            model_to_use = model_override or self.current_model
            llm = ChatOpenAI(
                model=model_to_use, 
                temperature=temperature, 
                api_key=settings.OPENAI_API_KEY
            ).bind(max_tokens=1000)

            # Crear pipeline optimizado con parser
            chat_model = llm.with_config(
                {"run_name": f"chat_model_{model_to_use}"}
            )
            
            # Pipeline: template -> model -> parser
            pipeline = template | chat_model | parser
            
            # Configurar tracing si está disponible
            config = {}
            if self.callback_manager:
                config = RunnableConfig(
                    callbacks=self.callback_manager,
                    tags=[
                        "esteban-portfolio", 
                        "chatbot", 
                        f"model:{model_to_use}",
                        f"session:{session_id}"
                    ],
                    metadata={
                        "session_id": session_id,
                        "user_id": user_id or "anonymous",
                        "model": model_to_use,
                        "temperature": temperature,
                        "message_length": len(message),
                        "conversation_length": len(history) if history else 0
                    }
                )
            
            # Invocar pipeline con configuración de tracing
            lc_output = pipeline.invoke(variables, config=config)
            
            # Manejar diferentes tipos de respuesta (estructurada vs string)
            if isinstance(lc_output, str):
                content = lc_output
            else:
                # Si es una respuesta estructurada, convertir a string para compatibilidad
                content = str(lc_output) if lc_output else "No pude generar una respuesta."
            
            response = {
                "content": content,
                "tokens_used": None,
                "model": model_to_use,
                "intent": prompt_config.get("intent", "general"),
                "structured": not isinstance(lc_output, str)
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
    
    async def create_langsmith_dataset(self, dataset_name: str, conversations: List[Dict]) -> bool:
        """Crear un dataset en LangSmith a partir de conversaciones"""
        try:
            if not self.langsmith_client:
                logger.warning("LangSmith no está configurado")
                return False
            
            # Crear dataset
            dataset = self.langsmith_client.create_dataset(
                dataset_name=dataset_name,
                description=f"Conversaciones del chatbot de portafolio de Esteban - {datetime.now().isoformat()}"
            )
            
            # Agregar ejemplos al dataset
            examples = []
            for conv in conversations:
                examples.append({
                    "inputs": {"message": conv["user_message"]},
                    "outputs": {"response": conv["assistant_response"]},
                    "metadata": {
                        "session_id": conv.get("session_id"),
                        "timestamp": conv.get("timestamp"),
                        "model": conv.get("model", "unknown")
                    }
                })
            
            self.langsmith_client.create_examples(
                inputs=[ex["inputs"] for ex in examples],
                outputs=[ex["outputs"] for ex in examples],
                metadata=[ex["metadata"] for ex in examples],
                dataset_id=dataset.id
            )
            
            logger.info(f"Dataset '{dataset_name}' creado con {len(examples)} ejemplos")
            return True
            
        except Exception as e:
            logger.error(f"Error creando dataset en LangSmith: {e}")
            return False
    
    async def log_feedback(self, run_id: str, feedback_score: float, feedback_comment: str = "") -> bool:
        """Registrar feedback en LangSmith"""
        try:
            if not self.langsmith_client:
                logger.warning("LangSmith no está configurado")
                return False
            
            self.langsmith_client.create_feedback(
                run_id=run_id,
                key="user_satisfaction",
                score=feedback_score,
                comment=feedback_comment
            )
            
            logger.info(f"Feedback registrado para run {run_id}: {feedback_score}")
            return True
            
        except Exception as e:
            logger.error(f"Error registrando feedback: {e}")
            return False
    
    async def get_langsmith_analytics(self, project_name: str = None) -> Dict[str, Any]:
        """Obtener analíticas desde LangSmith"""
        try:
            if not self.langsmith_client:
                return {"error": "LangSmith no está configurado"}
            
            project_name = project_name or settings.LANGCHAIN_PROJECT
            
            # Obtener runs del proyecto
            runs = list(self.langsmith_client.list_runs(
                project_name=project_name,
                limit=100
            ))
            
            if not runs:
                return {"message": "No hay runs disponibles"}
            
            # Calcular métricas
            total_runs = len(runs)
            successful_runs = len([r for r in runs if r.status == "success"])
            failed_runs = len([r for r in runs if r.status == "error"])
            
            # Tiempos de respuesta
            execution_times = [r.execution_order for r in runs if r.execution_order]
            avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
            
            # Tokens utilizados (si están disponibles)
            total_tokens = sum([
                r.extra.get("usage", {}).get("total_tokens", 0) 
                for r in runs if r.extra and "usage" in r.extra
            ])
            
            analytics = {
                "project_name": project_name,
                "total_runs": total_runs,
                "successful_runs": successful_runs,
                "failed_runs": failed_runs,
                "success_rate": (successful_runs / total_runs * 100) if total_runs > 0 else 0,
                "avg_execution_time_ms": avg_execution_time,
                "total_tokens_used": total_tokens,
                "last_updated": datetime.now().isoformat()
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error obteniendo analíticas de LangSmith: {e}")
            return {"error": str(e)}

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
