from typing import Dict, Any, Tuple, List
from app.models.ingredient import Ingredient

class ProcessingEngine:
    def __init__(self, rules: Dict[str, Any]):
        self.rules = rules["processing_rules"]
        self.preservatives = [i.lower() for i in self.rules["preservative_keywords"]]
        self.colors = [i.lower() for i in self.rules["artificial_color_keywords"]]
        self.sweeteners = [i.lower() for i in self.rules["artificial_sweetener_keywords"]]

    def calculate(self, ingredients: List[Ingredient]) -> Tuple[float, List[str], List[str]]:
        """
        Calculates the 0-100 processing score based on ingredient count and additives.
        Returns (score, warnings, flags)
        """
        score = self.rules["base_score"]
        warnings = []
        flags = []
        
        if not ingredients:
            return 100.0, [], []

        count = len(ingredients)
        max_count = self.rules["max_ingredient_count"]
        if count > max_count:
            excess = count - max_count
            score += excess * self.rules["penalty_per_excess_ingredient"]
            warnings.append(f"High ingredient count ({count})")

        has_preservative = False
        has_color = False
        has_sweetener = False

        for ingredient in ingredients:
            name = ingredient.ingredient_name.lower()
            
            if any(p in name for p in self.preservatives):
                has_preservative = True
                
            if any(c in name for c in self.colors):
                has_color = True
                
            if any(s in name for s in self.sweeteners):
                has_sweetener = True

        if has_preservative:
            score += self.rules["preservative_penalty"]
            warnings.append("Contains preservatives")
            
        if has_color:
            score += self.rules["artificial_color_penalty"]
            warnings.append("Contains artificial colors")
            
        if has_sweetener:
            score += self.rules["artificial_sweetener_penalty"]
            warnings.append("Contains artificial sweeteners")

        if count > max_count and (has_preservative or has_color or has_sweetener):
            flags.append("ULTRA_PROCESSED")
            warnings.append("Ultra Processed Food")

        final_score = max(0.0, min(100.0, score))
        return round(final_score, 1), warnings, flags
