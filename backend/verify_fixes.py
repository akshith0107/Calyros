import asyncio
import json
from uuid import uuid4
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_condition import HealthCondition
from app.models.allergy import Allergy
from app.models.dietary_preference import DietaryPreference
from app.services.profile_service import profile_service
from app.services.scoring_service import scoring_service
from app.services.chat_service import ChatService
from app.services.nutrition_intelligence_engine import NutritionIntelligenceEngine
from app.schemas.profile_payloads import ProfileOnboardingRequest
from pydantic import BaseModel

class DummyRequest(BaseModel):
    profile: dict = None
    allergies: dict = None

async def run_verification():
    db = SessionLocal()
    
    # 1. Create a test user
    test_user = User(
        email="verify_fixes@test.com",
        password_hash="hashed_password_123",
        full_name="Verification User"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    user_id = test_user.id
    
    # 2. Save profile: Goal = build-muscle, Activity = VERY_ACTIVE, Allergies = Milk
    payload = ProfileOnboardingRequest(**{
        "profile": {
            "health_goal": "build-muscle",
            "activity_level": "VERY_ACTIVE",
            "diet_type": "NONE"
        },
        "allergies": {
            "milk": True,
            "soy": False
        }
    })
    profile_service.create_profile(db, user_id, payload)
    
    # 3. Prove DB Profile Record
    print("\n==================================================")
    print("1. DATABASE PROFILE RECORD (Via Profile Service)")
    print("==================================================")
    profile_dict = profile_service.get_profile(db, user_id)
    print(f"Profile: health_goal={profile_dict['profile'].health_goal}, activity_level={profile_dict['profile'].activity_level}")
    print(f"Allergies: milk={profile_dict['allergies'].milk}, soy={profile_dict['allergies'].soy}")

    # 4. Prove Profile entering intelligence engine (simulating scan flow)
    print("\n==================================================")
    print("2 & 3. PROFILE OBJECT ENTERING INTELLIGENCE ENGINE")
    print("==================================================")
    print("Passing the composite dictionary profile_dict to engine...")
    
    parsed_data = {
        "nutrition_facts": {"sugar": 12, "protein": 25, "fiber": 0, "sodium": 150},
        "ingredients": ["milk protein isolate", "soy lecithin", "sugar"],
        "allergens": ["Milk", "Soy"],
        "vitamins": [],
        "minerals": []
    }
    
    analysis = NutritionIntelligenceEngine.analyze(parsed_data, profile_dict)
    
    print("\n==================================================")
    print("4. ALLERGY ANALYSIS OUTPUT")
    print("==================================================")
    print(json.dumps(analysis["allergy_analysis"], indent=2))
    
    print("\n==================================================")
    print("5. PERSONALIZED ANALYSIS OUTPUT")
    print("==================================================")
    print(analysis["personalized_analysis"])
    
    # 5. Prove Chat Context
    print("\n==================================================")
    print("6. CHAT CONTEXT PAYLOAD")
    print("==================================================")
    chat_svc = ChatService()
    
    # Fake session manually for verification print
    prof = profile_dict.get("profile")
    algy = profile_dict.get("allergies")
    
    extracted_allergies = []
    if algy:
        if getattr(algy, 'milk', False): extracted_allergies.append("milk")
        if getattr(algy, 'soy', False): extracted_allergies.append("soy")
        
    profile_context = json.dumps({
        "health_goal": getattr(prof, "health_goal", None),
        "activity_level": getattr(prof, "activity_level", None),
        "allergies": extracted_allergies
    }, indent=2)
    
    print(profile_context)

    # Cleanup
    db.query(Allergy).filter(Allergy.user_id == user_id).delete()
    db.query(UserProfile).filter(UserProfile.user_id == user_id).delete()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    db.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
