from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.routes import chat, health
from app.core.database import init_db
from loguru import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    logger.info("Iniciando aplicación...")
    
    # Inicializar base de datos SQLite para conversaciones
    await init_db()
    
    
    logger.info("Aplicación iniciada correctamente")
    
    yield
    
    # Shutdown
    logger.info("Cerrando aplicación...")


# Crear aplicación FastAPI
app = FastAPI(
    title="Portfolio Chatbot API",
    description="API especializada para chatbot de portafolio con fine-tuning",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
# Sección admin deshabilitada (no se requiere)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Manejador global de excepciones"""
    logger.error(f"Error no manejado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor"}
    )


@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Portfolio Chatbot API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
