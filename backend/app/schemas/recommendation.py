from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class IngredientExplanationOutput(BaseModel):
    name: str
    explanation: str
    risk_level: str

class HealthAdvisorOutput(BaseModel):
    health_summary: str
    positives: List[str]
    concerns: List[str]
    consumption_guidance: str
    personalized_warning: Optional[str] = None
    ai_summary: str
    ingredient_explanations: List[IngredientExplanationOutput] = []

class RecommendationResponse(BaseModel):
    id: UUID
    scan_id: UUID
    health_summary: Optional[str] = None
    positives: List[str] = []
    concerns: List[str] = []
    ingredient_explanations: List[Dict[str, str]] = []
    alternatives: List[Dict[str, Any]] = []
    consumption_guidance: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class GenerateRecommendationRequest(BaseModel):
    scan_id: UUID
