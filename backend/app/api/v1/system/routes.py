from fastapi import APIRouter
from app.core.redis import redis_client
from app.core.database import engine
from sqlalchemy import text
import httpx
from app.core.config import settings

router = APIRouter()

@router.get("/status")
async def get_system_status():
    status = {
        "database": "unhealthy",
        "redis": "unhealthy",
        "groq": "healthy", # Assume healthy unless ping fails
        "scout": "healthy",
        "storage": "healthy"
    }
    
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        status["database"] = "healthy"
    except Exception:
        pass
        
    try:
        redis = redis_client.get_client()
        if redis:
            await redis.ping()
            status["redis"] = "healthy"
    except Exception:
        pass
        
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {settings.GROQ_API_KEY_CHAT}"})
            if resp.status_code == 200:
                status["groq"] = "healthy"
                status["scout"] = "healthy"
            else:
                status["groq"] = "unhealthy"
                status["scout"] = "unhealthy"
    except Exception:
        status["groq"] = "unhealthy"
        status["scout"] = "unhealthy"
        
    return status
