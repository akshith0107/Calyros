from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin

class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="USER") # USER or ADMIN

    # Relationships (1:1 and 1:N)
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    health_condition = relationship("HealthCondition", back_populates="user", uselist=False, cascade="all, delete-orphan")
    allergy = relationship("Allergy", back_populates="user", uselist=False, cascade="all, delete-orphan")
    dietary_preference = relationship("DietaryPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    scan_history = relationship("ScanHistory", back_populates="user", cascade="all, delete-orphan")
