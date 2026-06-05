from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin, get_current_user
from app.services.analytics_service import analytics_service
from app.services.user_analytics_service import user_analytics_service
from app.schemas.analytics import DashboardStats, AnalyticsTrends, HealthInsights
from app.models.user import User

router = APIRouter()

# Admin routes
@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return analytics_service.get_dashboard_stats(db)

@router.get("/trends", response_model=AnalyticsTrends)
def get_trends(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return analytics_service.get_trends(db)

@router.get("/health-insights", response_model=HealthInsights)
def get_health_insights(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return analytics_service.get_health_insights(db)

# User specific routes
@router.get("/me/dashboard")
def get_my_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return user_analytics_service.get_dashboard_stats(db, user.id)

@router.get("/me/trends")
def get_my_trends(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return user_analytics_service.get_trends(db, user.id)

@router.get("/me/health-insights")
def get_my_health_insights(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return user_analytics_service.get_health_insights(db, user.id)

