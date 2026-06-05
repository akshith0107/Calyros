from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class DietaryPreferenceBase(BaseModel):
    vegetarian: bool = False
    vegan: bool = False
    jain: bool = False
    halal: bool = False
    keto: bool = False
    high_protein: bool = False
    weight_loss: bool = False
    muscle_gain: bool = False
    general_fitness: bool = False

class DietaryPreferenceCreate(DietaryPreferenceBase):
    user_id: UUID

class DietaryPreferenceUpdate(DietaryPreferenceBase):
    pass

class DietaryPreferenceResponse(DietaryPreferenceBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
