import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from app.core.database import SessionLocal
from app.models.user import User
from app.models.profile import UserProfile
from app.models.health_condition import HealthCondition
from app.models.allergy import Allergy
from app.schemas.profile_payloads import ProfileOnboardingRequest
from app.services.profile_service import profile_service

def serialize_row(obj):
    if not obj: return None
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

def run_audit():
    print("==================================================")
    print("1. FRONTEND PROFILE FORM (Simulation based on Profile.jsx)")
    print("==================================================")
    print("React State variables mapped in Profile.jsx:")
    react_state = {
        "age": 30,
        "height_cm": 180,
        "weight_kg": 80,
        "activity_level": "ACTIVE",
        "primary_goal": "BUILD_MUSCLE" 
        # Note: frontend sends 'primary_goal', not 'health_goal'
    }
    print("React State before submit:")
    print(json.dumps(react_state, indent=2))
    
    payload = {
        "profile": react_state
    }
    print("\nExact JSON payload sent to backend:")
    print(json.dumps(payload, indent=2))
    
    print("\n==================================================")
    print("2. PROFILE API ENDPOINT")
    print("==================================================")
    
    try:
        req = ProfileOnboardingRequest(**payload)
        print("Pydantic Validation Result (ProfileOnboardingRequest):")
        print(req.model_dump())
    except Exception as e:
        print(f"Pydantic Validation Error: {e}")
        
    print("\n==================================================")
    print("3. DATABASE PERSISTENCE (Current Real Data)")
    print("==================================================")
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        print("No user found in DB.")
        return
        
    print(f"Testing for User ID: {user.id}")
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    health_cond = db.query(HealthCondition).filter(HealthCondition.user_id == user.id).first()
    allergy = db.query(Allergy).filter(Allergy.user_id == user.id).first()
    
    print("\nExact Database Row (user_profiles table):")
    print(json.dumps(serialize_row(profile), indent=2, default=str))
    print("\nExact Database Row (health_conditions table):")
    print(json.dumps(serialize_row(health_cond), indent=2, default=str))
    print("\nExact Database Row (allergies table):")
    print(json.dumps(serialize_row(allergy), indent=2, default=str))
        
    print("\n==================================================")
    print("4. PROFILE RETRIEVAL (GET /profile/me)")
    print("==================================================")
    resp = profile_service.get_profile(db, user.id)
    if resp:
        print("Exact API Response returned to React:")
        # resp might be a ProfileResponse object, let's dump it safely
        print(json.dumps(getattr(resp, "model_dump", lambda: resp)(), indent=2, default=str))
        
    print("\n==================================================")
    print("5. SCAN PIPELINE INJECTION")
    print("==================================================")
    print("In scan_service.py process_scan():")
    print("Lines 69-70:")
    print("profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()")
    print("scoring_service.calculate_score(..., user_profile=profile)")
    print("\nThe exact profile object passed to scoring/intelligence is the SQLAlchemy UserProfile model.")
    if profile:
        print(f"health_goal value passed to intelligence_engine: {profile.health_goal}")
        
    db.close()

if __name__ == "__main__":
    run_audit()
