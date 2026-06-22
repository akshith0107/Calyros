from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from uuid import UUID

class ComparisonRequest(BaseModel):
    scan_id_1: UUID
    scan_id_2: UUID

class ComparisonScore(BaseModel):
    product_1: int
    product_2: int

class DetailedComparison(BaseModel):
    product_1_value: str
    product_2_value: str
    better_product: str  # "product_1", "product_2", or "tie"
    reason: str

class ComparisonResponse(BaseModel):
    winner: str # "product_1", "product_2", or "tie"
    overall_comparison_score: ComparisonScore
    nutrition_comparison: DetailedComparison
    ingredient_comparison: DetailedComparison
    processing_comparison: DetailedComparison
    allergy_comparison: DetailedComparison
    
    strengths_product_1: List[str]
    strengths_product_2: List[str]
    
    weaknesses_product_1: List[str]
    weaknesses_product_2: List[str]
    
    personalized_recommendation: str
    reasoning: str
