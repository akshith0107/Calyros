from typing import Dict, Any, List

class NutritionIntelligenceEngine:
    @staticmethod
    def _evaluate_sugar(sugar_g: float) -> tuple[float, str, str]:
        # 25 points
        if sugar_g <= 5:
            return 25.0, "Low", "Excellent sugar profile. Very low added/total sugars."
        elif sugar_g <= 12:
            return 15.0, "Moderate", "Moderate sugar content. Acceptable for most diets but monitor daily intake."
        elif sugar_g <= 20:
            return 5.0, "High", "High sugar content relative to a single serving. Can cause energy crashes."
        else:
            return 0.0, "Very High", "Excessive sugar content. Regular consumption is linked to metabolic issues."

    @staticmethod
    def _evaluate_protein(protein_g: float) -> tuple[float, str, str]:
        # 20 points
        if protein_g >= 15:
            return 20.0, "High", "Excellent source of protein for muscle synthesis and satiety."
        elif protein_g >= 7:
            return 12.0, "Moderate", "Good amount of protein to support daily requirements."
        elif protein_g >= 3:
            return 5.0, "Low", "Contains some protein, but not enough to be a primary source."
        else:
            return 0.0, "Very Low", "Negligible protein content."

    @staticmethod
    def _evaluate_fiber(fiber_g: float) -> tuple[float, str, str]:
        # 20 points
        if fiber_g >= 5:
            return 20.0, "High", "Excellent fiber content. Promotes gut health and stable blood sugar."
        elif fiber_g >= 2:
            return 10.0, "Moderate", "Fair amount of fiber, contributing to daily digestive needs."
        else:
            return 0.0, "Low", "Lacks sufficient dietary fiber."

    @staticmethod
    def _evaluate_fat(total_fat: float, sat_fat: float, trans_fat: float) -> tuple[float, str, str]:
        # 15 points
        if trans_fat > 0:
            return 0.0, "Harmful", "Contains trans fats, which are strongly linked to cardiovascular disease."
        
        if total_fat == 0:
            return 15.0, "Zero Fat", "Fat-free product."
            
        sat_ratio = sat_fat / total_fat if total_fat > 0 else 0
        if sat_ratio < 0.2:
            return 15.0, "Healthy Fats", "Fat profile consists mostly of heart-healthy unsaturated fats."
        elif sat_ratio <= 0.5:
            return 8.0, "Moderate Saturated Fat", "Balanced mix of saturated and unsaturated fats."
        else:
            return 2.0, "High Saturated Fat", "High proportion of saturated fat. Can raise LDL cholesterol."

    @staticmethod
    def _evaluate_sodium(sodium_mg: float) -> tuple[float, str, str]:
        # 10 points
        if sodium_mg <= 140:
            return 10.0, "Low", "Low sodium content. Good for cardiovascular health."
        elif sodium_mg <= 400:
            return 6.0, "Moderate", "Moderate sodium. Safe for general consumption."
        elif sodium_mg <= 800:
            return 2.0, "High", "High sodium. May contribute to hypertension if consumed frequently."
        else:
            return 0.0, "Very High", "Excessive sodium content. Should be avoided by salt-sensitive individuals."

    @staticmethod
    def _evaluate_processing(ingredients: List[str]) -> tuple[float, str, str]:
        # 10 points
        # Simple heuristic for processing based on ingredient count and markers
        upf_markers = ['artificial', 'color', 'dye', 'syrup', 'preservative', 'benzoate', 'sorbate', 'nitrate', 'hydrogenated', 'bht', 'bha']
        count = len(ingredients)
        upf_count = sum(1 for i in ingredients if any(m in i.lower() for m in upf_markers))
        
        if upf_count > 0 or count > 10:
            return 0.0, "Ultra-Processed", "Contains artificial additives or excessive industrial processing markers."
        elif count > 5:
            return 6.0, "Processed", "Moderately processed with standard culinary ingredients."
        else:
            return 10.0, "Whole/Minimally Processed", "Made with few, recognizable whole-food ingredients."

    @staticmethod
    def get_classification(total: float) -> str:
        if total >= 90: return "Excellent"
        if total >= 75: return "Good"
        if total >= 60: return "Moderate"
        if total >= 40: return "Limit Consumption"
        return "Avoid Frequent Use"

    @classmethod
    def analyze(cls, facts: Any, ingredients: List[str], profile: Any) -> Dict[str, Any]:
        """
        facts: NutritionFact SQLAlchemy object
        ingredients: list of Ingredient objects
        profile: UserProfile SQLAlchemy object
        """
        # Safely extract floats
        sugar = float(facts.sugar) if facts.sugar else 0.0
        protein = float(facts.protein) if facts.protein else 0.0
        fiber = float(facts.fiber) if facts.fiber else 0.0
        total_fat = float(facts.total_fat) if facts.total_fat else 0.0
        sat_fat = float(facts.saturated_fat) if facts.saturated_fat else 0.0
        trans_fat = float(facts.trans_fat) if facts.trans_fat else 0.0
        sodium = float(facts.sodium) if facts.sodium else 0.0

        # Evaluate components
        s_score, s_cat, s_exp = cls._evaluate_sugar(sugar)
        p_score, p_cat, p_exp = cls._evaluate_protein(protein)
        f_score, f_cat, f_exp = cls._evaluate_fiber(fiber)
        fat_score, fat_cat, fat_exp = cls._evaluate_fat(total_fat, sat_fat, trans_fat)
        na_score, na_cat, na_exp = cls._evaluate_sodium(sodium)
        
        ing_names = [i.ingredient_name for i in ingredients]
        proc_score, proc_cat, proc_exp = cls._evaluate_processing(ing_names)

        total_score = s_score + p_score + f_score + fat_score + na_score + proc_score

        score_breakdown = {
            "sugar": {"score": s_score, "max_score": 25.0, "explanation": s_exp},
            "protein": {"score": p_score, "max_score": 20.0, "explanation": p_exp},
            "fiber": {"score": f_score, "max_score": 20.0, "explanation": f_exp},
            "fat_quality": {"score": fat_score, "max_score": 15.0, "explanation": fat_exp},
            "sodium": {"score": na_score, "max_score": 10.0, "explanation": na_exp},
            "processing": {"score": proc_score, "max_score": 10.0, "explanation": proc_exp}
        }

        nutrition_breakdown = {
            "sugar": {"value": sugar, "unit": "g", "category": s_cat, "explanation": s_exp},
            "protein": {"value": protein, "unit": "g", "category": p_cat, "explanation": p_exp},
            "fiber": {"value": fiber, "unit": "g", "category": f_cat, "explanation": f_exp},
            "fat": {"value": total_fat, "unit": "g", "category": fat_cat, "explanation": fat_exp},
            "sodium": {"value": sodium, "unit": "mg", "category": na_cat, "explanation": na_exp}
        }

        classification = cls.get_classification(total_score)
        
        # Deterministic Personalization based on User Profile
        health_goal = "general health"
        diet_type = "standard"
        if profile:
            if isinstance(profile, dict):
                health_goal = profile.get("health_goal", health_goal).lower() if profile.get("health_goal") else health_goal
                diet_type = profile.get("diet_type", diet_type).lower() if profile.get("diet_type") else diet_type
            else:
                health_goal = profile.health_goal.lower() if hasattr(profile, "health_goal") and profile.health_goal else health_goal
                diet_type = profile.diet_type.lower() if hasattr(profile, "diet_type") and profile.diet_type else diet_type
        
        personal_analysis = []
        recommendations = []
        
        if "weight loss" in health_goal or "cut" in health_goal:
            if s_cat in ["High", "Very High"]:
                personal_analysis.append(f"This product conflicts with your {health_goal} goal due to its {s_cat.lower()} sugar content ({sugar}g). Sugar spikes insulin, which can inhibit fat burning.")
                recommendations.append("Consider finding an alternative with under 5g of sugar.")
            if protein >= 10:
                personal_analysis.append("The high protein content is excellent for preserving lean muscle while in a caloric deficit.")
                
        if "muscle" in health_goal or "bulk" in health_goal:
            if protein >= 15:
                personal_analysis.append(f"With {protein}g of protein, this perfectly aligns with your muscle-building goals.")
            elif protein < 5:
                personal_analysis.append(f"This lacks the protein needed for muscle synthesis.")
                recommendations.append("Pair this with a protein source like whey or greek yogurt.")

        if "keto" in diet_type:
            carbs = float(facts.carbohydrates) if facts.carbohydrates else 0.0
            if carbs > 10:
                personal_analysis.append(f"This product is not keto-friendly due to {carbs}g of carbohydrates.")
                recommendations.append("Avoid this to maintain ketosis.")
            elif fat_cat in ["Healthy Fats", "Moderate Saturated Fat"]:
                personal_analysis.append("The fat profile aligns well with ketogenic requirements.")

        if not personal_analysis:
            personal_analysis.append(f"Overall, this product is categorized as {classification.lower()} based on its nutritional profile.")
            
        if not recommendations:
            if total_score < 60:
                recommendations.append("Consume only in moderation.")
            else:
                recommendations.append("This is a safe addition to your regular diet.")

        return {
            "total_score": round(total_score, 1),
            "score_breakdown": score_breakdown,
            "nutrition_breakdown": nutrition_breakdown,
            "classification": classification,
            "personalized_analysis": " ".join(personal_analysis),
            "recommendations": recommendations,
            "flags": [m for m in ["High Sugar" if sugar > 15 else None, "Ultra-Processed" if proc_score == 0 else None, "High Sodium" if sodium > 400 else None] if m]
        }
