from sqlalchemy.orm import Session
from sqlalchemy import func, desc, text
from app.models.user import User
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.models.food_score import FoodScore
from app.models.health_condition import HealthCondition
from app.models.allergy import Allergy
from datetime import datetime, timedelta
import uuid

class UserAnalyticsService:
    def get_dashboard_stats(self, db: Session, user_id: uuid.UUID) -> dict:
        total_scans = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).count()
        
        # Calculate score metrics
        scores = db.query(FoodScore).join(ScanHistory, ScanHistory.id == FoodScore.scan_id).filter(ScanHistory.user_id == user_id).all()
        
        avg_score = 0
        if len(scores) > 0:
            avg_score = sum(s.overall_score for s in scores) / len(scores)
            
        safe_foods = sum(1 for s in scores if s.classification and s.classification.upper() in ["SAFE", "EXCELLENT", "GOOD"])
        moderate_foods = sum(1 for s in scores if s.classification and s.classification.upper() in ["MODERATE", "FAIR"])
        avoid_foods = sum(1 for s in scores if s.classification and s.classification.upper() in ["AVOID", "POOR"])
        
        # Highest and Lowest
        highest_score = max([s.overall_score for s in scores], default=0)
        lowest_score = min([s.overall_score for s in scores], default=0)
        
        return {
            "total_scans": total_scans,
            "average_score": round(avg_score, 1),
            "highest_score": highest_score,
            "lowest_score": lowest_score,
            "safe_foods": safe_foods,
            "moderate_foods": moderate_foods,
            "avoid_foods": avoid_foods
        }

    def get_trends(self, db: Session, user_id: uuid.UUID) -> dict:
        # Get last 7 days of scan counts
        # Using SQLite/Postgres compatible string extraction
        scans = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).all()
        
        daily_counts = {}
        for scan in scans:
            date_str = scan.created_at.strftime("%Y-%m-%d")
            daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
            
        daily = [{"date": k, "count": v} for k, v in sorted(daily_counts.items())]
        
        # We can simulate score trend over time by sorting by date
        score_trend = []
        scores = db.query(FoodScore).join(ScanHistory, ScanHistory.id == FoodScore.scan_id).filter(ScanHistory.user_id == user_id).order_by(ScanHistory.created_at.asc()).limit(20).all()
        
        for s in scores:
            score_trend.append({"score": s.overall_score, "date": s.scan.created_at.strftime("%b %d")})

        return {
            "daily": daily,
            "score_trend": score_trend
        }

    def get_health_insights(self, db: Session, user_id: uuid.UUID) -> dict:
        from app.models.nutrition_fact import NutritionFact
        
        # Optimized N+1 Query: Calculate averages directly in database
        result = db.query(
            func.avg(NutritionFact.sugar).label('avg_sugar'),
            func.avg(NutritionFact.sodium).label('avg_sodium'),
            func.avg(NutritionFact.protein).label('avg_protein'),
            func.avg(NutritionFact.calories).label('avg_calories')
        ).select_from(ScanHistory)\
         .join(NutritionFact, NutritionFact.product_id == ScanHistory.product_id)\
         .filter(ScanHistory.user_id == user_id)\
         .first()
                
        scores = db.query(FoodScore).join(ScanHistory, ScanHistory.id == FoodScore.scan_id).filter(ScanHistory.user_id == user_id).all()
        
        flag_counts = {}
        for s in scores:
            for flag in s.flags:
                flag_counts[flag] = flag_counts.get(flag, 0) + 1
                
        common_flags = [{"flag": k, "count": v} for k, v in sorted(flag_counts.items(), key=lambda item: item[1], reverse=True)[:5]]
        
        return {
            "average_sugar_g": round(result.avg_sugar or 0, 1),
            "average_sodium_mg": round(result.avg_sodium or 0, 1),
            "average_protein_g": round(result.avg_protein or 0, 1),
            "average_calories": round(result.avg_calories or 0, 1),
            "common_risk_flags": common_flags
        }

user_analytics_service = UserAnalyticsService()
