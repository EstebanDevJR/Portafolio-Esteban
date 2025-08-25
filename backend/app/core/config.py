from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Servidor
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Base de datos (solo para conversaciones)
    DATABASE_URL: str = "sqlite:///./portfolio_chatbot.db"
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # LangSmith
    LANGCHAIN_TRACING_V2: bool = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
    LANGCHAIN_API_KEY: str = os.getenv("LANGCHAIN_API_KEY", "")
    LANGCHAIN_PROJECT: str = os.getenv("LANGCHAIN_PROJECT", "portfolio")
    LANGCHAIN_ENDPOINT: str = os.getenv("LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com")
    
    # Fine-tuning (modelo entrenado)
    FINE_TUNING_MODEL: str = os.getenv("FINE_TUNING_MODEL", "gpt-4o-mini")  # Actualizar con tu modelo fine-tuned
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://*.vercel.app",  # Para cualquier dominio de Vercel
        "https://portafolio-esteban.vercel.app"  # Tu dominio específico
    ]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configuración del chatbot
    MAX_CONVERSATION_HISTORY: int = 10
    TEMPERATURE: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignorar variables extra del .env


# Instancia global de configuración
settings = Settings()
