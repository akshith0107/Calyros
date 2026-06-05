import json
import logging
from typing import Dict, Any
import time
from groq import AsyncGroq
from app.core.config import settings

logger = logging.getLogger(__name__)

class ExtractionService:
    def __init__(self):
        # We use Groq's fast inference for Llama 4 Scout
        self.primary_key = settings.GROQ_API_KEY_SCOUT
        self.backup_key = settings.GROQ_API_KEY_BACKUP
        
        if not self.primary_key or self.primary_key == "dummy":
            logger.warning("GROQ_API_KEY_SCOUT is missing. Extraction will fail if called.")
            self.client = None
        else:
            self.client = AsyncGroq(api_key=self.primary_key)
            
        # Hardcoding the requested model from settings
        self.model = settings.GROQ_MODEL_SCOUT
        
        self.system_prompt = """
You are a highly precise data extraction assistant. 
I will provide you with messy OCR text extracted from a product's nutrition label.
Your job is to parse this text and return a STRICT JSON object matching the exact schema below.

REQUIRED SCHEMA:
{
  "product_name": "string (extract exactly as stated, or return null if not found)",
  "serving_size": "string",
  "ingredients": ["string", "string"],
  "nutrition_facts": {
    "calories": number or null,
    "protein_g": number or null,
    "fat_g": number or null,
    "carbs_g": number or null,
    "sugar_g": number or null,
    "fiber_g": number or null,
    "sodium_mg": number or null
  }
}

RULES:
1. Return ONLY the JSON object. Do not include markdown formatting like ```json.
2. If a specific nutrition fact is missing, return null for that field.
3. Attempt to correct obvious OCR spelling mistakes in ingredients.
"""

    async def extract_data(self, ocr_text: str) -> Dict[str, Any]:
        """
        Passes the OCR text to Llama 4 Scout to extract structured JSON.
        """
        if not self.client:
            raise ValueError("GROQ_API_KEY is invalid. Cannot perform extraction.")

        logger.info("Stage 1: Starting Llama 4 Scout Extraction")
        logger.debug(f"Input OCR Text Length: {len(ocr_text)}")
        
        start_time = time.time()

        try:
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": self.system_prompt},
                        {"role": "user", "content": f"OCR TEXT:\n{ocr_text}"}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.1
                )
            except Exception as initial_error:
                # Basic check for rate limit or auth error
                err_str = str(initial_error).lower()
                if "rate limit" in err_str or "429" in err_str or "too many requests" in err_str:
                    if self.backup_key and self.backup_key != "dummy":
                        logger.warning("Stage 1 rate limited. Falling back to GROQ_API_KEY_BACKUP.")
                        backup_client = AsyncGroq(api_key=self.backup_key)
                        response = await backup_client.chat.completions.create(
                            model=self.model,
                            messages=[
                                {"role": "system", "content": self.system_prompt},
                                {"role": "user", "content": f"OCR TEXT:\n{ocr_text}"}
                            ],
                            response_format={"type": "json_object"},
                            temperature=0.1
                        )
                    else:
                        raise initial_error
                else:
                    raise initial_error
            
            content = response.choices[0].message.content
            
            # Groq JSON mode ensures valid JSON, but let's parse safely
            parsed_json = json.loads(content)
            
            duration = time.time() - start_time
            logger.info(f"Stage 1 Extraction Complete in {duration:.2f}s")
            logger.debug(f"Extraction Output: {json.dumps(parsed_json)}")
            
            return parsed_json

        except Exception as e:
            logger.error(f"Extraction Service Error: {str(e)}")
            raise RuntimeError(f"Failed to extract structured data from OCR text: {e}") from e

extraction_service = ExtractionService()
