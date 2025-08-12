from fastapi import APIRouter
from typing import Dict, Any
from datetime import datetime

from app.core.config import settings
# Pinecone removido del health check

router = APIRouter()


@router.get("/")
async def health_check() -> Dict[str, Any]:
    """Health check básico"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "service": "Portfolio Chatbot API"
    }


@router.get("/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Health check detallado con verificación de servicios"""
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0",
        "services": {}
    }
    
    # Pinecone removido del health check
    
    # Verificar configuración
    config_status = {
        "openai_configured": bool(settings.OPENAI_API_KEY),
        "pinecone_configured": False,
        "database_configured": bool(settings.DATABASE_URL),
    }
    
    health_status["services"]["configuration"] = {
        "status": "healthy" if all(config_status.values()) else "unhealthy",
        "details": config_status
    }
    
    return health_status


@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    """Métricas básicas del sistema"""
    
    try:
        return {
            "timestamp": datetime.now(),
            "pinecone": {"status": "disabled"},
            "configuration": {
                "max_rag_results": 0,
                "similarity_threshold": 0,
                "embedding_model": settings.EMBEDDING_MODEL,
                "fine_tuning_model": settings.FINE_TUNING_MODEL
            }
        }
    except Exception as e:
        return {
            "timestamp": datetime.now(),
            "error": str(e),
            "status": "error"
        }
