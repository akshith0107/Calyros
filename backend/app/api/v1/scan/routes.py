import os
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.services.scan_service import scan_service
from app.models.scan_history import ScanHistory
from app.models.product import Product
from app.schemas.scan import ScanHistoryListResponse
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("")
async def scan_nutrition_label(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Receives an image, uploads to Supabase, calls Groq Llama 4 Scout, and stores parsed nutrition data.
    """
    # 1. Validate Image Extension and MIME Type
    file_ext = image.filename.split(".")[-1].lower()
    allowed_mimes = ["image/jpeg", "image/png", "image/webp"]
    if file_ext not in ["jpg", "jpeg", "png", "webp"] or image.content_type not in allowed_mimes:
        raise HTTPException(status_code=400, detail="Unsupported file format or MIME type")

    file_bytes = await image.read()
    
    # 2. Validate File Size (Max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds the 5MB limit")
        
    # 3. Call Service Orchestrator
    try:
        result = await scan_service.process_scan(db, current_user.id, file_bytes, file_ext)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/history/me", response_model=List[ScanHistoryListResponse])
async def get_my_scan_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the authenticated user's past scans.
    """
    scans = (
        db.query(ScanHistory)
        .filter(ScanHistory.user_id == current_user.id)
        .order_by(ScanHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    # We enrich with product_name for the list view
    enriched_scans = []
    for scan in scans:
        product = db.query(Product).filter(Product.id == scan.product_id).first()
        scan_dict = scan.__dict__
        scan_dict["product_name"] = product.product_name if product else "Unknown"
        enriched_scans.append(scan_dict)
        
    return enriched_scans

@router.get("/{scan_id}")
async def get_scan_by_id(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not scan or scan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    product = db.query(Product).filter(Product.id == scan.product_id).first()
    
    return {
        "id": scan.id,
        "product_name": product.product_name if product else "Unknown",
        "analysis": scan.analysis_json,
        "extracted": scan.extracted_json
    }

from fastapi.responses import FileResponse
from app.services.pdf_service import pdf_service
from app.services.profile_analytics_service import profile_analytics_service
from app.services.profile_service import profile_service
from app.models.ai_recommendation import AIRecommendation

@router.get("/{scan_id}/report")
async def get_scan_report(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
    if not scan or scan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    product = db.query(Product).filter(Product.id == scan.product_id).first()
    scan_data = {
        "scan_id": scan.id,
        "product_name": product.product_name if product else "Unknown"
    }
    
    # Get Profile & Analytics
    profile = profile_service.get_profile(db, current_user.id)
    profile_dict = profile.get("profile", {})
    if hasattr(profile_dict, "__dict__"):
        profile_dict = {k: v for k, v in profile_dict.__dict__.items() if not k.startswith('_')}

    analytics = profile_analytics_service.get_latest_analytics(db, current_user.id)
    
    # Get Recommendation
    recommendation = db.query(AIRecommendation).filter(AIRecommendation.scan_id == scan_id).first()
    rec_dict = {}
    if recommendation:
        rec_dict = {
            "health_score": recommendation.health_score,
            "processing_level": recommendation.processing_level,
            "processing_reason": recommendation.processing_reason,
            "score_breakdown": recommendation.score_breakdown or {},
            "goal_compatibility": recommendation.goal_compatibility or {},
            "recommendations": recommendation.recommendations or [],
            "healthier_alternatives": recommendation.healthier_alternatives or []
        }
        
    # Generate PDF
    try:
        pdf_path = pdf_service.generate_report(profile_dict, analytics, scan_data, rec_dict, scan.extracted_json or {})
        return FileResponse(pdf_path, media_type='application/pdf', filename=f"Calyros_Nutrition_Report.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {e}")

from app.schemas.comparison import ComparisonRequest
from app.services.comparison_service import comparison_service

@router.post("/compare")
async def compare_products(
    payload: ComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await comparison_service.compare_products(
            db=db,
            scan_id_1=payload.scan_id_1,
            scan_id_2=payload.scan_id_2,
            user_id=current_user.id
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.alternatives_service import alternatives_service

@router.get("/{scan_id}/alternatives")
async def get_better_alternatives(
    scan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await alternatives_service.get_alternatives(
            db=db,
            scan_id=scan_id,
            user_id=current_user.id
        )
        return {"success": True, "data": result}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.services.insights_service import insights_service

@router.get("/insights/dashboard")
async def get_dashboard_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await insights_service.generate_insights(db=db, user_id=current_user.id)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
