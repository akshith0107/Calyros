from typing import Dict, Any, Tuple, List
from app.models.nutrition_fact import NutritionFact
from app.models.ingredient import Ingredient

class CompatibilityEngine:
    def __init__(self, rules: Dict[str, Any]):
        self.rules = rules["compatibility_rules"]
        
        # Mapping boolean fields from Allergy model to keywords to check in ingredients
        self.allergy_map = {
            "milk": ["milk", "whey", "casein", "lactose", "butter", "cheese", "cream"],
            "gluten": ["wheat", "barley", "rye", "malt", "gluten", "oats"],
            "soy": ["soy", "edamame", "tofu", "tempeh", "miso"],
            "nuts": ["almond", "walnut", "pecan", "cashew", "pistachio", "macadamia", "peanut"],
            "eggs": ["egg", "albumen", "globulin", "livetin", "lysozyme", "mayonnaise"],
            "seafood": ["fish", "salmon", "tuna", "cod", "tilapia", "anchovy"],
            "sesame": ["sesame", "tahini", "halvah", "gomashio"],
            "shellfish": ["shrimp", "crab", "lobster", "crawfish", "prawn", "scallop", "oyster", "clam"]
        }

    def calculate(self, profile: Dict[str, Any], facts: NutritionFact, ingredients: List[Ingredient]) -> Tuple[float, List[str], List[str]]:
        """
        Calculates the 0-100 compatibility score based on User Health Profile.
        Returns (score, warnings, flags)
        """
        score = self.rules["base_score"]
        warnings = []
        flags = []
        
        if not profile:
            return score, warnings, flags

        health = profile.get("health_conditions")
        allergies = profile.get("allergies")
        
        # 1. Health Conditions Checks
        if health:
            # Diabetes
            if health.diabetes:
                sugar = facts.sugar or 0.0
                if sugar > self.rules["diabetic_sugar_limit"]:
                    score += self.rules["diabetic_penalty"]
                    warnings.append(f"Exceeds diabetic sugar limit ({sugar}g)")
                    flags.append("DIABETIC_RISK")

            # Hypertension
            if health.hypertension:
                sodium = facts.sodium or 0.0
                if sodium > self.rules["hypertension_sodium_limit"]:
                    score += self.rules["hypertension_penalty"]
                    warnings.append(f"Exceeds hypertension sodium limit ({sodium}mg)")
                    flags.append("HEART_RISK")
                    
            # Heart Disease / Cholesterol
            if health.heart_disease or health.cholesterol:
                sat_fat = facts.saturated_fat or 0.0
                trans_fat = facts.trans_fat or 0.0
                if sat_fat > 5.0 or trans_fat > 0:
                    score += self.rules["hypertension_penalty"] # reuse severe penalty
                    warnings.append("High saturated/trans fat risk for heart condition")
                    flags.append("HEART_RISK")

        # 2. Allergy Checks (Deterministic Substring Matching)
        if allergies and ingredients:
            ingredient_names = [i.ingredient_name.lower() for i in ingredients]
            
            for allergy_key, keywords in self.allergy_map.items():
                if getattr(allergies, allergy_key, False):
                    # User has this allergy, check if any keyword exists in any ingredient
                    found = False
                    for keyword in keywords:
                        for ing_name in ingredient_names:
                            if keyword in ing_name:
                                found = True
                                warnings.append(f"Allergen Alert: Contains {allergy_key.title()} ({ing_name})")
                                break
                        if found: break
                    
                    if found:
                        score += self.rules["allergy_penalty"]
                        flags.append("ALLERGEN_PRESENT")

        final_score = max(0.0, min(100.0, score))
        return round(final_score, 1), warnings, flags
