from sqlalchemy import Column, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class DietaryPreference(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "dietary_preferences"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    vegetarian = Column(Boolean, default=False)
    vegan = Column(Boolean, default=False)
    jain = Column(Boolean, default=False)
    halal = Column(Boolean, default=False)
    keto = Column(Boolean, default=False)
    high_protein = Column(Boolean, default=False)
    weight_loss = Column(Boolean, default=False)
    muscle_gain = Column(Boolean, default=False)
    general_fitness = Column(Boolean, default=False)

    user = relationship("User", back_populates="dietary_preference")
