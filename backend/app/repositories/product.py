from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.product import Product
from app.models.ingredient import Ingredient
from app.models.scan_history import ScanHistory
from app.schemas.product import ProductCreate, ProductUpdate, IngredientCreate, IngredientUpdate
from app.schemas.scan import ScanHistoryCreate, ScanHistoryUpdate

class ProductRepository(BaseRepository[Product, ProductCreate, ProductUpdate]):
    def get_by_barcode(self, db: Session, barcode: str) -> Optional[Product]:
        return db.query(self.model).filter(self.model.barcode == barcode).first()

class IngredientRepository(BaseRepository[Ingredient, IngredientCreate, IngredientUpdate]):
    def get_by_name(self, db: Session, name: str) -> Optional[Ingredient]:
        return db.query(self.model).filter(self.model.ingredient_name == name).first()

class ScanRepository(BaseRepository[ScanHistory, ScanHistoryCreate, ScanHistoryUpdate]):
    pass

product_repo = ProductRepository(Product)
ingredient_repo = IngredientRepository(Ingredient)
scan_repo = ScanRepository(ScanHistory)
