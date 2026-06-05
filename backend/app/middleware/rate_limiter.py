from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.core.redis import redis_client
import time
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Determine limits based on route
        limit = None
        window = None
        
        if path.startswith("/api/v1/auth"):
            limit = 10
            window = 60 # 1 minute
        elif path.startswith("/api/v1/scan"):
            limit = 20
            window = 3600 # 1 hour
        elif path.startswith("/api/v1/recommendations"):
            limit = 30
            window = 3600 # 1 hour
        elif path.startswith("/api/v1/chat"):
            limit = 50
            window = 3600 # 1 hour
        elif path.startswith("/api/v1/analytics"):
            limit = 100
            window = 3600 # 1 hour
            
        if limit and window:
            redis = redis_client.get_client()
            if redis:
                # Use IP for auth, otherwise try to use token user_id if we were fully integrated.
                # For simplicity in middleware before auth runs, we use IP.
                client_ip = request.client.host if request.client else "unknown"
                key = f"rate_limit:{path}:{client_ip}"
                
                try:
                    current = await redis.get(key)
                    if current and int(current) >= limit:
                        logger.warning(f"Rate limit exceeded for {client_ip} on {path}")
                        return JSONResponse(
                            status_code=429,
                            content={"detail": "Too Many Requests"}
                        )
                    
                    pipe = redis.pipeline()
                    pipe.incr(key)
                    if not current:
                        pipe.expire(key, window)
                    await pipe.execute()
                except Exception as e:
                    logger.error(f"Rate limiter redis error: {e}")
                    # Fail open if redis is down
                    pass
        
        response = await call_next(request)
        
        # Secure headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response
