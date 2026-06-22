from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, get_password_hash
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import LoginRequest, Token, RefreshTokenRequest
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.redis import redis_client
from jose import jwt, JWTError

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        password_hash=get_password_hash(user_in.password),
        role="USER"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

@router.post("/login", response_model=Token)
def login(login_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    print("Login request received")
    print(f"username: {login_data.username}")
    print("Authenticating:", login_data.username)
    
    user = db.query(User).filter(User.email == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        print("Authentication failed: Incorrect email or password")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        print("Authentication failed: Inactive user")
        raise HTTPException(status_code=400, detail="Inactive user")

    print("Authentication successful")
    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id, user.role)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check if refresh token is blacklisted in Redis
    redis = redis_client.get_client()
    if redis:
        is_blacklisted = await redis.get(f"blacklist:{request.refresh_token}")
        if is_blacklisted:
            raise credentials_exception

    try:
        payload = jwt.decode(request.refresh_token, settings.REFRESH_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    import uuid
    user = db.query(User).filter(User.id == uuid.UUID(user_id)).first()
    if not user or not user.is_active:
        raise credentials_exception
        
    # Revoke old refresh token by blacklisting it
    if redis:
        await redis.setex(f"blacklist:{request.refresh_token}", settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, "true")

    access_token = create_access_token(user.id, user.role)
    new_refresh_token = create_refresh_token(user.id, user.role)

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/logout")
async def logout(request: RefreshTokenRequest, current_user: User = Depends(get_current_user)):
    # Blacklist the refresh token
    redis = redis_client.get_client()
    if redis:
        await redis.setex(f"blacklist:{request.refresh_token}", settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, "true")
    return {"success": True, "message": "Logged out successfully"}

from app.schemas.user import UserCreate, UserResponse, UserMeResponse
from app.services.profile_service import profile_service

@router.get("/me", response_model=UserMeResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    completion = profile_service.calculate_completion(db, current_user.id)
    # Convert SQLAlchemy model to dict, then inject custom fields
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "has_profile": completion.completion_percentage > 0,
        "profile_completed": completion.profile_complete
    }
    return user_data
