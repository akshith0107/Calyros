from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserSettingsBase(BaseModel):
    # Appearance
    theme: Optional[str] = "dark"
    ui_density: Optional[str] = "comfortable"
    
    # Notifications
    email_notifications: Optional[bool] = True
    product_alerts: Optional[bool] = True
    weekly_reports: Optional[bool] = True
    recommendation_alerts: Optional[bool] = True
    
    # AI Preferences
    response_length: Optional[str] = "concise"
    explanation_level: Optional[str] = "expert"
    personalized_recommendations: Optional[bool] = True
    auto_health_analysis: Optional[bool] = True

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettingsResponse(UserSettingsBase):
    model_config = ConfigDict(from_attributes=True)
