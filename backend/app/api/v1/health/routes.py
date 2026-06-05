from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.config import settings
import redis.asyncio as aioredis
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }

@router.get("/database")
async def database_health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

@router.get("/redis")
async def redis_health_check(redis: aioredis.Redis = Depends(get_redis)):
    try:
        if redis:
            await redis.ping()
            return {
                "status": "healthy",
                "redis": "connected"
            }
        else:
            return {
                "status": "unhealthy",
                "redis": "disconnected",
                "error": "Redis client not initialized"
            }
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {
            "status": "unhealthy",
            "redis": "disconnected",
            "error": str(e)
        }
