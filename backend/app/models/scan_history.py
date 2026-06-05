from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID, JSONB

class ScanHistory(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "scan_history"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    
    image_url = Column(String, nullable=True)
    overall_score = Column(Float, nullable=True)
    
    # Dual-Model Pipeline Data
    raw_ocr_text = Column(String, nullable=True)
    extracted_json = Column(JSONB, nullable=True)
    analysis_json = Column(JSONB, nullable=True)
    
    # Performance Tracking
    ocr_time_ms = Column(Float, nullable=True)
    extraction_time_ms = Column(Float, nullable=True)
    analysis_time_ms = Column(Float, nullable=True)
    
    scanned_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="scan_history")
    product = relationship("Product", back_populates="scan_history")
    food_score = relationship("FoodScore", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    ai_recommendation = relationship("AIRecommendation", back_populates="scan", uselist=False, cascade="all, delete-orphan")
