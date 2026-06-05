from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    height_cm: Optional[float] = Field(None, ge=50.0, le=300.0)
    weight_kg: Optional[float] = Field(None, ge=10.0, le=500.0)
    activity_level: Optional[str] = None
    health_goal: Optional[str] = None
    diet_type: Optional[str] = None

class UserProfileCreate(UserProfileBase):
    user_id: UUID

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
