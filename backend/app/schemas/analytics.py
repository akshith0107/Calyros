from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardStats(BaseModel):
    total_users: int
    total_scans: int
    total_products: int
    average_score: float
    top_allergens: List[str]
    most_scanned_products: List[Dict[str, Any]]

class TrendData(BaseModel):
    date: str
    count: int

class AnalyticsTrends(BaseModel):
    daily: List[TrendData]
    weekly: List[TrendData]
    monthly: List[TrendData]

class HealthInsights(BaseModel):
    diabetes_prevalence: float
    allergy_prevalence: float
    common_risk_flags: List[Dict[str, Any]]
