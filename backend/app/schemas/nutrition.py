from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from uuid import UUID

class NutritionFactResponse(BaseModel):
    id: UUID
    product_id: UUID
    serving_size: Optional[str] = None
    calories: Optional[float] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)
    carbohydrates: Optional[float] = Field(None, ge=0)
    sugar: Optional[float] = Field(None, ge=0)
    added_sugar: Optional[float] = Field(None, ge=0)
    fiber: Optional[float] = Field(None, ge=0)
    sodium: Optional[float] = Field(None, ge=0)
    total_fat: Optional[float] = Field(None, ge=0)
    saturated_fat: Optional[float] = Field(None, ge=0)
    trans_fat: Optional[float] = Field(None, ge=0)
    
    model_config = ConfigDict(from_attributes=True)

class IngredientResponse(BaseModel):
    id: UUID
    ingredient_name: str
    category: Optional[str] = None
    risk_level: Optional[str] = None
    description: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
