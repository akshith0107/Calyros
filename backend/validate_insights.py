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
from app.services.insights_service import insights_service
from app.schemas.profile_payloads import ProfileOnboardingRequest

async def run_validation():
    db = SessionLocal()
    
    # 1. Setup test user
    test_user = User(
        email="insights_tester@test.com",
        password_hash="fakehash",
        full_name="Insights Tester"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    
    user_id = test_user.id
    
    # 2. Setup Profile (Muscle Gain focus)
    payload = ProfileOnboardingRequest(**{
        "profile": {
            "health_goal": "build-muscle",
            "activity_level": "VERY_ACTIVE",
            "diet_type": "HIGH_PROTEIN"
        },
        "allergies": {}
    })
    profile_service.create_profile(db, user_id, payload)
    
    def insert_scan(name, score, classif, protein, sugar, processing, concerns, positives):
        prod = Product(product_name=name)
        db.add(prod)
        db.commit()
        db.refresh(prod)
        
        scan = ScanHistory(
            user_id=user_id,
            product_id=prod.id,
            raw_ocr_text=f"Mocked text for {name}",
            extracted_json={
                "nutrition_facts": {"protein": protein, "sugar": sugar, "fiber": 2, "sodium": 150, "calories": 250},
                "ingredients": []
            },
            analysis_json={
                "overall_score": score,
                "classification": classif,
                "processing_assessment": processing,
                "concerns": concerns,
                "positive_factors": positives
            }
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)
        return scan.id

    # 3. Insert mock scans
    print("\n--- NUTRITION INSIGHTS VALIDATION (GOAL: BUILD MUSCLE) ---")
    print("Mocking 5 historical scans...")
    
    insert_scan("Whey Protein", 85, "Excellent", 25, 2, "Processed", [], ["High protein content"])
    insert_scan("Chicken Breast", 95, "Excellent", 30, 0, "Minimally Processed", [], ["Excellent lean protein"])
    insert_scan("Snickers Bar", 20, "Poor", 4, 27, "Ultra-Processed", ["High sugar", "Empty calories"], [])
    insert_scan("Protein Bar", 60, "Good", 20, 10, "Ultra-Processed", ["Added sugars"], ["Good protein source"])
    insert_scan("Monster Energy", 10, "Avoid", 0, 54, "Ultra-Processed", ["High sugar", "Artificial additives"], [])

    print("Running insights generator...\n")
    try:
        result = await insights_service.generate_insights(db, user_id)
        
        print("====== MACRO STATS ======")
        print(f"Average Health Score: {result.get('average_health_score')}")
        stats = result.get("scan_statistics", {})
        print(f"Total Scans: {stats.get('total_scans')}")
        print(f"Excellent: {stats.get('excellent_products')} | Good: {stats.get('good_products')} | Poor/Avoid: {stats.get('poor_products')}")
        
        print("\n====== LEADERBOARD ======")
        h = result.get('healthiest_product', {})
        lh = result.get('least_healthy_product', {})
        print(f"Healthiest: {h.get('name')} (Score: {h.get('score')})")
        print(f"Least Healthy: {lh.get('name')} (Score: {lh.get('score')})")

        print("\n====== COMMON TRENDS ======")
        print(f"Avg Processing: {result.get('average_processing_level')}")
        print(f"Top Concerns: {', '.join(result.get('most_common_concerns', []))}")
        print(f"Top Positives: {', '.join(result.get('most_common_positive_factors', []))}")
        
        print("\n====== AI GENERATED INSIGHTS (Llama 4 Scout) ======")
        print("Personalized Trends:")
        for t in result.get("personalized_trends", []):
            print(f" - {t}")
            
        print("\nRecommendations:")
        for r in result.get("recommendations", []):
            print(f" - {r}")

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
