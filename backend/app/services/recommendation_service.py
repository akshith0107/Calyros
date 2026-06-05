import json
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.redis import redis_client
from app.models.ai_recommendation import AIRecommendation
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.models.nutrition_fact import NutritionFact
from app.models.food_score import FoodScore
from app.services.profile_service import profile_service
from app.services.health_advisor import health_advisor
from app.services.ingredient_explainer import ingredient_explainer
from app.services.alternative_service import alternative_service
from app.schemas.recommendation import RecommendationResponse

logger = logging.getLogger(__name__)

class RecommendationService:
    async def generate_recommendation(self, db: Session, scan_id: UUID, user_id: UUID) -> RecommendationResponse:
        # 1. Check Redis Cache
        cache_key = f"recommendation:{scan_id}"
        redis = redis_client.get_client()
        
        if redis:
            cached = await redis.get(cache_key)
            if cached:
                logger.info(f"Cache Hit for recommendation: {scan_id}")
                return RecommendationResponse.model_validate_json(cached)
                
            logger.info(f"Cache Miss for recommendation: {scan_id}")
        else:
            logger.warning("Redis not available. Skipping cache read.")

        # 2. Check Database for existing recommendation
        existing = db.query(AIRecommendation).filter(AIRecommendation.scan_id == scan_id).first()
        if existing:
            resp = RecommendationResponse.model_validate(existing)
            if redis:
                await redis.setex(cache_key, 86400, resp.model_dump_json())
            return resp

        # 3. Gather Data
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")
            
        product = db.query(Product).filter(Product.id == scan.product_id).first()
        facts = db.query(NutritionFact).filter(NutritionFact.product_id == product.id).first()
        ingredients = [i.ingredient_name for i in product.ingredients]
        score = db.query(FoodScore).filter(FoodScore.scan_id == scan_id).first()
        profile = profile_service.get_profile(db, user_id)

        # 4. Generate AI Advice
        score_data = {
            "overall_score": score.overall_score,
            "classification": score.classification,
            "warnings": score.warnings,
            "flags": score.flags
        }
        
        facts_dict = {k: v for k, v in facts.__dict__.items() if not k.startswith('_')} if facts else {}
        
        # profile is a dict that might contain SQLAlchemy models like 'user'
        profile_dict = {}
        if isinstance(profile, dict):
            for k, v in profile.items():
                if hasattr(v, '__dict__'):
                    profile_dict[k] = {ik: iv for ik, iv in v.__dict__.items() if not ik.startswith('_')}
                else:
                    profile_dict[k] = v
        else:
            profile_dict = profile
        
        # In a real async scenario, we can run these concurrently. Running sequentially here for simplicity.
        advice = await health_advisor.generate_advice(
            profile=profile_dict,
            facts=facts_dict,
            ingredients=ingredients,
            score_data=score_data
        )
        
        explanations = await ingredient_explainer.explain_ingredients(ingredients)
        alternatives = alternative_service.get_healthier_alternatives(db, score.overall_score)

        # 5. Persist to Database
        recommendation = AIRecommendation(
            scan_id=scan_id,
            health_summary=advice.get("health_summary"),
            positives=advice.get("positives", []),
            concerns=advice.get("concerns", []),
            ingredient_explanations=explanations,
            alternatives=alternatives,
            consumption_guidance=advice.get("consumption_guidance"),
            ai_summary=advice.get("ai_summary")
        )
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)

        # 6. Cache and Return
        resp = RecommendationResponse.model_validate(recommendation)
        if redis:
            await redis.setex(cache_key, 86400, resp.model_dump_json())
        
        return resp

    def get_recommendation(self, db: Session, scan_id: UUID, user_id: UUID) -> RecommendationResponse:
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")
            
        rec = db.query(AIRecommendation).filter(AIRecommendation.scan_id == scan_id).first()
        if not rec:
            raise ValueError("Recommendation not found")
        return RecommendationResponse.model_validate(rec)

recommendation_service = RecommendationService()
