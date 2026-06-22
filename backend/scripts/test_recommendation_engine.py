import os
import sys
import asyncio

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.redis import redis_client
from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user import user_repo

from app.schemas.profile_payloads import ProfileOnboardingRequest
from app.schemas.profile import UserProfileBase
from app.schemas.health_condition import HealthConditionBase
from app.schemas.allergy import AllergyBase
from app.services.profile_service import profile_service

from app.models.product import Product
from app.models.ingredient import Ingredient
from app.models.nutrition_fact import NutritionFact
from app.models.scan_history import ScanHistory
from app.models.food_score import FoodScore
from app.services.recommendation_service import recommendation_service

async def run_tests():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    await redis_client.connect()
    
    try:
        print("--- Testing Phase 7: GPT-OSS Recommendation System ---\n")
        
        # 1. Setup Mock User
        test_email = "groq_test@example.com"
        existing = user_repo.get_by_email(db, test_email)
        if existing: user_repo.delete(db, existing.id)
            
        user = user_repo.create(db, UserCreate(email=test_email, full_name="Groq User", password="pwd"))
        profile_service.create_profile(db, user.id, ProfileOnboardingRequest(
            profile=UserProfileBase(age=30),
            health_conditions=HealthConditionBase(diabetes=True),
            allergies=AllergyBase()
        ))
        
        # 2. Setup Mock Product
        prod = Product(product_name="Groq Cereal", brand="AI Foods")
        db.add(prod)
        db.flush()
        
        facts = NutritionFact(product_id=prod.id, sugar=25.0, protein=5.0)
        db.add(facts)
        
        for ing in ["Sugar", "Maltodextrin", "Oats"]:
            db.add(Ingredient(ingredient_name=ing, products=[prod]))
            
        db.flush()
        
        # 3. Create Scan History & Fake Score
        scan = ScanHistory(user_id=user.id, product_id=prod.id)
        db.add(scan)
        db.flush()
        
        score = FoodScore(
            scan_id=scan.id,
            overall_score=45.0,
            classification="MODERATE",
            flags=["HIGH_SUGAR", "DIABETIC_RISK"]
        )
        db.add(score)
        db.commit()
        db.refresh(scan)
        
        # 4. Generate Recommendation
        print("Triggering Recommendation Service (Mock Mode)...")
        rec1 = await recommendation_service.generate_recommendation(db, scan.id, user.id)
        
        print("\n--- Health Advisor Payload ---")
        print(f"Health Score: {rec1.health_score}")
        print(f"Summary: {rec1.summary}")
        print(f"Strengths: {rec1.strengths}")
        print(f"Concerns: {rec1.concerns}")
        print(f"Score Breakdown: {rec1.score_breakdown}")
        print(f"Goal Compatibility: {rec1.goal_compatibility}")
        print(f"Disease Compatibility: {rec1.disease_compatibility}")
        print(f"Processing Level: {rec1.processing_level}")
        print(f"Processing Reason: {rec1.processing_reason}")
        
        print("\n--- Recommendations ---")
        for r in rec1.recommendations:
            print(f"- {r}")

        print("\n--- Healthier Alternatives ---")
        for a in rec1.healthier_alternatives:
            print(f"- {a}")
            
        # 5. Check Redis Caching
        print("\nChecking Redis Cache for duplication prevention...")
        rec2 = await recommendation_service.generate_recommendation(db, scan.id, user.id)
        
        assert rec1.id == rec2.id, "Cache failed to return same entity"
        print("[SUCCESS] Redis hit confirmed. Recommendation cached successfully.")
        
    except Exception as e:
        print(f"\n[ERROR] Test Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        await redis_client.disconnect()

if __name__ == "__main__":
    asyncio.run(run_tests())
