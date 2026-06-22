from pydantic import BaseModel
from typing import List

class AlternativeItem(BaseModel):
    name: str
    reason: str
    benefits: List[str]
    expected_improvement: str

class AlternativesResponse(BaseModel):
    alternatives: List[AlternativeItem]
