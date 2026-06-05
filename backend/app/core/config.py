from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import Optional
import logging

class Settings(BaseSettings):
    APP_NAME: str = "AI Nutrition Label Scanner API"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    # Redis
    REDIS_URL: str
    
    # Phase 5: External APIs
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SCAN_TIMEOUT: int = 120
    
    # Phase 7: Groq Deterministic Flow & Chat
    GROQ_API_KEY_SCOUT: str = ""
    GROQ_MODEL_SCOUT: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    GROQ_API_KEY_CHAT: str = ""
    GROQ_MODEL_CHAT: str = "openai/gpt-oss-120b"
    GROQ_API_KEY_BACKUP: str = ""
    
    # Phase 8: Security & Prod
    REFRESH_SECRET_KEY: str
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SENTRY_DSN: str = ""

    @field_validator("DATABASE_URL", mode="before")
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL environment variable is missing or empty.")
        return v

    @field_validator("SECRET_KEY", "REFRESH_SECRET_KEY", mode="before")
    def validate_secret_key(cls, v, info):
        if not v or v == "dummy":
            raise ValueError(f"{info.field_name} environment variable is missing or empty.")
        return v
        
    @field_validator("GROQ_API_KEY_SCOUT", "GROQ_API_KEY_CHAT", mode="before")
    def validate_groq_keys(cls, v, info):
        if not v or v == "dummy":
            raise ValueError(f"{info.field_name} environment variable is missing or empty. Required for application startup.")
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
