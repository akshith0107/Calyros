from typing import Dict, Any, Tuple, List
from app.models.nutrition_fact import NutritionFact

class NutritionScoreEngine:
    def __init__(self, rules: Dict[str, Any]):
        self.rules = rules["nutrition_rules"]

    def calculate(self, facts: NutritionFact) -> Tuple[float, List[str], List[str]]:
        """
        Calculates the 0-100 nutrition score.
        Returns (score, warnings, flags)
        """
        score = self.rules["base_score"]
        warnings = []
        flags = []

        if not facts:
            return 0.0, ["No nutrition facts found"], []

        # 1. Protein Bonus
        protein = facts.protein or 0.0
        score += protein * self.rules["protein_bonus_per_gram"]
        if protein >= 10:
            flags.append("HIGH_PROTEIN")

        # 2. Fiber Bonus
        fiber = facts.fiber or 0.0
        score += fiber * self.rules["fiber_bonus_per_gram"]
        if fiber >= 5:
            flags.append("HIGH_FIBER")

        # 3. Sugar Penalty
        sugar = facts.sugar or 0.0
        score += sugar * self.rules["sugar_penalty_per_gram"]
        if sugar >= 15:
            warnings.append("High Sugar")
            flags.append("HIGH_SUGAR")
        elif sugar <= 5:
            flags.append("LOW_SUGAR")

        added_sugar = facts.added_sugar or 0.0
        score += added_sugar * self.rules["added_sugar_penalty_per_gram"]

        # 4. Sodium Penalty
        sodium = facts.sodium or 0.0
        if sodium > self.rules["sodium_penalty_threshold_mg"]:
            score += self.rules["sodium_penalty_amount"]
            warnings.append("High Sodium")
            flags.append("HIGH_SODIUM")
        elif sodium <= 140:
            flags.append("LOW_SODIUM")

        # 5. Trans Fat Penalty
        trans_fat = facts.trans_fat or 0.0
        if trans_fat > 0:
            score += self.rules["trans_fat_penalty"]
            warnings.append("Contains Trans Fat")

        # 6. Saturated Fat Penalty
        sat_fat = facts.saturated_fat or 0.0
        score += sat_fat * self.rules["saturated_fat_penalty_per_gram"]

        # Clamp between 0 and 100
        final_score = max(0.0, min(100.0, score))
        
        return round(final_score, 1), warnings, flags
