from sqlalchemy import Column, Boolean, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class HealthCondition(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "health_conditions"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    diabetes = Column(Boolean, default=False)
    hypertension = Column(Boolean, default=False)
    cholesterol = Column(Boolean, default=False)
    kidney_disease = Column(Boolean, default=False)
    liver_disease = Column(Boolean, default=False)
    thyroid_disorder = Column(Boolean, default=False)
    heart_disease = Column(Boolean, default=False)
    obesity = Column(Boolean, default=False)
    pcos = Column(Boolean, default=False)
    other_conditions = Column(String, nullable=True)

    user = relationship("User", back_populates="health_condition")
