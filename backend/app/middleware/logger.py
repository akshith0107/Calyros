import logging
import json
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import uuid

logger = logging.getLogger("nutrimind.access")

class StructuredLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        # Attach request_id to request state so downstream handlers can access it
        request.state.request_id = request_id
        start_time = datetime.utcnow()
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            error_id = str(uuid.uuid4())
            process_time = (datetime.utcnow() - start_time).total_seconds()
            log_data = {
                "timestamp": start_time.isoformat(),
                "request_id": request_id,
                "error_id": error_id,
                "method": request.method,
                "path": request.url.path,
                "status": status_code,
                "duration_s": round(process_time, 4),
                "error": str(e)
            }
            logger.error(json.dumps(log_data), exc_info=True)
            raise
            
        process_time = (datetime.utcnow() - start_time).total_seconds()
        
        log_data = {
            "timestamp": start_time.isoformat(),
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": status_code,
            "duration_s": round(process_time, 4)
        }
        
        # Propagate request_id in response header for client-side correlation
        response.headers["X-Request-Id"] = request_id
        
        if status_code >= 400:
            logger.warning(json.dumps(log_data))
        else:
            logger.info(json.dumps(log_data))
            
        return response

