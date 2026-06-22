import logging
from typing import Dict, Any, List

from app.core.ingredient_kb import analyze_ingredient

logger = logging.getLogger(__name__)

class NutritionIntelligenceEngine:
    """
    Dynamic Intelligence Engine that analyzes exhaustive parsed data and user profiles 
    to generate insights, dynamic health scores, and personalized recommendations.
    """

    @classmethod
    def analyze(cls, parsed_data: Dict[str, Any], user_profile: Any, user_allergy: Any = None) -> Dict[str, Any]:
        """
        Main analysis pipeline.
        parsed_data = {
            "all_detected_nutrients": [...],
            "vitamins": [...],
            "minerals": [...],
            "ingredients": [...],
            "allergens": [...],
            "additives": [...],
            "preservatives": [...],
            "beneficial_compounds": [...],
            "nutrition_facts": {...}
        }
        """
        logger.info("Running Dynamic Nutrition Intelligence Analysis")
        
        # 1. Normalize Inputs
        nutrients = parsed_data.get("all_detected_nutrients", [])
        vitamins = parsed_data.get("vitamins", [])
        minerals = parsed_data.get("minerals", [])
        ingredients = parsed_data.get("ingredients", [])
        product_allergens = [a.lower() for a in parsed_data.get("allergens", [])]
        additives = parsed_data.get("additives", [])
        preservatives = parsed_data.get("preservatives", [])
        beneficial_compounds = parsed_data.get("beneficial_compounds", [])
        facts = parsed_data.get("nutrition_facts", {})
        
        sugar_val = float(facts.get("sugar") or facts.get("total_sugar") or 0)
        added_sugar_val = float(facts.get("added_sugar", 0) or 0)
        protein_val = float(facts.get("protein", 0) or 0)
        fiber_val = float(facts.get("fiber", 0) or 0)
        sodium_val = float(facts.get("sodium", 0) or 0)
        calories_val = float(facts.get("calories", 0) or 0)
        
        ocr_conf = parsed_data.get("ocr_confidence")
        extr_conf = parsed_data.get("extraction_confidence")
        
        # 2. Allergy Intelligence
        user_allergies = []
        if isinstance(user_profile, dict):
            algy = user_profile.get("allergies")
            if algy:
                if getattr(algy, 'milk', False): user_allergies.append("milk")
                if getattr(algy, 'gluten', False): user_allergies.append("gluten")
                if getattr(algy, 'soy', False): user_allergies.append("soy")
                if getattr(algy, 'nuts', False): user_allergies.append("nuts")
                if getattr(algy, 'eggs', False): user_allergies.append("eggs")
                if getattr(algy, 'seafood', False): user_allergies.append("seafood")
                if getattr(algy, 'sesame', False): user_allergies.append("sesame")
                if getattr(algy, 'shellfish', False): user_allergies.append("shellfish")
                if getattr(algy, 'other_allergies', None): user_allergies.append(getattr(algy, 'other_allergies').lower())
        elif user_allergy and hasattr(user_allergy, "allergies"): # legacy fallback
            user_allergies = [a.lower().strip() for a in getattr(user_allergy, "allergies", [])]
            
        conflicts = list(set(user_allergies).intersection(set(product_allergens)))
        
        if not conflicts:
            allergy_status = "No Allergy Conflict"
            allergy_msg = "This product aligns with your allergy profile."
        else:
            allergy_status = "Allergy Conflict Detected"
            allergy_msg = f"Warning: This product contains {', '.join([c.title() for c in conflicts])}."
            
        allergy_analysis = {
            "status": allergy_status,
            "message": allergy_msg,
            "detected_allergens": [a.title() for a in product_allergens],
            "user_allergies": [a.title() for a in user_allergies],
            "conflicts": [c.title() for c in conflicts]
        }

        # 3. Profile Context Extraction
        profile_used = {
            "age": None,
            "gender": None,
            "height_cm": None,
            "weight_kg": None,
            "bmi": None,
            "health_goal": "general health",
            "activity_level": None,
            "health_conditions": [],
            "allergies": user_allergies
        }
        
        if isinstance(user_profile, dict) and "profile" in user_profile:
            prof = user_profile["profile"]
            profile_used["age"] = getattr(prof, "age", None)
            profile_used["gender"] = getattr(prof, "gender", None)
            profile_used["height_cm"] = getattr(prof, "height_cm", None)
            profile_used["weight_kg"] = getattr(prof, "weight_kg", None)
            profile_used["health_goal"] = getattr(prof, "health_goal", "general health")
            profile_used["activity_level"] = getattr(prof, "activity_level", None)
            
            if "health_conditions" in user_profile:
                hc = user_profile["health_conditions"]
                conditions = []
                for attr in ["diabetes", "hypertension", "cholesterol", "kidney_disease", "liver_disease", "thyroid_disorder", "heart_disease", "pcos"]:
                    if getattr(hc, attr, False):
                        conditions.append(attr)
                profile_used["health_conditions"] = conditions

        # 4. Findings Generation (Dynamic)
        key_findings = []
        positive_factors = []
        concerns = []
        score_deductions = []
        
        def add_deduction(points: float, reason: str, impact: str):
            score_deductions.append({
                "points_deducted": round(points, 1),
                "reason": reason,
                "health_impact": impact
            })
        
        if ocr_conf is not None and ocr_conf < 70:
            concerns.append("Low OCR confidence. Label text may be obscured.")
        if extr_conf is not None and extr_conf < 70:
            concerns.append("Low extraction confidence. Nutrient parsing may be incomplete.")

        # --- INGREDIENT INTELLIGENCE v3 ---
        ingredient_findings = []
        is_ultra_processed = False
        
        additive_count = 0
        artificial_sweetener_count = 0
        preservative_count = 0
        seed_oil_count = 0
        quality_protein_count = 0
        
        ingredient_quality_score = 100.0
        lower_ingredients = [i.lower() for i in ingredients]
        
        for idx, ing in enumerate(lower_ingredients):
            analysis = analyze_ingredient(ing)
            cat = analysis["category"]
            flags = analysis["flags"]
            impact = analysis["health_impact"]
            severity = analysis.get("severity", 1)
            desc = analysis.get("description", "")
            spec = analysis.get("specific_impact", "")
            
            # Primary ingredients check (top 3)
            if idx < 3 and impact == "negative":
                ingredient_findings.append(f"Primary ingredient is nutrient-poor: {ing.title()}.")
                deduction = -10 * severity
                ingredient_quality_score += deduction
                add_deduction(deduction, f"Poor primary ingredient: {ing.title()}", spec)
            
            if cat in ["ultra_processed", "artificial"]:
                is_ultra_processed = True
                
            if "artificial_sweetener" in flags:
                artificial_sweetener_count += 1
                deduction = -5 * severity
                ingredient_quality_score += deduction
                add_deduction(deduction, f"Artificial Sweetener: {ing.title()}", spec)
            elif "seed_oil" in flags:
                seed_oil_count += 1
                deduction = -5 * severity
                ingredient_quality_score += deduction
                add_deduction(deduction, f"Industrial Seed Oil: {ing.title()}", spec)
            elif "preservative" in flags:
                if impact == "negative":
                    preservative_count += 1
                    deduction = -3 * severity
                    ingredient_quality_score += deduction
                    add_deduction(deduction, f"Chemical Preservative: {ing.title()}", spec)
            elif "additive" in flags or "artificial_color" in flags or "artificial_flavor" in flags:
                additive_count += 1
                deduction = -4 * severity
                ingredient_quality_score += deduction
                add_deduction(deduction, f"Artificial Additive: {ing.title()}", spec)
                
            if "added_sugar" in flags:
                deduction = -5 * severity
                ingredient_quality_score += deduction
                add_deduction(deduction, f"Added Sugar Source: {ing.title()}", spec)
                
            if "quality_protein" in flags:
                ingredient_quality_score += 5
                quality_protein_count += 1
            if "quality_fiber" in flags:
                ingredient_quality_score += 5
                
        # Consolidate ingredient findings
        if artificial_sweetener_count > 0:
            ingredient_findings.append(f"Contains {artificial_sweetener_count} non-nutritive sweetener(s).")
            concerns.append("Contains Artificial Sweeteners")
        if seed_oil_count > 0:
            ingredient_findings.append(f"Contains {seed_oil_count} refined industrial oil(s).")
        if preservative_count > 0:
            ingredient_findings.append(f"Contains {preservative_count} chemical preservative(s).")
            concerns.append(f"Contains {preservative_count} preservative(s)")
        if additive_count > 0:
            ingredient_findings.append(f"Contains {additive_count} artificial additive(s)/color(s).")
            concerns.append(f"Contains {additive_count} additive(s)")
            
        ingredient_quality_score = max(0.0, min(100.0, ingredient_quality_score))
        
        # Processing Assessment
        if len(lower_ingredients) == 0:
            processing_assessment = "Unknown (Missing Data)"
            processing_score = 50.0
            concerns.append("Low Confidence: Ingredient list unavailable for processing classification.")
            ingredient_findings.append("No ingredients detected.")
        elif is_ultra_processed or len(lower_ingredients) > 10:
            processing_assessment = "Ultra-Processed"
            processing_score = 40.0
        elif len(lower_ingredients) > 5:
            processing_assessment = "Processed"
            processing_score = 70.0
        else:
            processing_assessment = "Minimally Processed"
            processing_score = 100.0
            
        if not ingredient_findings and len(lower_ingredients) > 0:
            ingredient_findings.append("Ingredients consist of whole foods or natural components.")

        # --- NUTRIENT CONTEXT ENGINE ---
        nutrition_score = 100.0
        
        # Satiety Score (Protein + Fiber + Fats vs Calories)
        # Estimation: 1g protein = 4 cal, 1g fiber = 2 cal. Satiety is how filling it is per calorie.
        if calories_val > 0:
            satiety_ratio = ((protein_val * 4) + (fiber_val * 4)) / calories_val
            satiety_score = min(100, max(0, satiety_ratio * 100 * 2)) # Arbitrary multiplier to map to 0-100
        else:
            satiety_score = 50.0 # Default if no calories
            
        # Protein Quality Score
        if protein_val > 0:
            if quality_protein_count > 0:
                protein_quality_score = 100.0
            else:
                protein_quality_score = 60.0 # Lower bioavailability or missing aminos
        else:
            protein_quality_score = 0.0
            
        # Sugar Quality Score
        natural_sugar = max(0, sugar_val - added_sugar_val)
        sugar_quality_score = 100.0
        
        if added_sugar_val > 0:
            sq_deduction = min(80, (added_sugar_val / 4) * 10) # Heavy penalty for added sugar
            sugar_quality_score -= sq_deduction
            deduction = -sq_deduction * 0.4 # Applied to nutrition_score weighted 40%
            nutrition_score += deduction
            add_deduction(deduction, f"High Added Sugar ({added_sugar_val}g)", "Rapidly spikes blood glucose and contributes to insulin resistance.")
            key_findings.append("Contains Added Sugar")
            concerns.append(f"Contains {added_sugar_val}g of ADDED sugar per serving")
            
        # Fiber-to-Carb Ratio Mitigation
        # High fiber mitigates natural sugar spikes
        if fiber_val >= 3:
            sugar_quality_score += 10 # Bonus for fiber mitigation
            positive_factors.append("Fiber content helps mitigate sugar absorption.")
            
        sugar_quality_score = max(0.0, min(100.0, sugar_quality_score))
        
        if natural_sugar > 10:
            key_findings.append("High Natural Sugar")
            positive_factors.append(f"Contains {natural_sugar}g of naturally occurring sugar")
            # Lenient penalty
            ns_deduction = min(15, (natural_sugar / 10) * 3)
            nutrition_score -= ns_deduction
            if ns_deduction > 5:
                add_deduction(-ns_deduction, "High Natural Sugar", "While natural, high amounts can still impact total daily carb load.")
            
        # Sodium Density
        if calories_val > 0 and sodium_val > 0:
            sodium_density = sodium_val / calories_val
            if sodium_density > 2.0: # >2mg per calorie is high
                deduction = -min(30, sodium_density * 5)
                nutrition_score += deduction
                concerns.append(f"High Sodium Density ({sodium_val}mg)")
                add_deduction(deduction, "High Sodium Density", "Excessive sodium relative to caloric energy; bad for cardiovascular health.")
        elif sodium_val > 400:
            deduction = -min(30, (sodium_val / 200) * 5)
            nutrition_score += deduction
            concerns.append(f"High Sodium ({sodium_val}mg)")
            add_deduction(deduction, "High Sodium", "Excessive total sodium; bad for blood pressure.")
            
        # Nutrient Density Score (Vitamins/Minerals vs Calories)
        micro_count = len(vitamins) + len(minerals)
        if calories_val > 0:
            nutrient_density = (micro_count * 100) / calories_val
            nutrient_density_score = min(100, nutrient_density * 50)
        else:
            nutrient_density_score = 50.0
            
        if micro_count > 0:
            key_findings.append("Contains Micronutrients")
            nutrition_score += micro_count * 2

        if fiber_val >= 5:
            key_findings.append("High Fiber content")
            positive_factors.append("Excellent source of dietary fiber")
            nutrition_score += 15
        elif fiber_val < 1 and "Fiber" in [n.get("name") for n in nutrients]:
            concerns.append("Low Fiber")
            nutrition_score -= 5

        if protein_val >= 10:
            key_findings.append("Rich in Protein")
            positive_factors.append(f"Provides {protein_val}g of protein per serving")
            nutrition_score += 15
            
        nutrition_score = max(0.0, min(100.0, nutrition_score))

        # --- GOAL ALIGNMENT ENGINE V2 ---
        
        user_goal = "general health"
        if isinstance(user_profile, dict):
            prof = user_profile.get("profile")
            if prof and getattr(prof, "health_goal", None):
                user_goal = getattr(prof, "health_goal")
        elif hasattr(user_profile, "health_goal"):
            user_goal = getattr(user_profile, "health_goal", "general health")
            
        user_goal_lower = str(user_goal).lower()
        
        goal_alignment_score = 100.0
        goal_specific_reasoning = []
        
        if "muscle gain" in user_goal_lower or "athletic" in user_goal_lower or "high protein" in user_goal_lower:
            if protein_quality_score >= 80 and protein_val >= 10:
                goal_specific_reasoning.append(f"High quality, highly bioavailable protein ({protein_val}g) perfectly supports muscle synthesis.")
                goal_alignment_score += 10
            elif protein_val >= 10:
                goal_specific_reasoning.append(f"Contains {protein_val}g of protein, but sources may have lower bioavailability.")
            else:
                goal_specific_reasoning.append("Lacks the protein density required for optimal muscle recovery.")
                goal_alignment_score -= 20
                
            protein_to_sugar_ratio = protein_val / max(sugar_val, 1)
            if protein_to_sugar_ratio < 0.5:
                goal_specific_reasoning.append(f"Protein-to-sugar ratio is extremely poor ({round(protein_to_sugar_ratio, 2)}). Will drive fat storage instead of lean muscle synthesis.")
                goal_alignment_score -= 30
                
            if calories_val > 0 and (protein_val * 4) / calories_val > 0.3:
                goal_specific_reasoning.append("Excellent protein-to-calorie ratio.")
                goal_alignment_score += 10
                
        elif "lose weight" in user_goal_lower or "weight loss" in user_goal_lower or "cut fat" in user_goal_lower:
            if satiety_score > 70:
                goal_specific_reasoning.append("High satiety score: will keep you full for longer despite calorie load.")
                goal_alignment_score += 15
            else:
                goal_specific_reasoning.append("Low satiety score: this may leave you hungry, hindering a caloric deficit.")
                goal_alignment_score -= 20
                
            if sugar_quality_score < 50:
                goal_specific_reasoning.append("Warning: High added sugars will spike insulin, promoting fat storage and cravings.")
                goal_alignment_score -= 30
                
        elif "heart health" in user_goal_lower or "cardiovascular" in user_goal_lower:
            if sodium_val > 300:
                goal_specific_reasoning.append("Warning: High sodium density directly impacts blood pressure.")
                goal_alignment_score -= 30
            else:
                goal_specific_reasoning.append("Sodium levels are within a heart-healthy range.")
                goal_alignment_score += 10
                
            if seed_oil_count > 0:
                goal_specific_reasoning.append("Contains highly processed industrial oils which may promote arterial inflammation.")
                goal_alignment_score -= 20
                
        elif "diabetes" in user_goal_lower or "blood sugar" in user_goal_lower:
            if sugar_quality_score < 50:
                goal_specific_reasoning.append("Warning: High added sugar will cause severe blood glucose spikes.")
                goal_alignment_score -= 40
            elif fiber_val >= 3:
                goal_specific_reasoning.append("Good fiber content helps blunt the glycemic impact of carbohydrates.")
                goal_alignment_score += 20
                
        else:
            if is_ultra_processed:
                goal_specific_reasoning.append("This is an ultra-processed food and should be minimized for general longevity.")
                goal_alignment_score -= 15
            else:
                goal_specific_reasoning.append("This whole-food profile supports overall metabolic health.")
                
        goal_alignment_score = max(0.0, min(100.0, goal_alignment_score))
        
        if conflicts:
            goal_alignment_score = 0.0 # Critical penalty
            goal_specific_reasoning.append(f"CRITICAL: DO NOT CONSUME due to allergy conflicts ({', '.join(conflicts)}).")
            
        # Calculate Overall Score (Weighted Average)
        overall_score = (
            (nutrition_score * 0.40) + 
            (ingredient_quality_score * 0.30) + 
            (processing_score * 0.10) + 
            (goal_alignment_score * 0.20)
        )
        overall_score = max(0.0, min(100.0, round(overall_score)))
        
        # --- CONFIDENCE SCORING & STRICT CLASSIFICATION BOUNDS ---
        confidence_score = 100.0
        if len(lower_ingredients) == 0:
            confidence_score -= 30.0
        if ocr_conf is not None and ocr_conf < 70:
            confidence_score -= 20.0
        if extr_conf is not None and extr_conf < 70:
            confidence_score -= 20.0
            
        confidence_score = max(0.0, min(100.0, confidence_score))
        
        has_junk_flags = (added_sugar_val > 0) or (seed_oil_count > 0) or (artificial_sweetener_count > 0) or (additive_count > 0)
        
        if has_junk_flags and overall_score >= 80:
            overall_score = 79.0
            score_deductions.append({
                "points_deducted": 0,
                "reason": "Strict Classification Cap",
                "health_impact": "Products containing added sugar, refined oils, or artificial additives cannot be classified as Excellent or Whole Food."
            })
            if "Ingredients consist of whole foods or natural components." in ingredient_findings:
                ingredient_findings.remove("Ingredients consist of whole foods or natural components.")
        
        # Classification
        if overall_score >= 80: classification = "Excellent"
        elif overall_score >= 60: classification = "Good"
        elif overall_score >= 40: classification = "Moderate"
        elif overall_score >= 20: classification = "Poor"
        else: classification = "Avoid"

        # --- NEW BMI ENGINE ---
        bmi_status = {}
        if profile_used["weight_kg"] and profile_used["height_cm"] and profile_used["height_cm"] > 0:
            bmi = profile_used["weight_kg"] / ((profile_used["height_cm"] / 100) ** 2)
            status = "Normal Weight"
            if bmi < 18.5: status = "Underweight"
            elif bmi >= 30: status = "Obese"
            elif bmi >= 25: status = "Overweight"
            bmi_status = {"bmi": round(bmi, 1), "status": status}
            profile_used["bmi"] = round(bmi, 1)
                
        # --- NEW SUGAR RISK ENGINE ---
        sugar_risk = {"risk_level": "Low", "score": 0, "explanation": "Sugar is within healthy limits.", "health_impact": "Neutral"}
        if sugar_val > 0:
            if sugar_val > 15:
                sugar_risk["risk_level"] = "High Risk"
                sugar_risk["score"] = 80
                sugar_risk["explanation"] = f"Contains {sugar_val}g of sugar per serving."
                sugar_risk["health_impact"] = "High sugar spikes blood glucose and promotes fat storage."
            elif sugar_val >= 5:
                sugar_risk["risk_level"] = "Moderate Risk"
                sugar_risk["score"] = 40
                sugar_risk["explanation"] = f"Contains {sugar_val}g of sugar."
                sugar_risk["health_impact"] = "Moderate blood glucose impact."
            
            # Check if sugar is first ingredient
            if len(lower_ingredients) > 0 and 'sugar' in lower_ingredients[0]:
                sugar_risk["risk_level"] = "High Risk"
                sugar_risk["score"] += 20
                sugar_risk["explanation"] += " Sugar is the first ingredient!"
                
        # --- NEW PROTEIN DENSITY ENGINE ---
        protein_density = {"density": 0, "classification": "Poor", "muscle_gain": "Not suitable", "weight_loss": "Poor"}
        if calories_val > 0:
            density = (protein_val / calories_val) * 100
            protein_density["density"] = round(density, 2)
            if density > 4.0:
                protein_density["classification"] = "Excellent"
                protein_density["muscle_gain"] = "Highly supportive"
                protein_density["weight_loss"] = "Excellent (high thermic effect)"
            elif density > 2.0:
                protein_density["classification"] = "Good"
                protein_density["muscle_gain"] = "Supportive"
                protein_density["weight_loss"] = "Good"
            elif density > 1.0:
                protein_density["classification"] = "Average"
                protein_density["muscle_gain"] = "Moderate"
                protein_density["weight_loss"] = "Average"
                
        # --- NEW SATIETY SCORE ---
        satiety_out = {"level": "Low Satiety", "hunger_return": "Fast", "explanation": "Likely to leave you hungry soon."}
        if satiety_score > 70:
            satiety_out = {"level": "High Satiety", "hunger_return": "Slow", "explanation": "Will keep you full for a long time."}
        elif satiety_score > 40:
            satiety_out = {"level": "Medium Satiety", "hunger_return": "Moderate", "explanation": "Average filling effect."}
            
        # --- NEW GLYCEMIC IMPACT ---
        glycemic = {"estimate": "Low", "diabetes_insight": "Generally safe for blood sugar."}
        if sugar_val > 10 and fiber_val < 3:
            glycemic = {"estimate": "High", "diabetes_insight": "WARNING: Will cause rapid blood glucose spike. Not recommended."}
        elif sugar_val > 5:
            glycemic = {"estimate": "Moderate", "diabetes_insight": "May cause moderate glucose fluctuations."}
            
        # --- PERSONALIZED VERDICT ---
        verdict = {
            "summary": "This is a " + classification.lower() + " choice.",
            "strengths": positive_factors[:3] if positive_factors else ["None notable"],
            "concerns": concerns[:3] if concerns else ["None notable"],
            "who_should_consume": "People seeking " + user_goal if overall_score >= 60 else "Nobody",
            "who_should_avoid": "People with diabetes" if glycemic["estimate"] == "High" else "None",
            "frequency": "Daily" if overall_score >= 80 else "Occasionally" if overall_score >= 40 else "Rarely",
            "why_it_matters": f"Because your goal is {user_goal}, you should prioritize {'protein' if 'muscle' in user_goal_lower else 'satiety' if 'weight' in user_goal_lower else 'low sugar'}. {goal_specific_reasoning[0] if goal_specific_reasoning else ''}"
        }

        # 6. Final Payload Return
        return {
            "score": round(overall_score, 1),
            "overall_score": round(overall_score, 1),
            "nutrition_score": round(nutrition_score, 1),
            "ingredient_quality_score": round(ingredient_quality_score, 1),
            "processing_score": round(processing_score, 1),
            "goal_alignment_score": round(goal_alignment_score, 1),
            "nutrient_density_score": round(nutrient_density_score, 1),
            "satiety_score": round(satiety_score, 1),
            "protein_quality_score": round(protein_quality_score, 1),
            "sugar_quality_score": round(sugar_quality_score, 1),
            "classification": classification,
            "key_findings": list(set(key_findings))[:8],
            "concerns": list(set(concerns)),
            "positive_factors": list(set(positive_factors)),
            "ingredient_findings": ingredient_findings,
            "score_deductions": score_deductions,
            "goal_specific_reasoning": goal_specific_reasoning,
            "allergy_analysis": allergy_analysis,
            "personalized_analysis": " ".join(goal_specific_reasoning),
            "processing_assessment": processing_assessment,
            "confidence_score": confidence_score,
            "sugar_risk_score": sugar_risk,
            "protein_density_score": protein_density,
            "satiety_score_details": satiety_out,
            "glycemic_impact": glycemic,
            "goal_alignment": {"score": goal_alignment_score, "explanation": " ".join(goal_specific_reasoning)},
            "personalized_verdict": verdict,
            "bmi_status": bmi_status,
            "profile_used": profile_used,
            "macro_breakdown": {
                "protein": protein_val,
                "fiber": fiber_val,
                "sugar": sugar_val,
                "added_sugar": added_sugar_val,
                "sodium": sodium_val,
                "calories": calories_val
            },
            "recommendations": []
        }
