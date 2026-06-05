import redis.asyncio as aioredis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis = None

    async def connect(self):
        if not settings.REDIS_URL:
            logger.warning("REDIS_URL not set. Redis will not be connected.")
            return

        try:
            self.redis = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=5.0
            )
            # Test connection
            await self.redis.ping()
            logger.info("✓ Redis Connected")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis = None

    async def disconnect(self):
        if self.redis:
            await self.redis.close()

    def get_client(self):
        return self.redis

redis_client = RedisClient()

async def get_redis():
    return redis_client.get_client()
