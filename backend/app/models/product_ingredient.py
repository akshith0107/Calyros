from sqlalchemy import Column, ForeignKey
from app.core.database import Base
from sqlalchemy.dialects.postgresql import UUID

class ProductIngredient(Base):
    __tablename__ = "product_ingredients"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(UUID(as_uuid=True), ForeignKey("ingredients.id", ondelete="CASCADE"), primary_key=True)
