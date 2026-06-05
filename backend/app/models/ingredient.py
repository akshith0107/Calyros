from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin

class Ingredient(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ingredients"

    ingredient_name = Column(String, index=True, nullable=False)
    category = Column(String, nullable=True)
    risk_level = Column(String, nullable=True)
    description = Column(String, nullable=True)

    products = relationship("Product", secondary="product_ingredients", back_populates="ingredients")
