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
    score: float
    classification: str
    nutrition_facts: dict
    all_detected_nutrients: List[dict] = []
    vitamins: List[dict] = []
    minerals: List[dict] = []
    ingredients: List[str] = []
    allergens: List[str] = []
    additives: List[str] = []
    key_findings: List[str] = []
    positive_factors: List[str] = []
    concerns: List[str] = []
    allergy_analysis: dict = {}
    personalized_analysis: str = ""
    recommendations: List[str] = []
    
    ingredient_quality_score: float = 100.0
    ingredient_findings: List[str] = []
    processing_assessment: str = "Unknown"
    confidence_score: float = 100.0
    
    # New Nutrition Intelligence fields
    sugar_risk_score: dict = {}
    protein_density_score: dict = {}
    satiety_score: dict = {}
    glycemic_impact: dict = {}
    goal_alignment: dict = {}
    personalized_verdict: dict = {}
    bmi_status: dict = {}
    profile_used: dict = {}

    model_config = ConfigDict(from_attributes=True)
