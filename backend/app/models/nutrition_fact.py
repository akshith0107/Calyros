from sqlalchemy import Column, Float, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class NutritionFact(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "nutrition_facts"

    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    serving_size = Column(String, nullable=True)
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    carbohydrates = Column(Float, nullable=True)
    sugar = Column(Float, nullable=True)
    added_sugar = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)
    sodium = Column(Float, nullable=True)
    total_fat = Column(Float, nullable=True)
    saturated_fat = Column(Float, nullable=True)
    trans_fat = Column(Float, nullable=True)

    # Dynamic Discovery Storage
    dynamic_facts = Column(JSON, nullable=True, default=dict)
    vitamins = Column(JSON, nullable=True, default=dict)
    minerals = Column(JSON, nullable=True, default=dict)
    amino_acids = Column(JSON, nullable=True, default=dict)

    product = relationship("Product", back_populates="nutrition_fact")
