import json
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from groq import AsyncGroq

from app.core.config import settings
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.services.profile_service import profile_service
from app.schemas.comparison import ComparisonResponse

logger = logging.getLogger(__name__)

class ComparisonService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_REASONING_MODEL
        if self.api_key and self.api_key != "dummy":
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None

    async def compare_products(self, db: Session, scan_id_1: UUID, scan_id_2: UUID, user_id: UUID) -> dict:
        if not self.client:
            raise ValueError("GROQ_API_KEY is missing. Comparison is disabled.")

        scan_1 = db.query(ScanHistory).filter(ScanHistory.id == scan_id_1).first()
        scan_2 = db.query(ScanHistory).filter(ScanHistory.id == scan_id_2).first()

        if not scan_1 or not scan_2:
            raise ValueError("One or both scans not found")
        if scan_1.user_id != user_id or scan_2.user_id != user_id:
            raise PermissionError("Forbidden: You do not own these scans")

        product_1 = db.query(Product).filter(Product.id == scan_1.product_id).first()
        product_2 = db.query(Product).filter(Product.id == scan_2.product_id).first()

        product_1_name = product_1.product_name if product_1 else "Product 1"
        product_2_name = product_2.product_name if product_2 else "Product 2"

        # Gather User Profile Context
        profile_dict = profile_service.get_profile(db, user_id)
        prof = profile_dict.get("profile")
        algy = profile_dict.get("allergies")
        
        extracted_allergies = []
        if algy:
            if getattr(algy, 'milk', False): extracted_allergies.append("milk")
            if getattr(algy, 'gluten', False): extracted_allergies.append("gluten")
            if getattr(algy, 'soy', False): extracted_allergies.append("soy")
            if getattr(algy, 'nuts', False): extracted_allergies.append("nuts")
            if getattr(algy, 'eggs', False): extracted_allergies.append("eggs")
            if getattr(algy, 'seafood', False): extracted_allergies.append("seafood")
            if getattr(algy, 'sesame', False): extracted_allergies.append("sesame")
            if getattr(algy, 'shellfish', False): extracted_allergies.append("shellfish")
            if getattr(algy, 'other_allergies', None): extracted_allergies.append(getattr(algy, 'other_allergies'))

        profile_context = {
            "health_goal": getattr(prof, "health_goal", None) if prof else None,
            "activity_level": getattr(prof, "activity_level", None) if prof else None,
            "diet_type": getattr(prof, "diet_type", None) if prof else None,
            "allergies": extracted_allergies
        }

        # Gather Scan Contexts
        def format_scan(scan):
            analysis = scan.analysis_json if scan.analysis_json else {}
            extracted = scan.extracted_json if scan.extracted_json else {}
            facts = extracted.get("nutrition_facts", {})
            return {
                "health_score": analysis.get("score") or analysis.get("overall_score"),
                "ingredient_quality_score": analysis.get("ingredient_quality_score", 100),
                "processing_assessment": analysis.get("processing_assessment", "Unknown"),
                "calories": facts.get("calories"),
                "protein": facts.get("protein"),
                "sugar": facts.get("sugar"),
                "fiber": facts.get("fiber"),
                "sodium": facts.get("sodium"),
                "ingredients": extracted.get("ingredients", []),
                "allergens": extracted.get("allergens", []),
                "key_findings": analysis.get("key_findings", []),
                "personalized_analysis": analysis.get("personalized_analysis", "")
            }

        scan_1_context = format_scan(scan_1)
        scan_2_context = format_scan(scan_2)

        prompt = f"""You are an intelligent nutrition comparison engine. Compare these two products strictly based on the User Profile.

USER PROFILE:
{json.dumps(profile_context, indent=2)}

COMPARISON RULES:
- Weight Loss: Prioritize lower sugar, higher fiber, penalize ultra-processed foods.
- Muscle Gain: Prioritize protein, nutrient density, penalize excessive sugar.
- Heart Health: Prioritize lower sodium, lower saturated fat.
- General Wellness: Balance all factors.
The winner MUST depend on the user's profile and goals.

PRODUCT 1 ({product_1_name}):
{json.dumps(scan_1_context, indent=2)}

PRODUCT 2 ({product_2_name}):
{json.dumps(scan_2_context, indent=2)}

Output valid JSON matching this schema exactly:
{{
  "winner": "product_1" | "product_2" | "tie",
  "overall_comparison_score": {{"product_1": int, "product_2": int}},
  "nutrition_comparison": {{"product_1_value": "str", "product_2_value": "str", "better_product": "product_1"|"product_2"|"tie", "reason": "str"}},
  "ingredient_comparison": {{"product_1_value": "str", "product_2_value": "str", "better_product": "product_1"|"product_2"|"tie", "reason": "str"}},
  "processing_comparison": {{"product_1_value": "str", "product_2_value": "str", "better_product": "product_1"|"product_2"|"tie", "reason": "str"}},
  "allergy_comparison": {{"product_1_value": "str", "product_2_value": "str", "better_product": "product_1"|"product_2"|"tie", "reason": "str"}},
  "strengths_product_1": ["str"],
  "strengths_product_2": ["str"],
  "weaknesses_product_1": ["str"],
  "weaknesses_product_2": ["str"],
  "personalized_recommendation": "str",
  "reasoning": "str"
}}
"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1
        )

        content = response.choices[0].message.content
        parsed = json.loads(content)
        
        # Inject real names into the JSON response for easier frontend rendering
        parsed["product_1_name"] = product_1_name
        parsed["product_2_name"] = product_2_name
        
        return parsed

comparison_service = ComparisonService()
