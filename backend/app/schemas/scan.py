from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from .nutrition import NutritionFactResponse, IngredientResponse

class ScanResponse(BaseModel):
    success: bool
    product: Optional[dict] = None
    nutrition_facts: Optional[NutritionFactResponse] = None
    ingredients: List[IngredientResponse] = []
    image_url: Optional[str] = None
    message: Optional[str] = None

class ScanHistoryListResponse(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    image_url: Optional[str] = None
    overall_score: Optional[float] = None
    analysis_json: Optional[dict] = None
    scanned_at: Optional[datetime] = None
    created_at: datetime
    product_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
