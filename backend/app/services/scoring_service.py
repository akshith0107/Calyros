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
        logger = logging.getLogger(__name__)
        timings = {}
        
        t0 = time.time()
        # 1. Fetch Scan & Product Data
        scan = scan_history or db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")
            
        product_obj = product or db.query(Product).filter(Product.id == scan.product_id).first()
        facts_obj = facts or db.query(NutritionFact).filter(NutritionFact.product_id == product_obj.id).first()
        ingredients_list = ingredients if ingredients is not None else product_obj.ingredients
        timings["fetch_scan_data"] = (time.time() - t0) * 1000

        t1 = time.time()
        # 2. Fetch User Profile
        user_profile = profile_service.get_profile(db, user_id)
        timings["fetch_profile"] = (time.time() - t1) * 1000

        t2 = time.time()
        # 3. Run Nutrition Intelligence Engine (Deterministic)
        from app.services.intelligence_engine import NutritionIntelligenceEngine
        from app.models.allergy import Allergy
        user_allergy = db.query(Allergy).filter(Allergy.user_id == user_id).first()
        analysis = NutritionIntelligenceEngine.analyze(facts_obj, ingredients_list, user_profile, product_obj, user_allergy)
        
        overall_score = analysis["total_score"]
        classification = analysis["classification"]
        timings["run_engines"] = (time.time() - t2) * 1000

        t3 = time.time()
        # Skip legacy aggregation
        timings["aggregation"] = (time.time() - t3) * 1000

        t4 = time.time()
        # 6. Store in Database
        food_score = db.query(FoodScore).filter(FoodScore.scan_id == scan_id).first()
        if not food_score:
            food_score = FoodScore(scan_id=scan_id)
            db.add(food_score)
            
        food_score.overall_score = overall_score
        food_score.classification = classification
        food_score.flags = analysis["flags"]
        food_score.warnings = []
        
        food_score.nutrition_breakdown = analysis["nutrition_breakdown"]
        food_score.score_breakdown = analysis["score_breakdown"]
        food_score.personalized_analysis = analysis["personalized_analysis"]
        food_score.recommendations = analysis["recommendations"]

        db.commit()
        timings["commit_score"] = (time.time() - t4) * 1000

        logger.info("--- SCORING BREAKDOWN ---")
        for k, v in timings.items():
            logger.info(f"  {k}: {v:.2f}ms")

        # 7. Return Schema
        return ScoreResponse(
            overall_score=overall_score,
            classification=classification,
            warnings=[],
            flags=analysis["flags"],
            nutrition_breakdown=analysis["nutrition_breakdown"],
            score_breakdown=analysis["score_breakdown"],
            personalized_analysis=analysis["personalized_analysis"],
            recommendations=analysis["recommendations"]
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
            
        return ScoreResponse.model_validate(score)

scoring_service = ScoringService()
