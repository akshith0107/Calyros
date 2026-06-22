from sqlalchemy import Column, String, Float, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class BMIHistory(Base):
    __tablename__ = "bmi_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    bmi = Column(Float, nullable=False)
    category = Column(String, nullable=False) # Underweight, Normal, Overweight, Obese
    health_assessment = Column(String, nullable=True)
    ideal_weight_range = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class NutritionTargets(Base):
    __tablename__ = "nutrition_targets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    daily_calories = Column(Integer, nullable=False)
    protein_target_g = Column(Integer, nullable=False)
    carb_target_g = Column(Integer, nullable=False)
    fat_target_g = Column(Integer, nullable=False)
    water_target_liters = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserGoals(Base):
    __tablename__ = "user_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    goal_name = Column(String, nullable=False) # e.g. "Weight Loss", "Muscle Gain"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
