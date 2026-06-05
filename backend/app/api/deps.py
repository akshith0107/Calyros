from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import TokenPayload

security = HTTPBearer()

def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            print(f"[AUTH DEBUG] Invalid payload: user_id={user_id}, type={token_type}")
            raise credentials_exception
        token_data = TokenPayload(sub=user_id, role=payload.get("role", "USER"))
    except JWTError as e:
        print(f"[AUTH DEBUG] JWTError decoding token: {e}")
        raise credentials_exception

    import uuid
    user = db.query(User).filter(User.id == uuid.UUID(token_data.sub)).first()
    if user is None:
        print(f"[AUTH DEBUG] User not found in DB for UUID: {token_data.sub}")
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    return user

def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="The user doesn't have enough privileges"
        )
    return current_user
