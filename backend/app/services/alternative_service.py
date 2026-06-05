from sqlalchemy.orm import Session
from app.models.food_score import FoodScore
from app.models.product import Product

class AlternativeService:
    def get_healthier_alternatives(self, db: Session, current_score: float, limit: int = 3) -> list[dict]:
        """
        Finds products with a higher overall_score.
        In a real app, this would filter by category (e.g., finding a healthier "Milk").
        For now, we just find any product with a higher score.
        """
        # A simple query on FoodScore linked to ScanHistory linked to Product
        # We need products that have a FoodScore > current_score.
        return self._fallback_query(db, current_score, limit)
        
    def _fallback_query(self, db: Session, current_score: float, limit: int) -> list[dict]:
        from app.models.scan_history import ScanHistory
        
        results = (
            db.query(Product, FoodScore)
            .join(ScanHistory, Product.id == ScanHistory.product_id)
            .join(FoodScore, ScanHistory.id == FoodScore.scan_id)
            .filter(FoodScore.overall_score > current_score)
            .filter(FoodScore.classification == "SAFE")
            .order_by(FoodScore.overall_score.desc())
            .limit(limit)
            .all()
        )
        
        alts = []
        # Deduplicate products
        seen_products = set()
        
        for prod, score in results:
            if prod.id in seen_products:
                continue
            seen_products.add(prod.id)
            
            alts.append({
                "product_name": prod.product_name,
                "brand": prod.brand,
                "overall_score": score.overall_score,
                "reason": "Higher overall health score"
            })
            if len(alts) >= limit:
                break
                
        return alts

alternative_service = AlternativeService()
