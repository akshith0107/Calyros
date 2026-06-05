from sqlalchemy import Column, Boolean, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class Allergy(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "allergies"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    milk = Column(Boolean, default=False)
    gluten = Column(Boolean, default=False)
    soy = Column(Boolean, default=False)
    nuts = Column(Boolean, default=False)
    eggs = Column(Boolean, default=False)
    seafood = Column(Boolean, default=False)
    sesame = Column(Boolean, default=False)
    shellfish = Column(Boolean, default=False)
    other_allergies = Column(String, nullable=True)

    user = relationship("User", back_populates="allergy")
