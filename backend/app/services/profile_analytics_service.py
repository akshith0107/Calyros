import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
from uuid import UUID
import datetime

from app.models.user_analytics import BMIHistory, NutritionTargets
from app.models.profile import UserProfile

logger = logging.getLogger(__name__)

class ProfileAnalyticsService:
    def _calculate_bmi_details(self, weight_kg: float, height_cm: float) -> Dict[str, Any]:
        if not weight_kg or not height_cm:
            return None
        
        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m * height_m), 1)
        
        if bmi < 18.5:
            category = "Underweight"
            assessment = "You are currently underweight. Consider increasing your caloric intake."
        elif 18.5 <= bmi < 25:
            category = "Normal"
            assessment = "You are within a healthy weight range."
        elif 25 <= bmi < 30:
            category = "Overweight"
            assessment = "You are slightly overweight. Consider an active lifestyle to improve health."
        else:
            category = "Obese"
            assessment = "You are in the obese category. Consider consulting a healthcare professional."
            
        ideal_weight_min = round(18.5 * (height_m * height_m), 1)
        ideal_weight_max = round(24.9 * (height_m * height_m), 1)
        ideal_weight_range = f"{ideal_weight_min}kg - {ideal_weight_max}kg"
        
        return {
            "bmi": bmi,
            "category": category,
            "health_assessment": assessment,
            "ideal_weight_range": ideal_weight_range,
            "recommendation": "Maintain a balanced diet and regular physical activity."
        }

    def _calculate_macros(self, weight_kg: float, height_cm: float, age: int, gender: str, activity_level: str) -> Dict[str, Any]:
        # Mifflin-St Jeor Equation
        if str(gender).lower() == 'male':
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
        else:
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
            
        activity_multipliers = {
            "sedentary": 1.2,
            "lightly_active": 1.375,
            "moderately_active": 1.55,
            "very_active": 1.725,
            "extra_active": 1.9
        }
        
        # default to lightly active if unknown
        multiplier = activity_multipliers.get(str(activity_level).lower().replace(" ", "_"), 1.375)
        
        tdee = int(bmr * multiplier)
        
        # Balanced Macros: 25% Protein, 45% Carbs, 30% Fat
        protein_cals = tdee * 0.25
        carb_cals = tdee * 0.45
        fat_cals = tdee * 0.30
        
        protein_g = int(protein_cals / 4)
        carb_g = int(carb_cals / 4)
        fat_g = int(fat_cals / 9)
        
        # Water: roughly 35ml per kg of body weight
        water_liters = round((weight_kg * 35) / 1000, 1)
        
        return {
            "daily_calories": tdee,
            "protein_target_g": protein_g,
            "carb_target_g": carb_g,
            "fat_target_g": fat_g,
            "water_target_liters": water_liters
        }

    def update_user_analytics(self, db: Session, user_id: UUID, profile: UserProfile) -> None:
        """Called whenever the user profile is updated to refresh BMI and targets."""
        try:
            if not profile.weight_kg or not profile.height_cm or not profile.age:
                return

            # 1. Update BMI
            bmi_details = self._calculate_bmi_details(profile.weight_kg, profile.height_cm)
            if bmi_details:
                bmi_record = BMIHistory(
                    user_id=user_id,
                    bmi=bmi_details["bmi"],
                    category=bmi_details["category"],
                    health_assessment=bmi_details["health_assessment"],
                    ideal_weight_range=bmi_details["ideal_weight_range"],
                    recommendation=bmi_details["recommendation"]
                )
                db.add(bmi_record)
            
            # 2. Update Macros
            macros = self._calculate_macros(
                profile.weight_kg, 
                profile.height_cm, 
                profile.age, 
                profile.gender, 
                profile.activity_level
            )
            
            target_record = NutritionTargets(
                user_id=user_id,
                daily_calories=macros["daily_calories"],
                protein_target_g=macros["protein_target_g"],
                carb_target_g=macros["carb_target_g"],
                fat_target_g=macros["fat_target_g"],
                water_target_liters=macros["water_target_liters"]
            )
            db.add(target_record)
            
            db.commit()
        except Exception as e:
            logger.error(f"Failed to update user analytics: {e}")
            db.rollback()
            
    def get_latest_analytics(self, db: Session, user_id: UUID) -> Dict[str, Any]:
        bmi = db.query(BMIHistory).filter(BMIHistory.user_id == user_id).order_by(BMIHistory.created_at.desc()).first()
        targets = db.query(NutritionTargets).filter(NutritionTargets.user_id == user_id).order_by(NutritionTargets.created_at.desc()).first()
        
        return {
            "bmi": bmi,
            "targets": targets
        }

profile_analytics_service = ProfileAnalyticsService()
