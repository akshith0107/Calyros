import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
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
from app.services.scoring_service import scoring_service
import uuid

def test_scoring_module():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("--- Testing Deterministic Scoring Engine ---\n")
        
        # 1. Setup Mock User (Diabetic & Milk Allergy)
        test_email = "diabetic_test@example.com"
        existing = user_repo.get_by_email(db, test_email)
        if existing: user_repo.delete(db, existing.id)
            
        user = user_repo.create(db, UserCreate(email=test_email, full_name="Diabetic User", password="pwd"))
        
        # Create full profile payload
        profile_service.create_profile(db, user.id, ProfileOnboardingRequest(
            profile=UserProfileBase(age=45),
            health_conditions=HealthConditionBase(diabetes=True), # Diabetic
            allergies=AllergyBase(milk=True) # Milk allergy
        ))
        print("[SUCCESS] Setup User Profile (Diabetes + Milk Allergy)")

        # 2. Setup Mock Product (High Sugar + Milk + Ultra Processed)
        prod = Product(product_name="Toxic Chocolate Bar", brand="Big Sugar")
        db.add(prod)
        db.flush()
        
        facts = NutritionFact(
            product_id=prod.id,
            sugar=35.0, # High sugar (Penalty for Nutrition AND Diabetes Compatibility)
            sodium=100.0,
            protein=2.0
        )
        db.add(facts)
        
        # Create 11 ingredients to trigger ultra processed penalty (>10 limit)
        # Includes High Risk: "High Fructose Corn Syrup"
        # Includes Preservative: "Sodium Benzoate"
        # Includes Allergen trigger: "Milk Powder"
        ingredients = [
            "High Fructose Corn Syrup", "Milk Powder", "Sodium Benzoate", 
            "Sugar", "Cocoa", "Palm Oil", "Lecithin", "Vanilla", 
            "Salt", "Water", "Thickener", "Artificial Color"
        ]
        
        for ing in ingredients:
            db.add(Ingredient(ingredient_name=ing, products=[prod]))
            
        db.flush()
        print("[SUCCESS] Setup Product (35g Sugar, 12 Ingredients, Milk, Artificial Color)")

        # 3. Create Scan History
        scan = ScanHistory(user_id=user.id, product_id=prod.id)
        db.add(scan)
        db.commit()
        db.refresh(scan)
        
        # 4. RUN ENGINE
        print("\n--- Running Scoring Engine Pipeline ---")
        score = scoring_service.calculate_score(db, scan.id, user.id)
        
        print(f"Nutrition Score:    {score.nutrition_score}")
        print(f"Ingredient Score:   {score.ingredient_score}")
        print(f"Processing Score:   {score.processing_score}")
        print(f"Compatibility Score:{score.compatibility_score}")
        print(f"Overall Score:      {score.overall_score} ({score.classification})")
        print("\nWarnings:")
        for w in score.warnings: print(f" - {w}")
        print("\nFlags:")
        for f in score.flags: print(f" - {f}")
        
        # 5. Assertions
        assert score.classification == "AVOID", "Score should classify as AVOID"
        assert "ALLERGEN_PRESENT" in score.flags, "Milk allergy flag missed"
        assert "DIABETIC_RISK" in score.flags, "Diabetic risk flag missed"
        assert "ULTRA_PROCESSED" in score.flags, "Ultra processed flag missed"
        assert score.compatibility_score == 0.0, "Compatibility should be clamped to 0"
        
        print("\n[SUCCESS] All deterministic rules fired correctly!")
        
    except Exception as e:
        print(f"\n[ERROR] Test Failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_scoring_module()
