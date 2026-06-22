import asyncio
import os
import sys
from sqlalchemy.orm import Session
from uuid import uuid4

# Add the backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.services.scan_service import scan_service
from app.services.extraction_service import extraction_service
from app.models.user import User
from app.models.profile import UserProfile

async def main():
    db = SessionLocal()
    try:
        profile = db.query(UserProfile).first()
        if not profile:
            print("No profiles found in DB!")
            return
            
        user = db.query(User).filter(User.id == profile.user_id).first()
        
        # Mock the extraction service to return valid JSON
        original_extract = extraction_service.extract_data
        async def mock_extract(*args, **kwargs):
            return {
                "product_name": "Test Product",
                "brand_name": "Test Brand",
                "serving_size": "1 bar",
                "nutrition_facts": {
                    "calories": "250",
                    "protein_g": "12",
                    "sugar_g": "5",
                    "added_sugar_g": "0",
                    "fiber_g": "2",
                    "sodium_mg": "150"
                },
                "ingredients": ["whey protein", "cocoa", "stevia", "milk", "soy", "maltodextrin"],
                "allergens": ["milk", "soy"],
                "beneficial_ingredients": [
                    {"name": "whey protein", "benefit": "High quality protein"}
                ],
                "harmful_ingredients": [
                    {"name": "maltodextrin", "category": "Carbohydrate", "reason": "High glycemic index"}
                ],
                "food_additives": [],
                "preservatives": [],
                "artificial_colors": [],
                "artificial_sweeteners": ["stevia"],
                "raw_text": "whey protein cocoa stevia milk soy maltodextrin"
            }
        extraction_service.extract_data = mock_extract

        print(f"Running scan test for user {user.id}...")
        
        # We need a dummy image byte payload. We can read an existing image or just pass a tiny valid JPEG.
        # A tiny valid 1x1 JPEG bytes:
        dummy_jpeg = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x03\x02\x02\x02\x02\x02\x03\x02\x02\x02\x03\x03\x03\x03\x04\x06\x04\x04\x04\x04\x04\x08\x06\x06\x05\x06\t\x08\n\n\t\x08\t\t\n\x0c\x0f\x0c\n\x0b\x0e\x0b\t\t\r\x11\r\x0e\x0f\x10\x10\x11\x10\n\x0c\x12\x13\x12\x10\x13\x0f\x10\x10\x10\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xd2\xff\xd9'

        result = await scan_service.process_scan(db, user.id, dummy_jpeg, "jpg")
        
        # To avoid dumping huge base64 strings or DB objects, let's just print a clean summary
        print("SCAN COMPLETED SUCCESSFULLY")
        print(f"Scan ID: {result.get('scan_id')}")
        if "product" in result:
            print(f"Product Name: {result['product'].product_name}")
        
        if "analysis" in result:
            print("Score:", result["analysis"].get("health_score"))
            print("Classification:", result["analysis"].get("classification"))
            
    except Exception as e:
        print("EXCEPTION RAISED:")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
