from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.services.scoring_service import scoring_service
from app.schemas.score import ScoreCalculateRequest, ScoreResponse
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/calculate", response_model=dict)
async def calculate_score(
    payload: ScoreCalculateRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        score = scoring_service.calculate_score(db, payload.scan_id, current_user.id)
        return {
            "success": True,
            "data": score.model_dump()
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        return {
            "success": False,
            "message": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Engine failed: {str(e)}"
        }

@router.get("/{scan_id}", response_model=dict)
async def get_score(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        score = scoring_service.get_score(db, scan_id, current_user.id)
        return {
            "success": True,
            "data": score.model_dump()
        }
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError:
        return {
            "success": False,
            "message": "Score not found"
        }
