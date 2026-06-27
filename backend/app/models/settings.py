from sqlalchemy import Column, String, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin
from sqlalchemy.dialects.postgresql import UUID

class UserSettings(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_settings"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Appearance
    theme = Column(String, default="dark")
    ui_density = Column(String, default="comfortable")
    
    # Notifications
    email_notifications = Column(Boolean, default=True)
    product_alerts = Column(Boolean, default=True)
    weekly_reports = Column(Boolean, default=True)
    recommendation_alerts = Column(Boolean, default=True)
    
    # AI Preferences
    response_length = Column(String, default="concise")
    explanation_level = Column(String, default="expert")
    personalized_recommendations = Column(Boolean, default=True)
    auto_health_analysis = Column(Boolean, default=True)

    user = relationship("User", back_populates="settings")
