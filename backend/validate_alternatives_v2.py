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
    
    # 1. Setup test user
    test_user = User(
        email="alt_tester_v2@test.com",
        password_hash="fakehash",
        full_name="Alt Tester V2"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    user_id = test_user.id
    
    # 2. Setup Profile (Weight Loss, Milk Allergy)
    payload = ProfileOnboardingRequest(**{
        "profile": {
            "health_goal": "lose-weight",
            "activity_level": "MODERATE",
            "diet_type": "GENERAL"
        },
        "allergies": {
            "milk": True,
            "gluten": False
        }
    })
    profile_service.create_profile(db, user_id, payload)
    
    products_to_test = [
        ("Nutella", 25, "Ultra-Processed", ["Palm oil", "Added sugar"], []),
        ("Coca-Cola", 5, "Ultra-Processed", ["High fructose corn syrup"], []),
        ("Doritos", 30, "Ultra-Processed", ["Artificial flavors", "High sodium"], []),
        ("Monster Energy", 10, "Ultra-Processed", ["High sugar", "Excessive caffeine"], []),
        ("Instant Noodles", 15, "Ultra-Processed", ["High sodium", "Refined carbs"], [])
    ]
    
    print("\n=== BETTER ALTERNATIVES V2 VALIDATION ===")
    print("User Goal: Lose Weight | Allergy: Milk\n")
    
    for (name, score, proc, concerns, positives) in products_to_test:
        prod = Product(product_name=name)
        db.add(prod)
        db.commit()
        db.refresh(prod)
        
        scan = ScanHistory(
            user_id=user_id,
            product_id=prod.id,
            raw_ocr_text=f"Mocked text for {name}",
            extracted_json={
                "nutrition_facts": {"calories": 300, "sugar": 30},
                "ingredients": [],
                "allergens": []
            },
            analysis_json={
                "overall_score": score,
                "classification": "Avoid",
                "processing_assessment": proc,
                "concerns": concerns,
                "positive_factors": positives
            }
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        
        print(f"Testing alternatives for: {name} (Score: {score})")
        
        try:
            result = await alternatives_service.get_alternatives(db, scan.id, user_id)
            for i, alt in enumerate(result.get("alternatives", [])):
                print(f"  Alternative {i+1}: {alt.get('name')}")
                print(f"    Category: {alt.get('category')}")
                print(f"    Reason: {alt.get('reason')}")
                print(f"    Goal Alignment: {alt.get('goal_alignment')}")
                print(f"    Expected Improvement: {alt.get('expected_improvement')}")
                print(f"    Benefits: {', '.join(alt.get('benefits', []))}")
            print("-" * 50)
        except Exception as e:
            print(f"Failed on {name}: {e}")

    # Cleanup
    db.query(ScanHistory).filter(ScanHistory.user_id == user_id).delete()
    db.query(UserProfile).filter(UserProfile.user_id == user_id).delete()
    db.query(User).filter(User.id == user_id).delete()
    db.commit()
    db.close()

if __name__ == "__main__":
    asyncio.run(run_validation())
