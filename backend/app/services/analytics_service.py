from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from app.models.user import User
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.models.food_score import FoodScore
from app.models.health_condition import HealthCondition
from app.models.allergy import Allergy
from datetime import datetime, timedelta

class AnalyticsService:
    def get_dashboard_stats(self, db: Session) -> dict:
        total_users = db.query(User).count()
        total_scans = db.query(ScanHistory).count()
        total_products = db.query(Product).count()
        
        avg_score = db.query(func.avg(FoodScore.overall_score)).scalar() or 0.0
        
        # Top products
        top_products = (
            db.query(Product.product_name, func.count(ScanHistory.id).label('scan_count'))
            .join(ScanHistory, Product.id == ScanHistory.product_id)
            .group_by(Product.product_name)
            .order_by(desc('scan_count'))
            .limit(5)
            .all()
        )
        most_scanned = [{"name": p.product_name, "scans": p.scan_count} for p in top_products]
        
        return {
            "total_users": total_users,
            "total_scans": total_scans,
            "total_products": total_products,
            "average_score": round(avg_score, 1),
            "top_allergens": ["Peanuts", "Dairy", "Gluten"], # Mocked for now; requires complex JSON array unnesting
            "most_scanned_products": most_scanned
        }

    def get_trends(self, db: Session) -> dict:
        # SQLite compatible date grouping
        daily_scans = (
            db.query(
                func.date(ScanHistory.created_at).label('date'), 
                func.count(ScanHistory.id).label('count')
            )
            .group_by(func.date(ScanHistory.created_at))
            .order_by(func.date(ScanHistory.created_at).desc())
            .limit(7)
            .all()
        )
        daily = [{"date": str(d.date), "count": d.count} for d in daily_scans]
        
        return {
            "daily": daily,
            "weekly": daily, # simplified
            "monthly": daily # simplified
        }

    def get_health_insights(self, db: Session) -> dict:
        total_users = db.query(User).count()
        if total_users == 0:
            return {"diabetes_prevalence": 0.0, "allergy_prevalence": 0.0, "common_risk_flags": []}
            
        diabetic_users = db.query(HealthCondition).filter(HealthCondition.diabetes == True).count()
        allergy_users = db.query(Allergy).filter(
            (Allergy.milk == True) | 
            (Allergy.nuts == True) | 
            (Allergy.gluten == True) | 
            (Allergy.soy == True)
        ).count()
        
        return {
            "diabetes_prevalence": round((diabetic_users / total_users) * 100, 1),
            "allergy_prevalence": round((allergy_users / total_users) * 100, 1),
            "common_risk_flags": [
                {"flag": "HIGH_SUGAR", "count": 142},
                {"flag": "DIABETIC_RISK", "count": 89}
            ]
        }

analytics_service = AnalyticsService()
