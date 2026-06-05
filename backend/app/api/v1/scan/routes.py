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
