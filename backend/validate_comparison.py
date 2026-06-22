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
from app.services.comparison_service import comparison_service
from app.schemas.profile_payloads import ProfileOnboardingRequest

async def run_validation():
    db = SessionLocal()
    
    # 1. Setup Test User
    test_user = User(
        email="compare_tester@test.com",
        password_hash="fakehash",
        full_name="Compare Tester"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    user_id = test_user.id
    
    # 2. Setup Profile (Weight Loss focus for testing)
    payload = ProfileOnboardingRequest(**{
        "profile": {
            "health_goal": "lose-weight",
            "activity_level": "MODERATELY_ACTIVE",
            "diet_type": "NONE"
        },
        "allergies": {}
    })
    profile_service.create_profile(db, user_id, payload)
    
    print("\n--- User Profile Created (Goal: Lose Weight) ---")

    # Helper to insert mocked products & scans
    def insert_product_and_scan(name, sugar, protein, fiber, processing, ingredient_score, findings):
        prod = Product(product_name=name)
        db.add(prod)
        db.commit()
        db.refresh(prod)
        
        scan = ScanHistory(
            user_id=user_id,
            product_id=prod.id,
            raw_ocr_text=f"Mocked text for {name}",
            extracted_json={
                "nutrition_facts": {"sugar": sugar, "protein": protein, "fiber": fiber, "calories": 200, "sodium": 100},
                "ingredients": ["mock ingredient 1", "mock ingredient 2"]
            },
            analysis_json={
                "overall_score": ingredient_score,
                "ingredient_quality_score": ingredient_score,
                "processing_assessment": processing,
                "key_findings": findings
            }
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan.id

    # 3. Insert Mock Pairs
    
    # Pair 1: Nutella vs Peanut Butter
    s1 = insert_product_and_scan("Nutella", sugar=21, protein=2, fiber=1, processing="Ultra-Processed", ingredient_score=30, findings=["High Sugar"])
    s2 = insert_product_and_scan("Peanut Butter", sugar=3, protein=8, fiber=3, processing="Minimally Processed", ingredient_score=85, findings=["Good Protein"])

    # Pair 2: Coca-Cola vs Orange Juice
    s3 = insert_product_and_scan("Coca-Cola", sugar=39, protein=0, fiber=0, processing="Ultra-Processed", ingredient_score=10, findings=["Excessive Sugar", "Artificial Colors"])
    s4 = insert_product_and_scan("Orange Juice", sugar=22, protein=1, fiber=0, processing="Processed", ingredient_score=60, findings=["High Natural Sugar", "Vitamin C"])

    # Pair 3: Whey Protein vs Protein Bar
    s5 = insert_product_and_scan("Whey Protein", sugar=2, protein=25, fiber=0, processing="Processed", ingredient_score=80, findings=["High Protein Density"])
    s6 = insert_product_and_scan("Protein Bar", sugar=10, protein=20, fiber=5, processing="Ultra-Processed", ingredient_score=60, findings=["Contains added sugars and sugar alcohols"])

    pairs = [
        ("Nutella vs Peanut Butter", s1, s2),
        ("Coca-Cola vs Orange Juice", s3, s4),
        ("Whey Protein vs Protein Bar", s5, s6)
    ]

    for label, id1, id2 in pairs:
        print(f"\n==================================================")
        print(f"RUNNING COMPARISON: {label}")
        print(f"==================================================")
        try:
            result = await comparison_service.compare_products(db, id1, id2, user_id)
            print(f"WINNER: {result.get('winner')}")
            print("\nREASONING:")
            print(result.get("reasoning"))
            print("\nPERSONALIZED RECOMMENDATION:")
            print(result.get("personalized_recommendation"))
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
