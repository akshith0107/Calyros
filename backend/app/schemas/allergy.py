from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class AllergyBase(BaseModel):
    milk: bool = False
    gluten: bool = False
    soy: bool = False
    nuts: bool = False
    eggs: bool = False
    peanuts: bool = False
    seafood: bool = False
    sesame: bool = False
    shellfish: bool = False
    wheat: bool = False
    other_allergies: Optional[str] = None

class AllergyCreate(AllergyBase):
    user_id: UUID

class AllergyUpdate(AllergyBase):
    pass

class AllergyResponse(AllergyBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
