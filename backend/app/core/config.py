from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import Optional, List
import logging

class Settings(BaseSettings):
    APP_NAME: str = "AI Nutrition Label Scanner API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    
    # CORS
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000"
    
    # Uploads
    UPLOAD_MAX_SIZE_MB: int = 10

    DATABASE_URL: str
    
    # JWT
    JWT_SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Redis
    REDIS_URL: str
    
    # External APIs
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SCAN_TIMEOUT: int = 120
    
    # AI Models & APIs
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    GROQ_API_KEY: str = ""
    GROQ_REASONING_MODEL: str = "openai/gpt-oss-20b"
    
    # Error tracking
    SENTRY_DSN: str = ""

    @field_validator("DATABASE_URL", mode="before")
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL environment variable is missing or empty.")
        return v

    @field_validator("JWT_SECRET_KEY", "REFRESH_SECRET_KEY", mode="before")
    def validate_secret_key(cls, v, info):
        if not v or v == "dummy":
            raise ValueError(f"{info.field_name} environment variable is missing or empty.")
        return v
        
    @field_validator("GOOGLE_API_KEY", "GROQ_API_KEY", mode="before")
    def validate_ai_keys(cls, v, info):
        if not v or v == "dummy":
            raise ValueError(f"{info.field_name} environment variable is missing or empty. Required for application startup.")
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
