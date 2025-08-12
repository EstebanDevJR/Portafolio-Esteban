# Portfolio Chatbot Backend

Backend especializado para chatbot de portafolio con RAG (Retrieval-Augmented Generation) usando Pinecone y fine-tuning

## 🚀 Características

- **FastAPI** - Framework moderno y rápido para APIs
- **RAG con Pinecone** - Búsqueda semántica y recuperación de información
- **Fine-tuning** - Personalización de modelos con datos específicos
- **Base de conocimientos** - Gestión de información especializada
- **Conversaciones persistentes** - Historial y contexto de chat
- **APIs administrativas** - Gestión completa del sistema

## 📋 Requisitos

- Python 3.9+
- PostgreSQL (opcional, por defecto usa SQLite)
- Cuentas de API:
  - OpenAI
  - Pinecone

## 🛠️ Instalación

1. **Clonar y navegar al directorio**
   ```bash
   cd backend
   ```

2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # o
   venv\Scripts\activate  # Windows
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` con tus claves de API:
   ```env
   OPENAI_API_KEY=tu_clave_openai
   PINECONE_API_KEY=tu_clave_pinecone
   PINECONE_ENVIRONMENT=tu_entorno_pinecone
   ```

5. **Inicializar base de datos**
   ```bash
   python -c "from app.core.database import init_db; import asyncio; asyncio.run(init_db())"
   ```

6. **Ejecutar servidor**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 Uso

### Endpoints Principales

#### Chat
- `POST /chat/` - Enviar mensaje al chatbot
- `GET /chat/history/{session_id}` - Obtener historial de conversación
- `GET /chat/analytics` - Analíticas de chat

#### Administración
- `POST /admin/knowledge` - Crear entrada de conocimiento
- `GET /admin/knowledge` - Listar conocimientos
- `POST /admin/training-data` - Crear datos de entrenamiento
- `POST /admin/fine-tuning/start` - Iniciar fine-tuning

#### Health Check
- `GET /health/` - Estado básico
- `GET /health/detailed` - Estado detallado con servicios

### Ejemplo de uso del chat

```python
import requests

# Enviar mensaje
response = requests.post("http://localhost:8000/chat/", json={
    "message": "¿Cuál es la experiencia de María en IA?",
    "use_rag": True,
    "temperature": 0.7
})

print(response.json())
```

## 📊 Cargar Datos de Ejemplo

### Cargar base de conocimientos
```bash
curl -X POST "http://localhost:8000/admin/knowledge/import" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data/sample_knowledge.json"
```

### Cargar datos de entrenamiento
```python
import json
import requests

# Cargar datos de ejemplo
with open('data/sample_training_data.json') as f:
    training_data = json.load(f)

# Enviar en lote
response = requests.post("http://localhost:8000/admin/training-data/batch", json={
    "data": training_data
})
```

## 🎯 Fine-tuning

### 1. Preparar datos
Los datos de entrenamiento deben seguir el formato prompt-answer:

```json
{
  "prompt": "¿Pregunta sobre María?",
  "completion": "Respuesta detallada y precisa",
  "category": "categoria_opcional"
}
```

### 2. Validar datos
```python
# Los datos se validan automáticamente al crearlos
# Verifica longitudes, estructura y calidad
```

### 3. Iniciar fine-tuning
```python
response = requests.post("http://localhost:8000/admin/fine-tuning/start", json={
    "model_name": "gpt-4o-mini",
    "validation_split": 0.2,
    "hyperparameters": {
        "n_epochs": 3,
        "batch_size": 1,
        "learning_rate_multiplier": 1.5
    }
})
```

### 4. Monitorear progreso
```python
job_id = response.json()["job_id"]

# Verificar estado
status = requests.get(f"http://localhost:8000/admin/fine-tuning/jobs/{job_id}")

# Ver eventos
events = requests.get(f"http://localhost:8000/admin/fine-tuning/jobs/{job_id}/events")
```

## 🔍 RAG (Retrieval-Augmented Generation)

### Funcionamiento
1. **Embeddings** - Convierte texto a vectores usando OpenAI
2. **Almacenamiento** - Guarda vectores en Pinecone
3. **Búsqueda** - Encuentra contenido similar semánticamente
4. **Generación** - Usa contexto recuperado para respuestas precisas

### Configuración
```python
# En app/core/config.py
MAX_RAG_RESULTS = 5
SIMILARITY_THRESHOLD = 0.7
EMBEDDING_MODEL = "text-embedding-ada-002"
```

### Optimización
- **Chunking inteligente** - Divide contenido optimalmente
- **Metadata enriquecida** - Categorías, tags, prioridades
- **Filtrado avanzado** - Búsquedas por categoría
- **Ranking combinado** - Similitud + coincidencias de palabras clave

## 📈 Monitoreo

### Métricas disponibles
- Tiempo de respuesta promedio
- Tokens utilizados
- Precisión de RAG
- Satisfacción del usuario
- Estadísticas de Pinecone

### Logs
```bash
# Los logs se muestran en consola durante desarrollo
# En producción, configurar loguru para archivos
```

## 🔧 Configuración Avanzada

### Base de datos
```python
# Para PostgreSQL
DATABASE_URL = "postgresql://user:pass@localhost/dbname"

# Para SQLite (desarrollo)
DATABASE_URL = "sqlite:///./portfolio_chatbot.db"
```

### Pinecone
```python
# Configurar índice
PINECONE_INDEX_NAME = "portfolio-chatbot"
EMBEDDING_DIMENSION = 1536  # Para text-embedding-ada-002
```

### Fine-tuning
```python
# Modelos soportados
FINE_TUNING_MODEL = "gpt-4o-mini"  # Recomendado por costo-eficiencia
# También: "gpt-3.5-turbo", "gpt-3.5-turbo-1106", "gpt-4o-mini-2024-07-18"
```

## 🚀 Despliegue en Producción

### Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Variables de entorno de producción
```env
DEBUG=False
DATABASE_URL=postgresql://...
SECRET_KEY=clave_segura_aleatoria
ALLOWED_ORIGINS=["https://tu-frontend.com"]
```

## 📝 API Documentation

Una vez ejecutado el servidor, la documentación interactiva está disponible en:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte y preguntas:
- Crear issue en GitHub
- Revisar documentación de API
- Verificar logs de aplicación

## 🔄 Actualizaciones

### v1.0.0
- ✅ RAG con Pinecone
- ✅ Fine-tuning automatizado
- ✅ APIs completas
- ✅ Gestión de conversaciones
- ✅ Base de conocimientos
- ✅ Documentación completa
