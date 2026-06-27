from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any

from app.core.database import get_db
from app.services.profile_service import profile_service
from app.schemas.profile_payloads import ProfileOnboardingRequest
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

from app.core.exceptions import ProfileNotFoundError

@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    data = profile_service.get_profile(db, current_user.id)
    if not data or not data.get("profile"):
        raise ProfileNotFoundError("Profile not found")
    
    return {
        "success": True,
        "data": {
            "profile": data.get("profile"),
            "health_conditions": data.get("health_conditions"),
            "allergies": data.get("allergies"),
            "preferences": data.get("preferences"),
        }
    }

@router.post("/create")
def create_profile(
    payload: ProfileOnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        profile_data = profile_service.create_profile(db, current_user.id, payload)
        return {
            "success": True,
            "data": profile_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@router.put("/me")
def update_my_profile(
    payload: ProfileOnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        profile_data = profile_service.update_profile(db, current_user.id, payload)
        return {
            "success": True,
            "data": profile_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.delete("/me")
def delete_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = profile_service.delete_profile(db, current_user.id)
    if success:
        return {"success": True, "data": {"deleted": True}}
    raise ProfileNotFoundError("Profile not found or already deleted")

@router.get("/me/completion")
def get_my_profile_completion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    completion = profile_service.calculate_completion(db, current_user.id)
    return {
        "success": True,
        "data": completion.model_dump()
    }

@router.get("/me/health-summary")
def get_my_health_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = profile_service.get_health_summary(db, current_user.id)
    return {
        "success": True,
        "data": summary.model_dump()
    }

from app.services.profile_analytics_service import profile_analytics_service

@router.get("/me/analytics")
def get_my_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analytics = profile_analytics_service.get_latest_analytics(db, current_user.id)
    
    # format response
    bmi_data = None
    if analytics["bmi"]:
        bmi_data = {
            "bmi": analytics["bmi"].bmi,
            "category": analytics["bmi"].category,
            "health_assessment": analytics["bmi"].health_assessment,
            "ideal_weight_range": analytics["bmi"].ideal_weight_range,
            "recommendation": analytics["bmi"].recommendation
        }
        
    targets_data = None
    if analytics["targets"]:
        targets_data = {
            "daily_calories": analytics["targets"].daily_calories,
            "protein_target_g": analytics["targets"].protein_target_g,
            "carb_target_g": analytics["targets"].carb_target_g,
            "fat_target_g": analytics["targets"].fat_target_g,
            "water_target_liters": analytics["targets"].water_target_liters
        }
        
    return {
        "success": True,
        "data": {
            "bmi": bmi_data,
            "nutrition_targets": targets_data
        }
    }
