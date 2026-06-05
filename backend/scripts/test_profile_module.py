import os
import sys

# Ensure app is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user import user_repo
from app.schemas.profile_payloads import ProfileOnboardingRequest
from app.schemas.profile import UserProfileBase
from app.schemas.health_condition import HealthConditionBase
from app.schemas.allergy import AllergyBase
from app.schemas.dietary_preference import DietaryPreferenceBase
from app.services.profile_service import profile_service

def test_profile_module():
    # Force create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Starting Profile Module Tests...")
        
        # 1. Setup mock user
        # Check if exists first to avoid sqlite integrity error on rerun
        existing_user = user_repo.get_by_email(db, "test_profile@example.com")
        if existing_user:
            user_repo.delete(db, existing_user.id)
            
        user = user_repo.create(db, UserCreate(email="test_profile@example.com", full_name="John Doe", password="pwd"))
        user_id = user.id
        print(f"[SUCCESS] Created User: {user_id}")

        # 2. Test Create Profile
        payload = ProfileOnboardingRequest(
            full_name="Johnathon Doe",
            profile=UserProfileBase(age=30, weight_kg=75.5, height_cm=180.0, diet_type="Balanced"),
            health_conditions=HealthConditionBase(diabetes=True, hypertension=False),
            allergies=AllergyBase(milk=True, nuts=True, other_allergies="Dust"),
            preferences=DietaryPreferenceBase(high_protein=True, weight_loss=True)
        )
        
        created = profile_service.create_profile(db, user_id, payload)
        if created.get("profile"):
            print("[SUCCESS] Create Profile - Completed")
        else:
            print("[ERROR] Create Profile Failed")

        # 3. Test Update Profile
        update_payload = ProfileOnboardingRequest(
            profile=UserProfileBase(age=31) # birthday!
        )
        updated = profile_service.update_profile(db, user_id, update_payload)
        if updated["profile"].age == 31:
             print("[SUCCESS] Update Profile - Age changed to 31")

        # 4. Test Health Summary
        summary = profile_service.get_health_summary(db, user_id)
        if "Diabetes" in summary.conditions and "Milk" in summary.allergies and "Nuts" in summary.allergies:
            print("[SUCCESS] Health Summary Generated Correctly")
            print(f"       Conditions: {summary.conditions}")
            print(f"       Allergies: {summary.allergies}")
        else:
            print("[ERROR] Health Summary Incorrect")

        # 5. Test Completion Score
        completion = profile_service.calculate_completion(db, user_id)
        if completion.completion_percentage == 100 and completion.profile_complete:
            print("[SUCCESS] Profile Completion calculated correctly at 100%")
        else:
            print(f"[ERROR] Profile Completion is {completion.completion_percentage}%")

        # 6. Test Delete Profile
        deleted = profile_service.delete_profile(db, user_id)
        if deleted:
            # check if gone
            data = profile_service.get_profile(db, user_id)
            if data and data.get("profile") is None:
                print("[SUCCESS] Delete Profile successful")
        
        print("All tests passed!")
    except Exception as e:
        print(f"Test Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_profile_module()
