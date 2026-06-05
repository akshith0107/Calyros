from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class ScoreCalculateRequest(BaseModel):
    scan_id: UUID

class ScoreResponse(BaseModel):
    nutrition_score: float
    ingredient_score: float
    processing_score: float
    compatibility_score: float
    overall_score: float
    classification: str
    warnings: List[str]
    flags: List[str]

    model_config = ConfigDict(from_attributes=True)
