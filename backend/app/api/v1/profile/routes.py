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
async def get_my_profile(
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
async def create_profile(
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
async def update_my_profile(
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
async def delete_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = profile_service.delete_profile(db, current_user.id)
    if success:
        return {"success": True, "data": {"deleted": True}}
    raise ProfileNotFoundError("Profile not found or already deleted")

@router.get("/me/completion")
async def get_my_profile_completion(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    completion = profile_service.calculate_completion(db, current_user.id)
    return {
        "success": True,
        "data": completion.model_dump()
    }

@router.get("/me/health-summary")
async def get_my_health_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    summary = profile_service.get_health_summary(db, current_user.id)
    return {
        "success": True,
        "data": summary.model_dump()
    }
