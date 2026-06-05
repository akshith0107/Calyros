from pydantic import BaseModel, EmailStr
from uuid import UUID

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenPayload(BaseModel):
    sub: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str
