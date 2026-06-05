from sqlalchemy import Column, String, Integer, Float, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class UserProfile(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    activity_level = Column(String, nullable=True)
    health_goal = Column(String, nullable=True)
    diet_type = Column(String, nullable=True)

    __table_args__ = (
        CheckConstraint('age >= 0 AND age <= 120', name='check_age_range'),
        CheckConstraint('height_cm >= 50 AND height_cm <= 300', name='check_height_range'),
        CheckConstraint('weight_kg >= 10 AND weight_kg <= 500', name='check_weight_range'),
    )

    user = relationship("User", back_populates="profile")
