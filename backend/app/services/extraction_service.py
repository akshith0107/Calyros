import json
import logging
from typing import Dict, Any
import time
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)

class ExtractionService:
    def __init__(self):
        self.api_key = settings.GOOGLE_API_KEY
        
        if not self.api_key or self.api_key == "dummy":
            logger.warning("GOOGLE_API_KEY is missing. Extraction will fail if called.")
            self.client = None
        else:
            self.client = genai.Client(api_key=self.api_key)
            
        self.model = settings.GEMINI_MODEL
        
        self.system_prompt = """
You are an advanced Nutrition Label OCR System.

Step 1:
Extract all visible text from the nutrition label image.

Step 2:
Identify and extract:
- Product Name
- Brand Name
- Serving Size
- Calories
- Macronutrients
- Vitamins
- Minerals
- Ingredients (as a simple list of strings)
- Allergens
- Food Additives

Return ONLY valid JSON exactly matching this schema:
{
  "product_name": "",
  "brand_name": "",
  "serving_size": "",
  "nutrition_facts": {
    "calories": "",
    "protein_g": "",
    "fat_g": "",
    "saturated_fat_g": "",
    "trans_fat_g": "",
    "carbohydrates_g": "",
    "fiber_g": "",
    "sugar_g": "",
    "added_sugar_g": "",
    "sodium_mg": ""
  },
  "ingredients": [],
  "allergens": [],
  "food_additives": [],
  "raw_text": ""
}

Rules:
- Extract information exactly as shown.
- Do not hallucinate ingredients.
- Return JSON only.
"""

    async def extract_data(self, file_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Passes the image bytes to Gemini 2.5 Flash to extract structured JSON.
        """
        if not self.client:
            raise ValueError("GOOGLE_API_KEY is invalid. Cannot perform extraction.")

        logger.info("Stage 1: Starting Gemini 2.5 Flash Extraction")
        
        start_time = time.time()

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model,
                contents=[
                    self.system_prompt,
                    types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                )
            )
            
            content = response.text
            
            # Parse JSON
            parsed_json = json.loads(content)
            
            duration = time.time() - start_time
            logger.info(f"Stage 1 Extraction Complete in {duration:.2f}s")
            logger.debug(f"Extraction Output: {json.dumps(parsed_json)}")
            
            return parsed_json

        except Exception as e:
            logger.error(f"Extraction Service Error: {str(e)}")
            raise RuntimeError(f"Failed to extract structured data from image: {e}") from e

extraction_service = ExtractionService()
