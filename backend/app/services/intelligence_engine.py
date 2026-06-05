from typing import Dict, Any, List

class NutritionIntelligenceEngine:
    BENEFICIAL_NUTRIENTS = ['vitamin', 'calcium', 'iron', 'potassium', 'magnesium', 'zinc', 'omega', 'protein', 'fiber', 'leucine', 'valine', 'isoleucine', 'electrolyte']
    CONCERN_KEYWORDS = ['syrup', 'artificial', 'color', 'sweetener', 'hydrogenated', 'benzoate', 'bht', 'bha', 'nitrate']
    KNOWN_ALLERGENS = ['wheat', 'milk', 'soy', 'peanut', 'tree nut', 'egg', 'fish', 'shellfish', 'sesame', 'gluten']

    @staticmethod
    def get_classification(total: float) -> str:
        if total >= 90: return "Excellent"
        if total >= 75: return "Good"
        if total >= 60: return "Moderate"
        if total >= 40: return "Limit Consumption"
        return "Avoid Frequent Use"

    @classmethod
    def analyze(cls, facts: Any, ingredients: List[Any], profile: Any, product: Any, user_allergy: Any = None) -> Dict[str, Any]:
        """
        Dynamically analyzes all structured and unstructured data to surface key insights.
        """
        key_nutrients = []
        vitamins_minerals = []
        beneficial_compounds = []
        potential_concerns = []
        allergens_list = []
        additives_list = []
        
        # 1. Parse Ingredients
        ing_names = [i.ingredient_name.lower() if hasattr(i, 'ingredient_name') else str(i).lower() for i in ingredients]
        
        # 2. Parse Dynamic DB columns
        dynamic_facts = facts.dynamic_facts if hasattr(facts, 'dynamic_facts') and facts.dynamic_facts else {}
        vitamins = facts.vitamins if hasattr(facts, 'vitamins') and facts.vitamins else {}
        minerals = facts.minerals if hasattr(facts, 'minerals') and facts.minerals else {}
        amino_acids = facts.amino_acids if hasattr(facts, 'amino_acids') and facts.amino_acids else {}
        
        db_allergens = product.allergens if hasattr(product, 'allergens') and product.allergens else []
        db_additives = product.additives if hasattr(product, 'additives') and product.additives else []

        # --- PROCESS MACROS ---
        sugar = float(facts.sugar) if facts.sugar else 0.0
        protein = float(facts.protein) if facts.protein else 0.0
        fiber = float(facts.fiber) if facts.fiber else 0.0
        sodium = float(facts.sodium) if facts.sodium else 0.0
        
        if protein >= 5:
            key_nutrients.append({"name": "Protein", "value": f"{protein}g", "explanation": "Provides amino acids for muscle maintenance and satiety."})
            beneficial_compounds.append("Protein")
        if fiber >= 3:
            key_nutrients.append({"name": "Fiber", "value": f"{fiber}g", "explanation": "Promotes gut health and stable blood sugar."})
            beneficial_compounds.append("Fiber")
        if sugar > 10:
            potential_concerns.append({"name": "Added Sugar", "explanation": f"High sugar content ({sugar}g) per serving."})
        if sodium > 400:
            potential_concerns.append({"name": "Sodium", "explanation": f"Elevated sodium level ({sodium}mg)."})

        # --- PROCESS MICROS & DISCOVERIES ---
        for vit, val in vitamins.items():
            vitamins_minerals.append({"name": vit.title(), "value": val, "explanation": "Essential vitamin for metabolic and immune health."})
            beneficial_compounds.append(vit.title())
            key_nutrients.append({"name": vit.title(), "value": val, "explanation": "Supports overall health."})

        for min_name, val in minerals.items():
            vitamins_minerals.append({"name": min_name.title(), "value": val, "explanation": "Essential mineral."})
            beneficial_compounds.append(min_name.title())
            if min_name.lower() in ['calcium', 'iron', 'magnesium', 'zinc', 'potassium']:
                key_nutrients.append({"name": min_name.title(), "value": val, "explanation": "Important for bone health, oxygen transport, or muscle function."})

        for aa, val in amino_acids.items():
            beneficial_compounds.append(aa.title())

        for k, v in dynamic_facts.items():
            if any(b in k.lower() for b in cls.BENEFICIAL_NUTRIENTS):
                beneficial_compounds.append(k.title())

        # --- PROCESS ALLERGENS ---
        # Explicitly extracted by LLM
        for al in db_allergens:
            allergens_list.append(al.title())
        # Heuristic detection from ingredients
        for ing in ing_names:
            for known in cls.KNOWN_ALLERGENS:
                if known in ing and known.title() not in allergens_list:
                    allergens_list.append(known.title())

        # Determine active user allergies
        active_allergies = []
        if user_allergy:
            if getattr(user_allergy, 'milk', False): active_allergies.append("Milk")
            if getattr(user_allergy, 'gluten', False): active_allergies.append("Gluten")
            if getattr(user_allergy, 'soy', False): active_allergies.append("Soy")
            if getattr(user_allergy, 'nuts', False):
                active_allergies.extend(["Nuts", "Peanut", "Tree Nut"])
            if getattr(user_allergy, 'eggs', False): active_allergies.append("Egg")
            if getattr(user_allergy, 'seafood', False): active_allergies.append("Seafood")
            if getattr(user_allergy, 'sesame', False): active_allergies.append("Sesame")
            if getattr(user_allergy, 'shellfish', False): active_allergies.append("Shellfish")
            if getattr(user_allergy, 'other_allergies', None):
                active_allergies.extend([a.strip().title() for a in user_allergy.other_allergies.split(",")])
        
        matched_allergies = []
        for al in allergens_list:
            if any(active.lower() in al.lower() or al.lower() in active.lower() for active in active_allergies):
                if al not in matched_allergies:
                    matched_allergies.append(al)
        
        # --- PROCESS CONCERNS & ADDITIVES ---
        for add in db_additives:
            additives_list.append(add.title())
            potential_concerns.append({"name": add.title(), "explanation": "Classified as an additive or preservative."})
            
        for ing in ing_names:
            if any(c in ing for c in cls.CONCERN_KEYWORDS):
                if ing.title() not in additives_list:
                    additives_list.append(ing.title())
                    potential_concerns.append({"name": ing.title(), "explanation": "Contains artificial additives or excessive industrial processing markers."})

        # --- COMPILE KEY FINDINGS ---
        key_findings = []
        if sugar > 15:
            key_findings.append({"title": "High in Added Sugar", "explanation": f"Contains {sugar}g of sugar, which is considered high."})
        if protein >= 10:
            key_findings.append({"title": "Good Source of Protein", "explanation": f"Contains {protein}g of protein."})
        if sodium > 400:
            key_findings.append({"title": "High Sodium", "explanation": f"Elevated sodium level ({sodium}mg)."})
        for vit, _ in vitamins.items():
            key_findings.append({"title": f"Contains {vit.title()}", "explanation": "Contributes to daily micronutrient needs."})
        # Note: Allergens are now handled purely by the frontend using `has_allergy_conflict` and the allergy lists.
        # We no longer inject "DANGER" strings or informational allergy strings into key_findings here.
        
        # Deduplicate and limit key findings
        unique_findings = []
        seen_titles = set()
        for f in key_findings:
            if f["title"] not in seen_titles:
                unique_findings.append(f)
                seen_titles.add(f["title"])
                
        # --- COMPONENT SCORING SYSTEM ---
        # 1. Sugar (Max 20)
        sugar_score = max(0.0, 20.0 - (sugar * 0.8))
        if sugar > 15: sugar_score = max(0.0, sugar_score - 5)
        
        # 2. Protein (Max 20)
        protein_score = min(20.0, protein * 1.5)
        
        # 3. Fiber (Max 20)
        fiber_score = min(20.0, fiber * 2.5)
        
        # 4. Sodium (Max 10)
        sodium_score = max(0.0, 10.0 - (sodium / 100.0))
        
        # 5. Processing (Max 20)
        processing_penalty = (len(potential_concerns) * 5.0) + (len(additives_list) * 2.0)
        processing_score = max(0.0, 20.0 - processing_penalty)
        
        # 6. Nutrients & Vitamins (Max 10)
        nutrients_score = min(10.0, len(vitamins_minerals) * 2.5 + len(beneficial_compounds) * 2.0)
        
        total_score = round(sugar_score + protein_score + fiber_score + sodium_score + processing_score + nutrients_score, 1)
        total_score = max(0.0, min(100.0, total_score))
        classification = cls.get_classification(total_score)
        
        score_breakdown = {
            "Sugar": {"score": round(sugar_score, 1), "max_score": 20.0, "explanation": f"Evaluated based on {sugar}g of sugar."},
            "Protein": {"score": round(protein_score, 1), "max_score": 20.0, "explanation": f"Evaluated based on {protein}g of protein."},
            "Fiber": {"score": round(fiber_score, 1), "max_score": 20.0, "explanation": f"Evaluated based on {fiber}g of fiber."},
            "Sodium": {"score": round(sodium_score, 1), "max_score": 10.0, "explanation": f"Evaluated based on {sodium}mg of sodium."},
            "Processing": {"score": round(processing_score, 1), "max_score": 20.0, "explanation": "Evaluated based on additives and processing markers."},
            "Nutrients": {"score": round(nutrients_score, 1), "max_score": 10.0, "explanation": "Evaluated based on vitamins, minerals, and beneficial compounds."}
        }
        
        # --- PERSONALIZED ANALYSIS ---
        user_goal = profile.get("health_goal", "general health") if isinstance(profile, dict) else getattr(profile, "health_goal", "general health")
        if not user_goal: user_goal = "general health"
        
        if classification in ["Excellent", "Good"]:
            personalized = f"For your {user_goal} goal, this product is highly beneficial. It has a strong macronutrient profile and minimal processing."
        elif classification == "Moderate":
            personalized = f"For your {user_goal} goal, this product is acceptable but not optimal. Consider consuming it occasionally rather than daily."
        else:
            personalized = f"For your {user_goal} goal, this product is counterproductive due to its nutritional profile. I recommend finding a healthier alternative."

        return {
            "total_score": total_score,
            "classification": classification,
            "flags": [c["name"] for c in potential_concerns],
            "nutrition_breakdown": {
                "key_findings": unique_findings[:6], # Keep the top 6 findings
                "key_nutrients": key_nutrients[:5], # Top 5
                "vitamins_minerals": vitamins_minerals,
                "beneficial_compounds": beneficial_compounds,
                "potential_concerns": potential_concerns,
                "product_allergens": allergens_list,
                "matched_allergies": matched_allergies,
                "has_allergy_conflict": len(matched_allergies) > 0,
                "allergens": allergens_list,
                "additives": additives_list
            },
            "score_breakdown": score_breakdown,
            "personalized_analysis": personalized,
            "recommendations": []
        }
