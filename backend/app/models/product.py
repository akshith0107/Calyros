from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin

class Product(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "products"

    product_name = Column(String, index=True, nullable=False)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=True)
    barcode = Column(String, unique=True, index=True, nullable=True)
    image_url = Column(String, nullable=True)

    # Relationships
    nutrition_fact = relationship("NutritionFact", back_populates="product", uselist=False, cascade="all, delete-orphan")
    scan_history = relationship("ScanHistory", back_populates="product", cascade="all, delete-orphan")
    
    ingredients = relationship("Ingredient", secondary="product_ingredients", back_populates="products")
