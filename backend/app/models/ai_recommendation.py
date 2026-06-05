from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin

DbJSON = JSONB().with_variant(JSON(), "sqlite")

class AIRecommendation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_recommendations"

    scan_id = Column(UUID(as_uuid=True), ForeignKey("scan_history.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    health_summary = Column(Text, nullable=True)
    positives = Column(DbJSON, default=list)
    concerns = Column(DbJSON, default=list)
    ingredient_explanations = Column(DbJSON, default=list)
    alternatives = Column(DbJSON, default=list)
    consumption_guidance = Column(String, nullable=True)
    ai_summary = Column(Text, nullable=True)

    scan = relationship("ScanHistory", back_populates="ai_recommendation")
