from typing import Dict, Any, Tuple, List
from app.models.ingredient import Ingredient

class IngredientScoreEngine:
    def __init__(self, rules: Dict[str, Any]):
        self.rules = rules["ingredient_rules"]
        self.high_risk = [i.lower() for i in self.rules["high_risk_ingredients"]]
        self.mod_risk = [i.lower() for i in self.rules["moderate_risk_ingredients"]]

    def calculate(self, ingredients: List[Ingredient]) -> Tuple[float, List[str]]:
        """
        Calculates the 0-100 ingredient score based on risk categories.
        Returns (score, warnings)
        """
        score = self.rules["base_score"]
        warnings = []
        
        if not ingredients:
            return 100.0, []

        for ingredient in ingredients:
            name = ingredient.ingredient_name.lower()
            
            # Check High Risk
            is_high = any(hr in name for hr in self.high_risk)
            if is_high:
                score += self.rules["high_risk_penalty"]
                warnings.append(f"High risk ingredient: {ingredient.ingredient_name}")
                continue
                
            # Check Moderate Risk
            is_mod = any(mr in name for mr in self.mod_risk)
            if is_mod:
                score += self.rules["moderate_risk_penalty"]

        final_score = max(0.0, min(100.0, score))
        return round(final_score, 1), warnings
