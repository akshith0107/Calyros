from sqlalchemy import Column, Float, ForeignKey, CheckConstraint, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin

# Use JSONB for Postgres, gracefully fall back to JSON for SQLite testing
DbJSON = JSONB().with_variant(JSON(), "sqlite")

class FoodScore(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "food_scores"

    scan_id = Column(UUID(as_uuid=True), ForeignKey("scan_history.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    nutrition_score = Column(Float, nullable=True)
    ingredient_score = Column(Float, nullable=True)
    compatibility_score = Column(Float, nullable=True)
    processing_score = Column(Float, nullable=True)
    overall_score = Column(Float, nullable=True)

    classification = Column(String, nullable=True)
    flags = Column(DbJSON, default=list)
    warnings = Column(DbJSON, default=list)

    __table_args__ = (
        CheckConstraint('overall_score >= 0 AND overall_score <= 100', name='check_overall_score_range'),
    )

    scan = relationship("ScanHistory", back_populates="food_score")
