import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.api.v1.auth.routes import register, login, refresh_token, logout
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest, RefreshTokenRequest
import asyncio

async def test_auth():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("--- Testing JWT Authentication & Roles ---")
        
        # Cleanup
        existing = db.query(User).filter(User.email == "test_auth@example.com").first()
        if existing:
            db.delete(existing)
            db.commit()

        # 1. Register
        user_in = UserCreate(email="test_auth@example.com", full_name="Auth Test", password="mysecretpassword")
        new_user = register(user_in, db)
        print(f"[SUCCESS] User registered: {new_user.email} with Role: {new_user.role}")
        assert new_user.role == "USER"

        # 2. Login
        login_data = LoginRequest(email="test_auth@example.com", password="mysecretpassword")
        token_data = login(login_data, db)
        print(f"[SUCCESS] Login successful! Access Token: {token_data['access_token'][:20]}...")
        assert token_data["token_type"] == "bearer"
        
        # 3. Refresh (Without Redis mocked for simplicity)
        refresh_req = RefreshTokenRequest(refresh_token=token_data["refresh_token"])
        new_tokens = await refresh_token(refresh_req, db)
        print(f"[SUCCESS] Token refreshed! New Access Token: {new_tokens['access_token'][:20]}...")
        
        # 4. Logout
        logout_resp = await logout(refresh_req, new_user)
        print(f"[SUCCESS] Logout response: {logout_resp['message']}")

    except Exception as e:
        print(f"[ERROR] Auth test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_auth())
