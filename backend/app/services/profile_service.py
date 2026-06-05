from typing import Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.repositories.profile_repository import profile_repo
from app.schemas.profile_payloads import ProfileOnboardingRequest, HealthSummaryResponse, ProfileCompletionResponse

class ProfileService:
    def create_profile(self, db: Session, user_id: UUID, obj_in: ProfileOnboardingRequest) -> Dict[str, Any]:
        return profile_repo.create(db, user_id, obj_in)

    def update_profile(self, db: Session, user_id: UUID, obj_in: ProfileOnboardingRequest) -> Dict[str, Any]:
        return profile_repo.update(db, user_id, obj_in)

    def get_profile(self, db: Session, user_id: UUID) -> Dict[str, Any]:
        return profile_repo.get_by_user_id(db, user_id)

    def delete_profile(self, db: Session, user_id: UUID) -> bool:
        return profile_repo.delete(db, user_id)

    def calculate_completion(self, db: Session, user_id: UUID) -> ProfileCompletionResponse:
        data = profile_repo.get_by_user_id(db, user_id)
        if not data:
            return ProfileCompletionResponse(completion_percentage=0, profile_complete=False)

        score = 0
        
        # Basic Information = 30% (If Profile exists and has key fields)
        profile = data.get("profile")
        if profile and (profile.age or profile.height_cm or profile.weight_kg):
            score += 30
            
        # Health Conditions = 30%
        if data.get("health_conditions"):
            score += 30
            
        # Allergies = 20%
        if data.get("allergies"):
            score += 20
            
        # Preferences = 20%
        if data.get("preferences"):
            score += 20
            
        return ProfileCompletionResponse(
            completion_percentage=score,
            profile_complete=(score == 100)
        )

    def get_health_summary(self, db: Session, user_id: UUID) -> HealthSummaryResponse:
        data = profile_repo.get_by_user_id(db, user_id)
        if not data:
            return HealthSummaryResponse(conditions=[], allergies=[], health_goal=None)

        conditions: List[str] = []
        health = data.get("health_conditions")
        if health:
            if health.diabetes: conditions.append("Diabetes")
            if health.hypertension: conditions.append("Hypertension")
            if health.cholesterol: conditions.append("Cholesterol")
            if health.kidney_disease: conditions.append("Kidney Disease")
            if health.liver_disease: conditions.append("Liver Disease")
            if health.thyroid_disorder: conditions.append("Thyroid Disorder")
            if health.heart_disease: conditions.append("Heart Disease")
            if health.obesity: conditions.append("Obesity")
            if health.pcos: conditions.append("PCOS")
            if health.other_conditions: conditions.append(health.other_conditions)

        allergies: List[str] = []
        algy = data.get("allergies")
        if algy:
            if algy.milk: allergies.append("Milk")
            if algy.gluten: allergies.append("Gluten")
            if algy.soy: allergies.append("Soy")
            if algy.nuts: allergies.append("Nuts")
            if algy.eggs: allergies.append("Eggs")
            if algy.seafood: allergies.append("Seafood")
            if algy.sesame: allergies.append("Sesame")
            if algy.shellfish: allergies.append("Shellfish")
            if algy.other_allergies: allergies.append(algy.other_allergies)

        health_goal = None
        profile = data.get("profile")
        if profile:
            health_goal = profile.health_goal

        return HealthSummaryResponse(
            conditions=conditions,
            allergies=allergies,
            health_goal=health_goal
        )

profile_service = ProfileService()
