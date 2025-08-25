"""
Servicio de prompts optimizado para el chatbot de portafolio usando LangChain
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from langchain_core.prompts import (
    ChatPromptTemplate, 
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
    MessagesPlaceholder,
    FewShotChatMessagePromptTemplate
)
from langchain_core.output_parsers import StrOutputParser, PydanticOutputParser
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings
from pydantic import BaseModel, Field
import os

# Modelos para respuestas estructuradas
class ProjectInfo(BaseModel):
    """Información estructurada de un proyecto"""
    name: str = Field(description="Nombre del proyecto")
    description: str = Field(description="Descripción del proyecto")
    technologies: List[str] = Field(description="Tecnologías utilizadas")
    status: str = Field(description="Estado actual del proyecto")
    progress_percentage: Optional[int] = Field(description="Porcentaje de progreso")

class SkillAssessment(BaseModel):
    """Evaluación de habilidades"""
    skill: str = Field(description="Nombre de la habilidad")
    level: str = Field(description="Nivel de la habilidad")
    experience_months: Optional[int] = Field(description="Meses de experiencia")
    description: str = Field(description="Descripción de la experiencia")

class ContactResponse(BaseModel):
    """Respuesta de contacto estructurada"""
    message: str = Field(description="Mensaje de respuesta")
    email: str = Field(description="Email de contacto")
    github: Optional[str] = Field(description="URL de GitHub")
    linkedin: Optional[str] = Field(description="URL de LinkedIn")

class PromptService:
    """Servicio optimizado para generar prompts contextualizados con LangChain"""
    
    def __init__(self):
        self.knowledge_base = self._load_knowledge_base()
        
        # Configurar embeddings para few-shot examples
        self._setup_embeddings()
        
        # Output parsers (inicializar primero)
        self.project_parser = PydanticOutputParser(pydantic_object=ProjectInfo)
        self.skill_parser = PydanticOutputParser(pydantic_object=SkillAssessment)
        self.contact_parser = PydanticOutputParser(pydantic_object=ContactResponse)
        
        # Crear templates de prompts optimizados (después de los parsers)
        self.chat_template = self._create_chat_template()
        self.project_template = self._create_project_template()
        self.skills_template = self._create_skills_template()
        self.contact_template = self._create_contact_template()
        
        # Configurar few-shot examples
        self.few_shot_examples = self._create_few_shot_examples()
        self.example_selector = self._create_example_selector()
        
    def _setup_embeddings(self):
        """Configurar embeddings para selección de ejemplos"""
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.embeddings = OpenAIEmbeddings(api_key=api_key)
            else:
                self.embeddings = None
                print("Warning: OpenAI API key not found, few-shot examples disabled")
        except Exception as e:
            print(f"Warning: Could not initialize embeddings: {e}")
            self.embeddings = None
    
    def _load_knowledge_base(self) -> str:
        """Cargar toda la información del portafolio"""
        return """
# INFORMACIÓN PERSONAL Y PROFESIONAL DE ESTEBAN ORTIZ

## PERFIL PERSONAL
- **Nombre**: Esteban Ortiz
- **Rol**: Junior AI Developer
- **Ubicación**: Pereira, Colombia
- **Descripción**: Apasionado por la IA generativa, explorando los límites entre creatividad y tecnología
- **Características**: Curioso, autodidacta, innovador, persistente
- **Email**: esteban.ortiz.dev@gmail.com
- **GitHub**: https://github.com/EstebanDevJR
- **LinkedIn**: https://www.linkedin.com/in/esteban-ortiz-restrepo
- **Instagram**: @esteban_ortiz_0

## FORMACIÓN ACADÉMICA
- **2023 - Actualidad**: Tecnología en Desarrollo de Software - Universidad Tecnológica de Pereira
- **2021 - 2022**: Técnico en Asesoría Comercial - SENA

## CURSOS ACTUALES
- **Enero 2025 - Actualidad**: LLM Engineering: Master AI, Language Models, and Agents
- **Febrero 2025 - Actualidad**: Bootcamp 2025 Generative AI, LLM Apps, AI Agents, AI Cursor

## STACK TECNOLÓGICO

### Lenguajes de Programación
- **Python**: Intermedio (8 meses de experiencia) - Especialidad en IA/ML
- **Java**: Básico
- **JavaScript**: Básico (4 meses)
- **TypeScript**: Básico (4 meses)
- **HTML/CSS**: Básico

### IA y Machine Learning
- **OpenAI API**: Intermedio (8 meses)
- **LangChain**: Aprendiendo (6 meses)
- **HuggingFace**: Intermedio
- **MCP (Model Context Protocol)**: Básico
- **AWS Bedrock**: Aprendiendo
- **AWS SageMaker**: Aprendiendo
- **Fine-tuning**: Aprendiendo (5 meses)
- **RAG**: Aprendiendo (5 meses)
- **Sentence Transformers**: Intermedio

### Bases de Datos
- **PostgreSQL**: Intermedio
- **Bases de datos vectoriales**: FAISS, ChromaDB, Pinecone (5 meses)
- **Supabase**: Intermedio

### Frameworks y Herramientas
- **FastAPI**: Aprendiendo (2 meses)
- **React**: Básico (4 meses)
- **Next.js**: Básico
- **Streamlit**: Intermedio
- **Gradio**: Intermedio
- **Node.js**: Básico (4 meses)

### Cloud y DevOps
- **AWS**: Aprendiendo (2 meses) - Textract, Bedrock, SageMaker
- **Azure**: Aprendiendo (1 mes)
- **Docker**: Básico

### Otros
- **Git/GitHub**: Intermedio
- **n8n**: Básico (automatización)
- **ElevenLabs**: Síntesis de voz
- **Pandas**: Análisis de datos
- **PyPDF2**: Procesamiento de documentos

## PROYECTOS

### 1. LegalGPT (En desarrollo - 50%)
**Descripción**: Asesor legal automatizado para PYMEs colombianas que no comprenden contratos, leyes laborales o tributarias.
**Tecnologías**: Python, React, OpenAI, Fine-tuning, RAG, LangChain, Pinecone, FastAPI, Supabase, TypeScript
**Estado**: En desarrollo activo
**Impacto**: Democratizar acceso a asesoría legal para pequeñas empresas

### 2. ATS Inteligente (En desarrollo - 10%)
**Descripción**: Sistema de seguimiento de candidatos con agentes de IA para procesamiento de CVs, clasificación de candidatos y asistencia de RRHH.
**Tecnologías**: Python, Streamlit, OpenAI, Fine-tuning, RAG, LangChain, Pinecone, FastAPI, Supabase, n8n workflow, WhatsApp bot, sistema multiagente, notificaciones email
**Estado**: Desarrollo inicial
**Características**: Multiagente, integración WhatsApp, automatización completa

### 3. CV Analyzer (Completado - 100%)
**Descripción**: Analizador inteligente de currículums que usa RAG y fine-tuning para análisis detallados, recomendaciones de trabajo y hojas de ruta profesionales.
**Tecnologías**: Python, Streamlit, OpenAI, Fine-tuning, RAG, LangChain, ChromaDB, pandas, PyPDF2, AWS Textract
**Estado**: Completado y funcional
**Logros**: Sistema completo de análisis y recomendaciones

### 4. DocumentAssistant-AI (Completado - 100%)
**Descripción**: Asistente multimodal que analiza documentos (PDF, CSV, Excel) y mantiene conversaciones inteligentes con síntesis de voz.
**Tecnologías**: Python, Gradio, LangChain, OpenAI, AWS Textract, Pandas, ElevenLabs, PyPDF2
**Estado**: Completado
**Características**: Multimodal, síntesis de voz, procesamiento de múltiples formatos

### 5. LLM Conversational Demo (Completado - 100%)
**Descripción**: Aplicación que permite conversaciones entre múltiples modelos de IA (GPT-4o-mini, Claude, DeepSeek) con síntesis de voz usando ElevenLabs.
**Tecnologías**: Python, OpenAI, ElevenLabs, DeepSeek, Gradio
**Estado**: Completado
**Características**: Multi-modelo, síntesis de voz optimizada, división inteligente

## ESPECIALIZACIONES

### RAG (Retrieval-Augmented Generation)
- **Experiencia**: 5 meses implementando sistemas RAG
- **Tecnologías**: Embeddings, Pinecone, ChromaDB, FAISS
- **Aplicaciones**: Q&A empresariales, chatbots especializados, asistentes de documentación
- **Técnicas**: Chunking, retrieval optimization, similarity search

### Fine-tuning de Modelos
- **Experiencia**: 5 meses personalizando modelos de lenguaje
- **Modelos**: GPT-3.5, GPT-4o-mini
- **Aplicaciones**: LegalGPT (contexto legal colombiano), CV Analyzer, ATS
- **Técnicas**: Datasets de calidad, data augmentation, evaluación continua

### Desarrollo Multimodal
- **Experiencia**: Procesamiento de texto, imágenes y documentos
- **Herramientas**: AWS Textract, computer vision, OCR
- **Aplicaciones**: DocumentAssistant-AI, chatbot empresarial

## IDIOMAS
- **Español**: Nativo
- **Inglés**: Básico-Intermedio

## ENFOQUE DE APRENDIZAJE
- **Metodología**: Autodidacta con enfoque práctico
- **Dedicación**: 2 horas diarias de estudio
- **Filosofía**: "Aprender haciendo" - todos los proyectos tienen aplicaciones reales
- **Enfoque actual**: Construir aplicaciones potenciadas por LLMs

## OBJETIVOS Y MOTIVACIONES
- Explorar los límites entre creatividad y tecnología
- Resolver problemas reales con impacto social (especialmente para el mercado colombiano/latinoamericano)
- Democratizar acceso a herramientas inteligentes
- Crear soluciones de IA que generen valor real en entornos empresariales

## DISPONIBILIDAD
- Abierto a colaboraciones y nuevas oportunidades
- Interesado en proyectos de IA generativa
- Disponible para trabajo remoto y presencial en Pereira, Colombia
- Enfoque en proyectos que combinen innovación técnica con aplicabilidad práctica
"""
    
    def _create_chat_template(self) -> ChatPromptTemplate:
        """Crear template principal de chat optimizado"""
        system_template = f"""Eres un asistente de IA especializado en representar a Esteban Ortiz, un Junior AI Developer de Pereira, Colombia.

## INFORMACIÓN COMPLETA SOBRE ESTEBAN:
{self.knowledge_base}

## INSTRUCCIONES DE COMPORTAMIENTO:
- Sé amigable, profesional y entusiasta
- Refleja su personalidad: curioso, autodidacta, innovador y persistente
- Responde SOLO con información de la base de conocimientos
- Usa **FORMATO MARKDOWN** para estructurar respuestas
- Enfatiza experiencia práctica y proyectos reales
- Menciona el contexto colombiano/latinoamericano cuando sea relevante

## CONTACTO (cuando sea relevante):
- Email: esteban.ortiz.dev@gmail.com
- GitHub: https://github.com/EstebanDevJR
- LinkedIn: https://www.linkedin.com/in/esteban-ortiz-restrepo

Responde en el idioma del usuario."""

        return ChatPromptTemplate.from_messages([
            ("system", system_template),
            MessagesPlaceholder(variable_name="few_shot_examples", optional=True),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("human", "{input}")
        ])

    def _create_project_template(self) -> ChatPromptTemplate:
        """Template específico para consultas sobre proyectos"""
        system_template = f"""Eres un experto en los proyectos de IA de Esteban Ortiz.

{self.knowledge_base}

Responde consultas sobre proyectos con información específica: nombre, descripción, tecnologías, estado y progreso.
Usa el formato estructurado que se te solicite.

{self.project_parser.get_format_instructions()}"""

        return ChatPromptTemplate.from_messages([
            ("system", system_template),
            ("human", "Información sobre el proyecto: {project_query}")
        ])

    def _create_skills_template(self) -> ChatPromptTemplate:
        """Template específico para consultas sobre habilidades"""
        system_template = f"""Eres un evaluador de las habilidades técnicas de Esteban Ortiz.

{self.knowledge_base}

Evalúa y describe habilidades específicas con nivel, experiencia y detalles.

{self.skill_parser.get_format_instructions()}"""

        return ChatPromptTemplate.from_messages([
            ("system", system_template),
            ("human", "Evalúa la habilidad: {skill_query}")
        ])

    def _create_contact_template(self) -> ChatPromptTemplate:
        """Template específico para información de contacto"""
        system_template = f"""Eres el asistente de contacto de Esteban Ortiz.

Información de contacto:
- Email: esteban.ortiz.dev@gmail.com
- GitHub: https://github.com/EstebanDevJR
- LinkedIn: https://www.linkedin.com/in/esteban-ortiz-restrepo
- Ubicación: Pereira, Colombia

{self.contact_parser.get_format_instructions()}"""

        return ChatPromptTemplate.from_messages([
            ("system", system_template),
            ("human", "Consulta de contacto: {contact_query}")
        ])

    def get_chat_template(self) -> ChatPromptTemplate:
        """Obtener el template principal de chat"""
        return self.chat_template
    
    def _create_few_shot_examples(self) -> List[Dict[str, str]]:
        """Crear ejemplos few-shot para mejorar respuestas"""
        return [
            {
                "input": "¿Qué proyectos has desarrollado?",
                "output": """## Proyectos Principales de Esteban

### 🤖 **LegalGPT** (En desarrollo - 50%)
Asesor legal automatizado para PYMEs colombianas que automatiza la comprensión de contratos y leyes.
- **Tecnologías**: Python, React, OpenAI, Fine-tuning, RAG, LangChain, Pinecone, FastAPI
- **Impacto**: Democratizar acceso a asesoría legal para pequeñas empresas

### 📄 **CV Analyzer** (Completado - 100%)
Analizador inteligente de currículums con RAG y fine-tuning para análisis detallados.
- **Tecnologías**: Python, Streamlit, OpenAI, LangChain, ChromaDB, AWS Textract
- **Características**: Análisis completo, recomendaciones de trabajo, roadmaps profesionales

### 🗂️ **DocumentAssistant-AI** (Completado - 100%)
Asistente multimodal para análisis de documentos con síntesis de voz.
- **Tecnologías**: Python, Gradio, LangChain, OpenAI, ElevenLabs, AWS Textract
- **Características**: Multimodal, síntesis de voz, múltiples formatos (PDF, CSV, Excel)"""
            },
            {
                "input": "¿Cuál es tu experiencia con Python?",
                "output": """## Experiencia con Python

**Nivel**: Intermedio  
**Experiencia**: 8 meses  
**Especialización**: IA/ML

### Aplicaciones Principales:
- **Desarrollo de IA**: OpenAI API, LangChain, Fine-tuning
- **Procesamiento de datos**: Pandas, análisis de documentos
- **APIs**: FastAPI para backends de chatbots
- **Bases de datos vectoriales**: FAISS, ChromaDB, Pinecone

### Proyectos donde lo uso:
- LegalGPT (backend completo)
- CV Analyzer (análisis y procesamiento)
- DocumentAssistant-AI (pipeline multimodal)
- ATS Inteligente (sistema multiagente)

Mi enfoque es **"aprender haciendo"** - todos mis proyectos tienen aplicaciones reales."""
            },
            {
                "input": "¿Cómo puedo contactarte?",
                "output": """## 📞 Información de Contacto

¡Me encantaría colaborar contigo! Aquí tienes mis canales de contacto:

**📧 Email**: esteban.ortiz.dev@gmail.com  
**💼 LinkedIn**: https://www.linkedin.com/in/esteban-ortiz-restrepo  
**🔗 GitHub**: https://github.com/EstebanDevJR  
**📍 Ubicación**: Pereira, Colombia

### Disponible para:
- Proyectos de IA generativa
- Colaboraciones en desarrollo
- Trabajo remoto y presencial
- Consultas técnicas sobre mis proyectos

¡No dudes en escribirme para discutir oportunidades!"""
            }
        ]

    def _create_example_selector(self):
        """Crear selector de ejemplos basado en similitud semántica"""
        if not self.embeddings:
            return None
            
        try:
            from langchain_community.vectorstores import FAISS
            
            vectorstore = FAISS.from_texts(
                [example["input"] for example in self.few_shot_examples],
                self.embeddings,
                metadatas=[{"output": example["output"]} for example in self.few_shot_examples]
            )
            
            return SemanticSimilarityExampleSelector(
                vectorstore=vectorstore,
                k=1  # Seleccionar 1 ejemplo más relevante
            )
        except Exception as e:
            print(f"Warning: Could not create example selector: {e}")
            return None

    def get_contextualized_prompt(self, user_message: str, conversation_history: list = None) -> Dict[str, Any]:
        """Generar prompt contextualizado con few-shot examples"""
        
        # Seleccionar ejemplos relevantes
        few_shot_examples = []
        if self.example_selector:
            try:
                selected_examples = self.example_selector.select_examples({"input": user_message})
                for example in selected_examples:
                    few_shot_examples.extend([
                        ("human", example["input"]),
                        ("ai", example.get("output", ""))
                    ])
            except Exception as e:
                print(f"Warning: Could not select examples: {e}")
        
        # Preparar historial de chat
        chat_history = []
        if conversation_history:
            for msg in conversation_history[-5:]:  # Últimos 5 mensajes
                if msg.get("role") == "user":
                    chat_history.append(("human", msg.get("content", "")))
                elif msg.get("role") == "assistant":
                    chat_history.append(("ai", msg.get("content", "")))
        
        return {
            "input": user_message,
            "few_shot_examples": few_shot_examples,
            "chat_history": chat_history
        }
    
    def get_project_info(self, project_query: str) -> ProjectInfo:
        """Obtener información estructurada de un proyecto específico"""
        prompt = self.project_template.format(project_query=project_query)
        # Este método sería usado con el LLM para generar respuesta estructurada
        return self.project_parser
    
    def get_skill_assessment(self, skill_query: str) -> SkillAssessment:
        """Obtener evaluación estructurada de una habilidad específica"""
        prompt = self.skills_template.format(skill_query=skill_query)
        # Este método sería usado con el LLM para generar respuesta estructurada
        return self.skill_parser
    
    def get_contact_info(self, contact_query: str) -> ContactResponse:
        """Obtener información de contacto estructurada"""
        prompt = self.contact_template.format(contact_query=contact_query)
        # Este método sería usado con el LLM para generar respuesta estructurada
        return self.contact_parser
    
    def classify_query_intent(self, user_message: str) -> str:
        """Clasificar la intención de la consulta del usuario"""
        message_lower = user_message.lower()
        
        # Palabras clave para diferentes intenciones
        project_keywords = ["proyecto", "project", "desarrollado", "built", "creado", "aplicación"]
        skill_keywords = ["habilidad", "skill", "experiencia", "experience", "tecnología", "technology", "saber"]
        contact_keywords = ["contacto", "contact", "email", "linkedin", "github", "colaborar", "collaborate"]
        
        # Clasificación simple basada en palabras clave
        if any(keyword in message_lower for keyword in project_keywords):
            return "projects"
        elif any(keyword in message_lower for keyword in skill_keywords):
            return "skills"
        elif any(keyword in message_lower for keyword in contact_keywords):
            return "contact"
        else:
            return "general"
    
    def get_optimized_prompt(self, user_message: str, conversation_history: list = None) -> Dict[str, Any]:
        """Obtener prompt optimizado basado en la intención de la consulta"""
        intent = self.classify_query_intent(user_message)
        
        if intent == "projects":
            return {
                "template": self.project_template,
                "parser": self.project_parser,
                "variables": {"project_query": user_message}
            }
        elif intent == "skills":
            return {
                "template": self.skills_template,
                "parser": self.skill_parser,
                "variables": {"skill_query": user_message}
            }
        elif intent == "contact":
            return {
                "template": self.contact_template,
                "parser": self.contact_parser,
                "variables": {"contact_query": user_message}
            }
        else:
            # Usar template general con few-shot examples
            variables = self.get_contextualized_prompt(user_message, conversation_history)
            return {
                "template": self.chat_template,
                "parser": StrOutputParser(),
                "variables": variables
            }

    def get_knowledge_summary(self) -> Dict[str, Any]:
        """Obtener resumen de la base de conocimientos"""
        return {
            "projects_total": 5,
            "projects_completed": 3,
            "projects_in_progress": 2,
            "main_technologies": ["Python", "OpenAI API", "LangChain", "FastAPI", "React"],
            "specializations": ["RAG", "Fine-tuning", "Multimodal AI"],
            "experience_months": {
                "python": 8,
                "openai": 8,
                "langchain": 6,
                "rag": 5,
                "fine_tuning": 5
            },
            "location": "Pereira, Colombia",
            "status": "Available for collaboration",
            "features": [
                "Few-shot prompting",
                "Intent classification",
                "Structured outputs",
                "Semantic example selection",
                "LangSmith integration"
            ]
        }


# Instancia global
prompt_service = PromptService()
