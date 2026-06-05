from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class IngredientBase(BaseModel):
    ingredient_name: str
    category: Optional[str] = None
    risk_level: Optional[str] = None
    description: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientUpdate(BaseModel):
    ingredient_name: Optional[str] = None
    category: Optional[str] = None
    risk_level: Optional[str] = None
    description: Optional[str] = None

class IngredientResponse(IngredientBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    product_name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    brand: Optional[str] = None
    category: Optional[str] = None
    barcode: Optional[str] = None
    image_url: Optional[str] = None

class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    ingredients: List[IngredientResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
