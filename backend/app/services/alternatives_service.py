import json
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from groq import AsyncGroq

from app.core.config import settings
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.services.profile_service import profile_service
from app.schemas.alternatives import AlternativesResponse

logger = logging.getLogger(__name__)

class AlternativesService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_REASONING_MODEL
        if self.api_key and self.api_key != "dummy":
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None

    async def get_alternatives(self, db: Session, scan_id: UUID, user_id: UUID) -> dict:
        if not self.client:
            raise ValueError("GROQ_API_KEY is missing. Alternatives Engine disabled.")

        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")

        # If alternatives are already generated, return them immediately
        analysis_json = scan.analysis_json or {}
        if "alternatives" in analysis_json:
            return analysis_json["alternatives"]

        product = db.query(Product).filter(Product.id == scan.product_id).first()
        product_name = product.product_name if product else "Unknown Product"

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

        extracted = scan.extracted_json if scan.extracted_json else {}
        facts = extracted.get("nutrition_facts", {})
        
        scan_context = {
            "health_score": analysis_json.get("score") or analysis_json.get("overall_score"),
            "ingredient_quality_score": analysis_json.get("ingredient_quality_score", 100),
            "processing_assessment": analysis_json.get("processing_assessment", "Unknown"),
            "calories": facts.get("calories"),
            "protein": facts.get("protein"),
            "sugar": facts.get("sugar"),
            "fiber": facts.get("fiber"),
            "sodium": facts.get("sodium"),
            "ingredients": extracted.get("ingredients", []),
            "allergens": extracted.get("allergens", []),
            "key_findings": analysis_json.get("key_findings", []),
        }

        prompt = f"""You are the Calyros AI Alternatives Engine. The user just scanned a product with a health score of {scan_context['health_score']}. 
Your job is to suggest 3 healthier, realistic alternatives tailored to their goals.

USER PROFILE:
{json.dumps(profile_context, indent=2)}

SCANNED PRODUCT: {product_name}
{json.dumps(scan_context, indent=2)}

LOGIC RULES:
- Weight Loss: Suggest alternatives with lower sugar, higher fiber, and less processing.
- Muscle Gain: Suggest alternatives with higher protein density and better protein sources.
- Heart Health: Suggest alternatives with lower sodium and better fat profiles.
- Diabetes: Suggest alternatives with lower added sugar and glycemic load.
- General Wellness: Suggest whole-food alternatives and less processed options.
- Allergy Safety: NEVER suggest products containing the user's allergens ({', '.join(extracted_allergies) if extracted_allergies else 'None'}).

CRITICAL INSTRUCTION:
Provide exactly 3 alternatives.
Alternative 1 MUST be a "Similar Product Alternative" (e.g., Natural Peanut Butter instead of Nutella).
Alternative 2 MUST be a "Higher Quality Alternative" (e.g., Almond Butter instead of Nutella).
Alternative 3 MUST be a "Whole Food Alternative" (e.g., Whole Almonds instead of Nutella).

Output strictly valid JSON matching this exact schema:
{{
  "alternatives": [
    {{
      "name": "Alternative Name",
      "category": "Similar Product Alternative | Higher Quality Alternative | Whole Food Alternative",
      "reason": "Why it is better based on the user's goal.",
      "benefits": ["Benefit 1", "Benefit 2"],
      "expected_improvement": "A brief sentence on the expected improvement over the scanned product.",
      "goal_alignment": "How this aligns with the user's specific health goal."
    }}
  ]
}}
"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2
        )

        content = response.choices[0].message.content
        parsed = json.loads(content)
        
        # Save back to analysis_json
        analysis_json["alternatives"] = parsed
        scan.analysis_json = analysis_json
        db.commit()
        
        return parsed

alternatives_service = AlternativesService()
