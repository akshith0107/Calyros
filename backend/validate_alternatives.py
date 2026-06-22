import asyncio
import json
import uuid
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.profile import UserProfile
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.services.profile_service import profile_service
from app.services.alternatives_service import alternatives_service
from app.schemas.profile_payloads import ProfileOnboardingRequest

async def run_validation():
    db = SessionLocal()
    
    # Setup test user with a 'Lose Weight' profile
    test_user = User(
        email="alt_tester@test.com",
        password_hash="fakehash",
        full_name="Alt Tester"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    user_id = test_user.id
    
    payload = ProfileOnboardingRequest(**{
        "profile": {
            "health_goal": "lose-weight",
            "activity_level": "MODERATELY_ACTIVE",
            "diet_type": "NONE"
        },
        "allergies": {}
    })
    profile_service.create_profile(db, user_id, payload)
    
    def insert_product_and_scan(name, sugar, processing, facts, ingredients):
        prod = Product(product_name=name)
        db.add(prod)
        db.commit()
        db.refresh(prod)
        
        scan = ScanHistory(
            user_id=user_id,
            product_id=prod.id,
            raw_ocr_text=f"Mocked text for {name}",
            extracted_json={
                "nutrition_facts": facts,
                "ingredients": ingredients
            },
            analysis_json={
                "overall_score": 30,
                "ingredient_quality_score": 30,
                "processing_assessment": processing,
                "key_findings": ["High sugar", "Ultra processed"]
            }
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan.id

    # 1. Nutella
    s1 = insert_product_and_scan("Nutella", 21, "Ultra-Processed", {"sugar": 21, "protein": 2, "fiber": 1}, ["sugar", "palm oil", "hazelnuts"])
    # 2. Coca-Cola
    s2 = insert_product_and_scan("Coca-Cola", 39, "Ultra-Processed", {"sugar": 39, "protein": 0, "fiber": 0}, ["carbonated water", "high fructose corn syrup"])
    # 3. Doritos
    s3 = insert_product_and_scan("Doritos", 1, "Ultra-Processed", {"sugar": 1, "protein": 2, "fiber": 1, "sodium": 210}, ["corn", "vegetable oil", "maltodextrin"])
    # 4. Monster Energy
    s4 = insert_product_and_scan("Monster Energy", 54, "Ultra-Processed", {"sugar": 54, "protein": 0, "fiber": 0}, ["carbonated water", "sugar", "glucose"])

    tests = [
        ("Nutella", s1),
        ("Coca-Cola", s2),
        ("Doritos", s3),
        ("Monster Energy", s4)
    ]

    print("\n--- ALTERNATIVES ENGINE VALIDATION (GOAL: LOSE WEIGHT) ---\n")
    for name, s_id in tests:
        print(f"\n==================================================")
        print(f"PRODUCT: {name}")
        print(f"==================================================")
        try:
            result = await alternatives_service.get_alternatives(db, s_id, user_id)
            for alt in result.get("alternatives", []):
                print(f"-> {alt.get('name')}")
                print(f"   Reason: {alt.get('reason')}")
                print(f"   Benefits: {', '.join(alt.get('benefits', []))}")
                print(f"   Improvement: {alt.get('expected_improvement')}\n")
        except Exception as e:
            print(f"Failed: {e}")

    # Cleanup
    db.query(ScanHistory).filter(ScanHistory.user_id == user_id).delete()
    db.query(UserProfile).filter(UserProfile.user_id == user_id).delete()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    db.close()

if __name__ == "__main__":
    asyncio.run(run_validation())
