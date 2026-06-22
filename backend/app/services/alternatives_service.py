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

        # Deterministic Rule-Based Alternative Generation
        health_goal = profile_context.get("health_goal", "General Wellness")
        if not health_goal:
            health_goal = "General Wellness"
            
        health_goal = str(health_goal).lower()
        
        # Base generic alternatives based on goal
        if "weight" in health_goal or "loss" in health_goal:
            alt1 = {"name": "Low-Calorie Variant of " + product_name, "category": "Similar Product Alternative", "reason": "Fewer calories and less sugar.", "benefits": ["Reduced Calories", "Less Sugar"], "expected_improvement": "Helps maintain a caloric deficit.", "goal_alignment": "Supports weight loss by reducing empty calories."}
            alt2 = {"name": "Greek Yogurt or Protein-Rich Snack", "category": "Higher Quality Alternative", "reason": "Higher protein promotes satiety.", "benefits": ["High Protein", "Filling"], "expected_improvement": "Keeps you full longer, reducing overall intake.", "goal_alignment": "Improves macronutrient ratio for weight management."}
            alt3 = {"name": "Fresh Apple with Almonds", "category": "Whole Food Alternative", "reason": "Natural fiber and healthy fats.", "benefits": ["High Fiber", "Micronutrients"], "expected_improvement": "Provides steady energy without insulin spikes.", "goal_alignment": "Whole foods support sustainable weight loss."}
        elif "muscle" in health_goal or "gain" in health_goal:
            alt1 = {"name": "High-Protein Variant of " + product_name, "category": "Similar Product Alternative", "reason": "More protein per serving.", "benefits": ["More Protein", "Muscle Repair"], "expected_improvement": "Provides more building blocks for muscle.", "goal_alignment": "Directly supports muscle protein synthesis."}
            alt2 = {"name": "Whey or Plant Protein Isolate", "category": "Higher Quality Alternative", "reason": "Optimized amino acid profile.", "benefits": ["High Bioavailability", "Fast Absorbing"], "expected_improvement": "Maximizes recovery post-workout.", "goal_alignment": "Essential for muscle hypertrophy."}
            alt3 = {"name": "Chicken Breast or Eggs", "category": "Whole Food Alternative", "reason": "Complete protein source from whole foods.", "benefits": ["Complete Amino Acids", "Satiety"], "expected_improvement": "Provides high-quality whole-food protein.", "goal_alignment": "The gold standard for muscle gain."}
        elif "heart" in health_goal or "cardio" in health_goal:
            alt1 = {"name": "Low-Sodium Variant of " + product_name, "category": "Similar Product Alternative", "reason": "Less sodium reduces blood pressure strain.", "benefits": ["Low Sodium", "Heart Safe"], "expected_improvement": "Reduces cardiovascular stress.", "goal_alignment": "Directly supports healthy blood pressure."}
            alt2 = {"name": "Oat-Based Alternative", "category": "Higher Quality Alternative", "reason": "Beta-glucans help lower cholesterol.", "benefits": ["Heart Healthy Fiber", "Low Saturated Fat"], "expected_improvement": "Actively improves lipid profile.", "goal_alignment": "Addresses cholesterol and heart health."}
            alt3 = {"name": "Walnuts or Chia Seeds", "category": "Whole Food Alternative", "reason": "Rich in Omega-3 fatty acids.", "benefits": ["Omega-3s", "Anti-inflammatory"], "expected_improvement": "Reduces inflammation and supports heart rhythm.", "goal_alignment": "Clinically proven to support heart health."}
        elif "diabet" in health_goal or "sugar" in health_goal:
            alt1 = {"name": "Zero-Sugar Variant of " + product_name, "category": "Similar Product Alternative", "reason": "No added sugar minimizes insulin spikes.", "benefits": ["No Sugar Crash", "Stable Energy"], "expected_improvement": "Prevents rapid blood glucose elevation.", "goal_alignment": "Crucial for glycemic control."}
            alt2 = {"name": "High-Fiber Grain Alternative", "category": "Higher Quality Alternative", "reason": "Fiber slows glucose absorption.", "benefits": ["Slow Digestion", "Satiety"], "expected_improvement": "Provides a steadier, slower release of energy.", "goal_alignment": "Improves insulin sensitivity."}
            alt3 = {"name": "Berries and Nuts", "category": "Whole Food Alternative", "reason": "Low glycemic index with high nutrients.", "benefits": ["Low GI", "Antioxidants"], "expected_improvement": "Satisfies cravings without spiking blood sugar.", "goal_alignment": "Ideal snack for diabetes management."}
        else:
            alt1 = {"name": "Organic/Natural Variant of " + product_name, "category": "Similar Product Alternative", "reason": "Fewer artificial additives.", "benefits": ["Cleaner Ingredients", "Fewer Chemicals"], "expected_improvement": "Reduces intake of ultra-processed compounds.", "goal_alignment": "Supports overall clean eating."}
            alt2 = {"name": "Artisan/Minimal Ingredient Alternative", "category": "Higher Quality Alternative", "reason": "Simpler, more recognizable ingredients.", "benefits": ["Transparent Sourcing", "Better Digestion"], "expected_improvement": "Easier for the body to process.", "goal_alignment": "Aligns with a holistic approach to wellness."}
            alt3 = {"name": "Mixed Veggies or Mixed Fruit", "category": "Whole Food Alternative", "reason": "Maximum natural nutrition.", "benefits": ["Vitamins & Minerals", "Fiber"], "expected_improvement": "Provides unadulterated natural nutrition.", "goal_alignment": "The foundation of general wellness."}

        parsed = {
            "alternatives": [alt1, alt2, alt3]
        }
        
        # Save back to analysis_json
        analysis_json["alternatives"] = parsed
        scan.analysis_json = analysis_json
        db.commit()
        
        return parsed

alternatives_service = AlternativesService()
