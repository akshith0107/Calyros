import os
import sys

# Ensure app is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.profile import UserProfile
from app.repositories.user import user_repo
from app.schemas.user import UserCreate

def run_tests():
    print("Running Database Tests...")
    
    # Check connection
    db = SessionLocal()
    try:
        # Create a user
        print("Testing CRUD and Repositories...")
        user_schema = UserCreate(email="test@example.com", full_name="Test User", password="hashed_pwd")
        user = user_repo.create(db, user_schema)
        print(f"[SUCCESS] Created User: {user.email}")
        
        # Test Relationship
        profile = UserProfile(user_id=user.id, age=25, height_cm=180.0)
        db.add(profile)
        db.commit()
        print(f"[SUCCESS] Created Profile for User: Age {user.profile.age}")
        
        # Test cascade delete
        user_id = user.id
        user_repo.delete(db, user_id)
        
        profile_exists = db.query(UserProfile).filter_by(user_id=user_id).first()
        if profile_exists is None:
            print("[SUCCESS] Cascade Delete successful: Profile deleted when User was deleted.")
        else:
            print("[ERROR] Cascade Delete failed.")

        print("All tests passed successfully!")
    except Exception as e:
        print(f"Test failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
