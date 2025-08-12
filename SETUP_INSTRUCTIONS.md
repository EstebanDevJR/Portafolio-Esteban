# 🚀 Instrucciones de Instalación - Portfolio Chatbot

Este documento te guiará paso a paso para configurar el backend del chatbot especializado con RAG y fine-tuning.

## 📋 Requisitos Previos

### 1. Cuentas de API Necesarias

**OpenAI** (Obligatorio)
- Crear cuenta en [OpenAI](https://platform.openai.com/)
- Obtener API key desde el dashboard
- Tener créditos disponibles para embeddings y fine-tuning

**Pinecone** (Obligatorio)
- Crear cuenta en [Pinecone](https://www.pinecone.io/)
- Crear un nuevo proyecto
- Obtener API key y environment name

### 2. Software Requerido
- Python 3.9 o superior
- Git
- PostgreSQL (opcional, por defecto usa SQLite)

## 🛠️ Instalación Paso a Paso

### 1. Configurar el Backend

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

```bash
# 1. Copiar archivo de ejemplo
cp env.example .env

# 2. Editar .env con tus credenciales
```

**Contenido del archivo `.env`:**
```env
# === CONFIGURACIÓN OBLIGATORIA ===
OPENAI_API_KEY=sk-tu-clave-openai-aqui
PINECONE_API_KEY=tu-clave-pinecone-aqui
PINECONE_ENVIRONMENT=us-east-1-aws  # O tu región de Pinecone
PINECONE_INDEX_NAME=portfolio-chatbot

# === CONFIGURACIÓN OPCIONAL ===
HOST=0.0.0.0
PORT=8000
DEBUG=True
DATABASE_URL=sqlite:///./portfolio_chatbot.db

# Para PostgreSQL (opcional):
# DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_chatbot

EMBEDDING_MODEL=text-embedding-ada-002
FINE_TUNING_MODEL=gpt-4o-mini
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]
```

### 3. Configurar Base de Datos y Datos Iniciales

```bash
# 1. Ejecutar script de configuración automática
python scripts/setup_database.py
```

Este script:
- ✅ Inicializa la base de datos
- ✅ Crea el índice en Pinecone
- ✅ Carga conocimientos de ejemplo sobre María
- ✅ Carga datos de entrenamiento de ejemplo
- ✅ Verifica que todo funcione correctamente

### 4. Iniciar el Servidor

```bash
# Opción 1: Usando el script personalizado (recomendado)
python run_server.py

# Opción 2: Usando uvicorn directamente
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Verificar Instalación

Abre tu navegador y ve a:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health/detailed

Deberías ver:
```json
{
  "status": "healthy",
  "services": {
    "pinecone": {"status": "healthy"},
    "configuration": {"status": "healthy"}
  }
}
```

## 🔧 Configurar Frontend

### 1. Agregar Variable de Entorno al Frontend

En tu archivo `frontend/.env.local`:
```env
BACKEND_URL=http://localhost:8000
```

### 2. El Frontend Ya Está Conectado

El archivo `frontend/app/api/chat-specialized/route.ts` ya está actualizado para conectarse automáticamente con tu backend.

## 🎯 Probar el Sistema

### 1. Probar Chat Básico

```bash
curl -X POST "http://localhost:8000/chat/" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cuál es la experiencia de María en IA?",
    "use_rag": true
  }'
```

### 2. Probar desde el Frontend

1. Inicia tu frontend Next.js: `npm run dev`
2. Ve a la sección de chat
3. Haz una pregunta sobre María
4. Deberías recibir una respuesta detallada usando RAG

### 3. Verificar RAG

```bash
# Buscar conocimientos
curl -X POST "http://localhost:8000/admin/knowledge/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "experiencia IA generativa",
    "limit": 3
  }'
```

## 🚀 Fine-tuning (Opcional)

### 1. Verificar Datos de Entrenamiento

```bash
curl "http://localhost:8000/admin/training-data?validated_only=true"
```

### 2. Iniciar Fine-tuning

```bash
curl -X POST "http://localhost:8000/admin/fine-tuning/start" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "gpt-4o-mini",
    "validation_split": 0.2
  }'
```

### 3. Monitorear Progreso

```bash
# Reemplaza JOB_ID con el ID recibido
curl "http://localhost:8000/admin/fine-tuning/jobs/JOB_ID"
```

## 📊 Panel de Administración

### Agregar Conocimientos

```bash
curl -X POST "http://localhost:8000/admin/knowledge" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Nueva habilidad de María",
    "content": "Descripción detallada...",
    "category": "habilidades",
    "tags": ["python", "ai"],
    "priority": 8
  }'
```

### Importar Conocimientos en Lote

```bash
curl -X POST "http://localhost:8000/admin/knowledge/import" \
  -F "file=@data/sample_knowledge.json"
```

### Ver Estadísticas

```bash
curl "http://localhost:8000/admin/stats"
```

## 🔍 Solución de Problemas

### Error: "Pinecone not initialized"

**Causa**: Credenciales incorrectas o región errónea
**Solución**:
1. Verifica tu `PINECONE_API_KEY`
2. Confirma tu `PINECONE_ENVIRONMENT` en el dashboard de Pinecone
3. Reinicia el servidor

### Error: "OpenAI API key not found"

**Causa**: API key no configurada o inválida
**Solución**:
1. Verifica tu `OPENAI_API_KEY` en `.env`
2. Confirma que la key es válida en OpenAI dashboard
3. Verifica que tienes créditos disponibles

### Error: "Database connection failed"

**Causa**: Problema con la base de datos
**Solución**:
1. Para SQLite: Verifica permisos de escritura
2. Para PostgreSQL: Verifica que esté ejecutándose y la URL sea correcta
3. Ejecuta `python scripts/setup_database.py` nuevamente

### El Chat No Responde

**Causa**: Backend no conectado o error en el frontend
**Solución**:
1. Verifica que el backend esté ejecutándose en puerto 8000
2. Confirma que `BACKEND_URL` esté configurado en el frontend
3. Revisa la consola del navegador por errores

## 📈 Optimización y Personalización

### Ajustar RAG

En `backend/app/core/config.py`:
```python
MAX_RAG_RESULTS = 5  # Número de resultados a recuperar
SIMILARITY_THRESHOLD = 0.7  # Umbral de similitud (0-1)
```

### Personalizar Prompts

Edita `backend/app/services/rag_service.py` en el método `create_rag_prompt()`.

### Agregar Más Conocimientos

1. Edita `backend/data/sample_knowledge.json`
2. Ejecuta: `python scripts/setup_database.py`

### Configurar Fine-tuning

1. Agrega más datos en `backend/data/sample_training_data.json`
2. Ejecuta el proceso de fine-tuning
3. Cambia el modelo en el chat: `POST /chat/model/switch`

## 🎉 ¡Listo!

Tu chatbot especializado ya está funcionando con:
- ✅ RAG usando Pinecone para respuestas precisas
- ✅ Base de conocimientos sobre María
- ✅ Capacidad de fine-tuning
- ✅ APIs completas para administración
- ✅ Integración con el frontend

### Próximos Pasos

1. **Personalizar conocimientos**: Agrega información específica sobre tu experiencia
2. **Entrenar modelo**: Usa fine-tuning para respuestas más específicas
3. **Monitorear uso**: Revisa analíticas en `/chat/analytics`
4. **Escalar**: Considera PostgreSQL y deployment en cloud

¿Necesitas ayuda? Revisa los logs del servidor o crea un issue en GitHub.

---

**¡Disfruta tu nuevo chatbot especializado! 🤖✨**
