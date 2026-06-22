import json
import os
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any

from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.models.nutrition_fact import NutritionFact
from app.models.food_score import FoodScore
from app.services.profile_service import profile_service

from app.services.nutrition_score_engine import NutritionScoreEngine
from app.services.ingredient_score_engine import IngredientScoreEngine
from app.services.processing_engine import ProcessingEngine
from app.services.compatibility_engine import CompatibilityEngine
from app.services.risk_engine import risk_engine
from app.schemas.score import ScoreResponse

class ScoringService:
    def __init__(self):
        # Load rules from JSON
        rules_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "config", "scoring_rules.json")
        with open(rules_path, 'r') as f:
            rules = json.load(f)
            
        self.nutrition_engine = NutritionScoreEngine(rules)
        self.ingredient_engine = IngredientScoreEngine(rules)
        self.processing_engine = ProcessingEngine(rules)
        self.compatibility_engine = CompatibilityEngine(rules)

    def calculate_score(self, db: Session, scan_id: UUID, user_id: UUID, 
                        scan_history=None, product=None, facts=None, ingredients=None) -> ScoreResponse:
        import time
        import logging
        from app.services.nutrition_intelligence_engine import NutritionIntelligenceEngine
        from app.models.allergy import Allergy
        
        logger = logging.getLogger(__name__)
        timings = {}
        
        t0 = time.time()
        # 1. Fetch Scan Data
        scan = scan_history or db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")
            
        timings["fetch_scan_data"] = (time.time() - t0) * 1000

        t1 = time.time()
        # 2. Fetch User Profile
        user_profile = profile_service.get_profile(db, user_id)
        user_allergy = db.query(Allergy).filter(Allergy.user_id == user_id).first()
        timings["fetch_profile"] = (time.time() - t1) * 1000

        t2 = time.time()
        # 3. Run Nutrition Intelligence Engine
        parsed_data = scan.extracted_json if scan.extracted_json else {}
        analysis = NutritionIntelligenceEngine.analyze(parsed_data, user_profile, user_allergy)
        timings["run_engines"] = (time.time() - t2) * 1000

        t4 = time.time()
        # 4. Store in Database
        food_score = db.query(FoodScore).filter(FoodScore.scan_id == scan_id).first()
        if not food_score:
            food_score = FoodScore(scan_id=scan_id)
            db.add(food_score)
            
        food_score.overall_score = analysis["score"]
        food_score.classification = analysis["classification"]
        food_score.flags = analysis["concerns"]
        food_score.warnings = []
        
        # We can store the full analysis block in nutrition_breakdown
        food_score.nutrition_breakdown = {
            "key_findings": analysis["key_findings"],
            "positive_factors": analysis["positive_factors"],
            "concerns": analysis["concerns"],
            "allergy_analysis": analysis["allergy_analysis"],
            "ingredient_quality_score": analysis.get("ingredient_quality_score", 100.0),
            "ingredient_findings": analysis.get("ingredient_findings", []),
            "processing_assessment": analysis.get("processing_assessment", "Unknown")
        }
        food_score.personalized_analysis = analysis["personalized_analysis"]
        food_score.recommendations = analysis["recommendations"]

        db.commit()
        timings["commit_score"] = (time.time() - t4) * 1000

        logger.info("--- SCORING BREAKDOWN ---")
        for k, v in timings.items():
            logger.info(f"  {k}: {v:.2f}ms")

        # 5. Return Schema exactly matching the new ScoreResponse
        return ScoreResponse(
            score=analysis["score"],
            classification=analysis["classification"],
            nutrition_facts=parsed_data.get("nutrition_facts", {}),
            all_detected_nutrients=parsed_data.get("all_detected_nutrients", []),
            vitamins=parsed_data.get("vitamins", []),
            minerals=parsed_data.get("minerals", []),
            ingredients=parsed_data.get("ingredients", []),
            allergens=parsed_data.get("allergens", []),
            additives=parsed_data.get("additives", []),
            key_findings=analysis["key_findings"],
            positive_factors=analysis["positive_factors"],
            concerns=analysis["concerns"],
            allergy_analysis=analysis["allergy_analysis"],
            personalized_analysis=analysis["personalized_analysis"],
            recommendations=analysis["recommendations"],
            ingredient_quality_score=analysis.get("ingredient_quality_score", 100.0),
            ingredient_findings=analysis.get("ingredient_findings", []),
            processing_assessment=analysis.get("processing_assessment", "Unknown")
        )

    def get_score(self, db: Session, scan_id: UUID, user_id: UUID) -> ScoreResponse:
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")
            
        score = db.query(FoodScore).filter(FoodScore.scan_id == scan_id).first()
        if not score:
            raise ValueError("Score not found")
            
        parsed_data = scan.extracted_json if scan.extracted_json else {}
        brk = score.nutrition_breakdown if score.nutrition_breakdown else {}
            
        return ScoreResponse(
            score=score.overall_score or 0.0,
            classification=score.classification or "Unknown",
            nutrition_facts=parsed_data.get("nutrition_facts", {}),
            all_detected_nutrients=parsed_data.get("all_detected_nutrients", []),
            vitamins=parsed_data.get("vitamins", []),
            minerals=parsed_data.get("minerals", []),
            ingredients=parsed_data.get("ingredients", []),
            allergens=parsed_data.get("allergens", []),
            additives=parsed_data.get("additives", []),
            key_findings=brk.get("key_findings", []),
            positive_factors=brk.get("positive_factors", []),
            concerns=brk.get("concerns", []),
            allergy_analysis=brk.get("allergy_analysis", {}),
            personalized_analysis=score.personalized_analysis or "",
            recommendations=score.recommendations or [],
            ingredient_quality_score=brk.get("ingredient_quality_score", 100.0),
            ingredient_findings=brk.get("ingredient_findings", []),
            processing_assessment=brk.get("processing_assessment", "Unknown")
        )

scoring_service = ScoringService()
