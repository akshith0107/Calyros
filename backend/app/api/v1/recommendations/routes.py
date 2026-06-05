from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.services.recommendation_service import recommendation_service
from app.schemas.recommendation import GenerateRecommendationRequest
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/generate", response_model=dict)
async def generate_recommendation(
    payload: GenerateRecommendationRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resp = await recommendation_service.generate_recommendation(db, payload.scan_id, current_user.id)
        return {
            "success": True,
            "data": resp.model_dump(mode='json')
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.get("/latest", response_model=dict)
async def get_latest_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Get latest scan
        from app.models.scan_history import ScanHistory
        latest_scan = db.query(ScanHistory).filter(ScanHistory.user_id == current_user.id).order_by(ScanHistory.created_at.desc()).first()
        if not latest_scan:
            return {"success": False, "message": "No scans found"}
            
        resp = recommendation_service.get_recommendation(db, latest_scan.id, current_user.id)
        if not resp:
            return {"success": False, "message": "No recommendation found for latest scan"}
            
        return {
            "success": True,
            "data": resp.model_dump(mode='json')
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.get("/{scan_id}", response_model=dict)
async def get_recommendation(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resp = recommendation_service.get_recommendation(db, scan_id, current_user.id)
        return {
            "success": True,
            "data": resp.model_dump(mode='json')
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }
@router.get("/{scan_id}/ingredients", response_model=dict)
async def get_ingredients_explanation(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resp = recommendation_service.get_recommendation(db, scan_id, current_user.id)
        return {
            "success": True,
            "data": resp.ingredient_explanations
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.get("/{scan_id}/alternatives", response_model=dict)
async def get_alternatives(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        resp = recommendation_service.get_recommendation(db, scan_id, current_user.id)
        return {
            "success": True,
            "data": resp.alternatives
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }
