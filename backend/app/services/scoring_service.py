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
        # 3. Run Deterministic Engines
        n_score, n_warn, n_flags = self.nutrition_engine.calculate(facts_obj)
        i_score, i_warn = self.ingredient_engine.calculate(ingredients_list)
        p_score, p_warn, p_flags = self.processing_engine.calculate(ingredients_list)
        c_score, c_warn, c_flags = self.compatibility_engine.calculate(user_profile, facts_obj, ingredients_list)
        timings["run_engines"] = (time.time() - t2) * 1000

        t3 = time.time()
        # 4. Calculate Overall Score
        overall_score = (n_score * 0.50) + (i_score * 0.20) + (c_score * 0.20) + (p_score * 0.10)
        overall_score = round(overall_score, 1)

        # 5. Classify & Aggregate Risks
        warnings, flags = risk_engine.process_warnings_and_flags(
            n_warn, n_flags, i_warn, p_warn, p_flags, c_warn, c_flags
        )
        classification = risk_engine.classify_score(overall_score, flags)
        timings["aggregation"] = (time.time() - t3) * 1000

        t4 = time.time()
        # 6. Store in Database
        food_score = db.query(FoodScore).filter(FoodScore.scan_id == scan_id).first()
        if not food_score:
            food_score = FoodScore(scan_id=scan_id)
            db.add(food_score)
            
        food_score.nutrition_score = n_score
        food_score.ingredient_score = i_score
        food_score.processing_score = p_score
        food_score.compatibility_score = c_score
        food_score.overall_score = overall_score
        food_score.classification = classification
        food_score.warnings = warnings
        food_score.flags = flags

        db.commit()
        timings["commit_score"] = (time.time() - t4) * 1000

        logger.info("--- SCORING BREAKDOWN ---")
        for k, v in timings.items():
            logger.info(f"  {k}: {v:.2f}ms")

        # 7. Return Schema
        return ScoreResponse(
            nutrition_score=n_score,
            ingredient_score=i_score,
            processing_score=p_score,
            compatibility_score=c_score,
            overall_score=overall_score,
            classification=classification,
            warnings=warnings,
            flags=flags
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
