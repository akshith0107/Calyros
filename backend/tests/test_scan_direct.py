import asyncio
import os
import sys
from sqlalchemy.orm import Session
from uuid import uuid4

# Add the backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal
from app.services.scan_service import scan_service
from app.services.ocr_service import ocr_service
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
        
        # Mock the OCR service to return a valid nutrition label string so it passes
        original_extract = ocr_service.extract_text
        async def mock_extract(*args, **kwargs):
            return "Nutrition Facts\nCalories 250\nProtein 12g\nSugar 5g\nIngredients: Whey protein, cocoa, stevia, milk, soy."
        ocr_service.extract_text = mock_extract

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
