from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Union
from uuid import UUID
from datetime import datetime

class ScoreCalculateRequest(BaseModel):
    scan_id: UUID

class ScoreComponent(BaseModel):
    score: float
    max_score: float
    explanation: str

class NutrientDetail(BaseModel):
    value: float
    unit: str
    category: str
    explanation: str

class DynamicNutrient(BaseModel):
    name: str
    value: Optional[str] = None
    explanation: str
    category: Optional[str] = None

class DynamicConcern(BaseModel):
    name: str
    explanation: str

class ProductInsight(BaseModel):
    title: str
    explanation: str

class DynamicNutritionBreakdown(BaseModel):
    key_findings: List[ProductInsight] = []
    key_nutrients: List[DynamicNutrient] = []
    vitamins_minerals: List[DynamicNutrient] = []
    beneficial_compounds: List[str] = []
    potential_concerns: List[DynamicConcern] = []
    product_allergens: List[str] = []
    matched_allergies: List[str] = []
    has_allergy_conflict: bool = False
    allergens: List[str] = []
    additives: List[str] = []

class ScoreResponse(BaseModel):
    # Backward compatibility fields (optional)
    nutrition_score: Optional[float] = None
    ingredient_score: Optional[float] = None
    processing_score: Optional[float] = None
    compatibility_score: Optional[float] = None
    overall_score: float
    classification: str
    warnings: List[str]
    flags: List[str]

    # New Intelligence Engine Fields
    nutrition_breakdown: Optional[Union[DynamicNutritionBreakdown, dict[str, NutrientDetail]]] = None
    score_breakdown: Optional[dict[str, ScoreComponent]] = None
    personalized_analysis: Optional[str] = None
    recommendations: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)
