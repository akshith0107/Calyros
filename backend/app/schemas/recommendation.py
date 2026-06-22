from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class HealthAdvisorOutput(BaseModel):
    health_score: int
    summary: str
    strengths: List[str]
    concerns: List[str]
    score_breakdown: Dict[str, int]
    goal_compatibility: Dict[str, str]
    disease_compatibility: Dict[str, Dict[str, str]]
    recommendations: List[str]
    healthier_alternatives: List[Dict[str, Any]]

class RecommendationResponse(BaseModel):
    id: UUID
    scan_id: UUID
    health_score: Optional[int] = None
    summary: Optional[str] = None
    strengths: List[str] = []
    concerns: List[str] = []
    score_breakdown: Dict[str, int] = {}
    goal_compatibility: Dict[str, str] = {}
    disease_compatibility: Dict[str, Dict[str, str]] = {}
    processing_level: Optional[str] = None
    processing_reason: Optional[str] = None
    recommendations: List[str] = []
    healthier_alternatives: List[Dict[str, Any]] = []
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class GenerateRecommendationRequest(BaseModel):
    scan_id: UUID
