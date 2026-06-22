from sqlalchemy import Column, ForeignKey, String, Text, Integer
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin

DbJSON = JSONB().with_variant(JSON(), "sqlite")

class AIRecommendation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_recommendations"

    scan_id = Column(UUID(as_uuid=True), ForeignKey("scan_history.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    health_score = Column(Integer, nullable=True)
    summary = Column(Text, nullable=True)
    strengths = Column(DbJSON, default=list)
    concerns = Column(DbJSON, default=list)
    weight_loss = Column(Text, nullable=True)
    muscle_gain = Column(Text, nullable=True)
    diabetes = Column(Text, nullable=True)
    hypertension = Column(Text, nullable=True)
    heart_health = Column(Text, nullable=True)
    recommendations = Column(JSONB)  # array of strings
    healthier_alternatives = Column(JSONB)  # array of objects
    
    # ADVANCED FIELDS (Phase 8)
    goal_compatibility = Column(JSONB, nullable=True)  # dict
    disease_compatibility = Column(JSONB, nullable=True) # dict
    score_breakdown = Column(JSONB, nullable=True) # dict
    processing_level = Column(String, nullable=True)
    processing_reason = Column(String, nullable=True)

    scan = relationship("ScanHistory", back_populates="ai_recommendation")
