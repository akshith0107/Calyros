import sys
import asyncio
from app.core.database import engine
from app.core.redis import redis_client
from sqlalchemy import text

async def check_health():
    print("--- SYSTEM HEALTH CHECK ---")
    # DB
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT 1"))
            print("[OK] NeonDB Connection")
    except Exception as e:
        print("[FAIL] NeonDB Connection:", str(e))
        
    # Redis
    try:
        await redis_client.connect()
        redis = redis_client.get_client()
        if redis:
            await redis.ping()
            print("[OK] Redis Connection")
            await redis_client.disconnect()
        else:
            print("[FAIL] Redis Client is None")
    except Exception as e:
        print("[FAIL] Redis Connection:", str(e))

if __name__ == "__main__":
    asyncio.run(check_health())
