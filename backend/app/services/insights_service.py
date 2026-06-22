import json
import logging
from collections import Counter
from uuid import UUID
from sqlalchemy.orm import Session
from groq import AsyncGroq

from app.core.config import settings
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.services.profile_service import profile_service

logger = logging.getLogger(__name__)

class InsightsService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_REASONING_MODEL
        if self.api_key and self.api_key != "dummy":
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None

    async def generate_insights(self, db: Session, user_id: UUID) -> dict:
        if not self.client:
            raise ValueError("GROQ_API_KEY is missing. Insights Generation disabled.")
        scans = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).all()
        
        if not scans:
            return {
                "average_health_score": 0,
                "healthiest_product": None,
                "least_healthy_product": None,
                "most_common_concerns": [],
                "most_common_positive_factors": [],
                "most_common_allergens": [],
                "average_processing_level": "Unknown",
                "top_nutrients_consumed": [],
                "scan_statistics": {
                    "total_scans": 0,
                    "excellent_products": 0,
                    "good_products": 0,
                    "moderate_products": 0,
                    "poor_products": 0
                },
                "personalized_trends": [],
                "recommendations": []
            }

        product_ids = [s.product_id for s in scans]
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        product_map = {p.id: p.product_name for p in products}

        total_score = 0
        valid_scores = 0
        
        healthiest = None
        least_healthy = None
        
        classification_counts = {"Excellent": 0, "Good": 0, "Moderate": 0, "Poor": 0, "Avoid": 0}
        
        all_concerns = []
        all_positives = []
        all_allergens = []
        all_processing = []
        all_ingredient_issues = []
        
        nutrient_totals = {"sugar": 0, "protein": 0, "fiber": 0, "sodium": 0, "calories": 0}

        aggregated_scan_context = []

        for scan in scans:
            analysis = scan.analysis_json or {}
            extracted = scan.extracted_json or {}
            
            score = analysis.get("score") or analysis.get("overall_score")
            prod_name = product_map.get(scan.product_id, "Unknown")

            if score is not None:
                total_score += score
                valid_scores += 1
                
                if healthiest is None or score > healthiest["score"]:
                    healthiest = {"name": prod_name, "score": score}
                if least_healthy is None or score < least_healthy["score"]:
                    least_healthy = {"name": prod_name, "score": score}

            cls = analysis.get("classification")
            if cls in classification_counts:
                classification_counts[cls] += 1
            elif score is not None:
                if score >= 80: classification_counts["Excellent"] += 1
                elif score >= 60: classification_counts["Good"] += 1
                elif score >= 40: classification_counts["Moderate"] += 1
                else: classification_counts["Poor"] += 1

            all_concerns.extend(analysis.get("concerns", []))
            all_positives.extend(analysis.get("positive_factors", []) + analysis.get("positiveFactors", []))
            
            all_allergens.extend(extracted.get("allergens", []))
            all_ingredient_issues.extend(analysis.get("ingredient_findings", []))
            
            proc = analysis.get("processing_assessment")
            if proc:
                all_processing.append(proc)
                
            facts = extracted.get("nutrition_facts", {})
            for nut in ["sugar", "protein", "fiber", "sodium", "calories"]:
                val = facts.get(nut)
                if isinstance(val, (int, float)):
                    nutrient_totals[nut] += val
            
            aggregated_scan_context.append({
                "name": prod_name,
                "score": score,
                "sugar": facts.get("sugar"),
                "protein": facts.get("protein"),
                "fiber": facts.get("fiber"),
                "processing": proc
            })

        avg_score = round(total_score / valid_scores) if valid_scores > 0 else 0
        
        def get_top_n(items, n=3):
            return [k for k, v in Counter(items).most_common(n)]

        most_common_proc = Counter(all_processing).most_common(1)
        avg_processing = most_common_proc[0][0] if most_common_proc else "Unknown"

        # Nutrient ranking
        top_nutrients = [{"name": k.capitalize(), "amount": v} for k, v in nutrient_totals.items() if v > 0]
        top_nutrients.sort(key=lambda x: x["amount"], reverse=True)

        # Profile context
        profile_dict = profile_service.get_profile(db, user_id)
        prof = profile_dict.get("profile")
        health_goal = getattr(prof, "health_goal", "general") if prof else "general"

        if self.client:
            prompt = f"""You are the Calyros AI Insights Engine. Analyze the user's aggregated scan history and identify personalized trends, improvement opportunities, and recommendations.

USER GOAL: {health_goal}

AGGREGATED SCANS (Partial snapshot):
{json.dumps(aggregated_scan_context, indent=2)}

AVERAGE HEALTH SCORE: {avg_score}
TOTAL SCANS: {len(scans)}

LOGIC RULES:
- Weight Loss: Detect high sugar patterns and frequent ultra-processed foods. Focus recommendations on calorie density and fiber.
- Muscle Gain: Detect protein intake trends and deficiencies. Focus recommendations on protein sources.
- Heart Health: Detect sodium and saturated fat trends.
- Diabetes: Detect recurring sugar-heavy foods and glycemic load.

CRITICAL INSTRUCTION:
Generate insights using quantified, explicit sentences. For example: "67% of your scanned products contain added sugar.", "Your average product score is {avg_score}.", "Most of your scans are classified as Ultra-Processed."

Output strictly valid JSON matching this exact schema:
{{
  "personalized_trends": ["Quantified Trend 1", "Quantified Trend 2"],
  "improvement_opportunities": ["Opportunity 1", "Opportunity 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}
"""
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "system", "content": prompt}],
                    response_format={"type": "json_object"},
                    temperature=0.2
                )
                content = response.choices[0].message.content
                llm_output = json.loads(content)
                personalized_trends = llm_output.get("personalized_trends", [])
                improvement_opportunities = llm_output.get("improvement_opportunities", [])
                recommendations = llm_output.get("recommendations", [])
            except Exception as e:
                logger.error(f"Failed to generate LLM insights: {e}")
                personalized_trends = ["Insufficient data for trends."]
                improvement_opportunities = ["Scan more products to discover weaknesses."]
                recommendations = ["Keep logging your food to get personalized recommendations."]
        else:
            personalized_trends = []
            improvement_opportunities = []
            recommendations = []

        return {
            "average_health_score": avg_score,
            "healthiest_product": healthiest or {},
            "least_healthy_product": least_healthy or {},
            "most_common_concerns": get_top_n(all_concerns, 5),
            "most_common_positive_factors": get_top_n(all_positives, 5),
            "most_common_allergens": get_top_n(all_allergens, 5),
            "average_processing_level": avg_processing,
            "top_nutrients_consumed": top_nutrients,
            "top_ingredient_patterns": get_top_n(all_ingredient_issues, 5),
            "scan_statistics": {
                "total_scans": len(scans),
                "excellent_products": classification_counts.get("Excellent", 0),
                "good_products": classification_counts.get("Good", 0),
                "moderate_products": classification_counts.get("Moderate", 0),
                "poor_products": classification_counts.get("Poor", 0) + classification_counts.get("Avoid", 0)
            },
            "personalized_trends": personalized_trends,
            "improvement_opportunities": improvement_opportunities,
            "recommendations": recommendations
        }

insights_service = InsightsService()
