from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

def add_exception_handlers(app: FastAPI):
    
    from fastapi.encoders import jsonable_encoder
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation error: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "message": "Validation failed",
                    "type": "validation_error",
                    "details": jsonable_encoder(exc.errors())
                }
            }
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "message": "Database operation failed",
                    "type": "database_error"
                }
            }
        )

    from app.core.exceptions import ProfileNotFoundError
    @app.exception_handler(ProfileNotFoundError)
    async def profile_not_found_handler(request: Request, exc: ProfileNotFoundError):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": {
                    "message": exc.message,
                    "type": exc.type
                }
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled server error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "message": "An internal server error occurred.",
                    "type": "internal_server_error"
                }
            }
        )
