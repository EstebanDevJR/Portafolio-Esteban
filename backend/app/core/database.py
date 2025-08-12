from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import AsyncGenerator
import asyncio

from app.core.config import settings

# Base para modelos
Base = declarative_base()

# Motor de base de datos síncrono
if "postgresql" in settings.DATABASE_URL:
    database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://")
else:
    database_url = settings.DATABASE_URL

engine = create_engine(database_url, echo=settings.DEBUG)

# Sesión síncrona
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Motor asíncrono (para PostgreSQL)
if "postgresql" in settings.DATABASE_URL:
    async_engine = create_async_engine(
        settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
        echo=settings.DEBUG
    )
    AsyncSessionLocal = async_sessionmaker(
        async_engine, class_=AsyncSession, expire_on_commit=False
    )
else:
    # Para SQLite no usamos async
    async_engine = None
    AsyncSessionLocal = None


def get_db() -> Session:
    """Dependencia para obtener sesión de base de datos síncrona"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependencia para obtener sesión de base de datos asíncrona"""
    if AsyncSessionLocal is None:
        raise RuntimeError("Base de datos asíncrona no configurada")
    
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Inicializar base de datos"""
    if async_engine:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    else:
        Base.metadata.create_all(bind=engine)
