from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class HealthConditionBase(BaseModel):
    diabetes: bool = False
    hypertension: bool = False
    cholesterol: bool = False
    kidney_disease: bool = False
    liver_disease: bool = False
    thyroid_disorder: bool = False
    heart_disease: bool = False
    obesity: bool = False
    pcos: bool = False
    other_conditions: Optional[str] = None

class HealthConditionCreate(HealthConditionBase):
    user_id: UUID

class HealthConditionUpdate(HealthConditionBase):
    pass

class HealthConditionResponse(HealthConditionBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
