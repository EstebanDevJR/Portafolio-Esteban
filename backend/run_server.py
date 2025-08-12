#!/usr/bin/env python3
"""
Script para ejecutar el servidor de desarrollo
"""

import uvicorn
import sys
import os
from pathlib import Path

# Agregar el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from app.core.config import settings

if __name__ == "__main__":
    # Verificar variables de entorno críticas usando settings
    missing_vars = []
    if not settings.OPENAI_API_KEY:
        missing_vars.append("OPENAI_API_KEY")
    
    if missing_vars:
        print(f"❌ Variables de entorno faltantes: {missing_vars}")
        print("Por favor configura el archivo .env")
        sys.exit(1)
    
    print("🚀 Iniciando Portfolio Chatbot Backend...")
    print(f"📍 Host: {settings.HOST}:{settings.PORT}")
    print(f"🔧 Debug: {settings.DEBUG}")
    print(f"🗄️ Base de datos: SQLite local")
    print(f"🤖 Modelo: {settings.FINE_TUNING_MODEL}")
    
    import os
    port = int(os.environ.get("PORT", settings.PORT))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # Necesario para deploy
        port=port,
        reload=False,  # No reload en producción
        log_level="info",
        access_log=True
    )
