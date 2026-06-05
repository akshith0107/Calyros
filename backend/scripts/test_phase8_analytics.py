import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.api.v1.analytics.routes import get_dashboard, get_trends, get_health_insights
from app.api.v1.system.routes import get_system_status
import asyncio

async def test_analytics():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("--- Testing Analytics & System Health ---")
        
        # 1. Dashboard
        dash = get_dashboard(db)
        print(f"[SUCCESS] Dashboard Stats: {dash['total_users']} Users, {dash['total_scans']} Scans")
        
        # 2. Trends
        trends = get_trends(db)
        print(f"[SUCCESS] Trends extracted: {len(trends['daily'])} daily records.")

        # 3. Health Insights
        health = get_health_insights(db)
        print(f"[SUCCESS] Health Insights: {health['diabetes_prevalence']}% Diabetes, {health['allergy_prevalence']}% Allergies")

        # 4. System Status
        status = await get_system_status()
        print(f"[SUCCESS] System Status: DB={status['database']}, Redis={status['redis']}")
        
    except Exception as e:
        print(f"[ERROR] Analytics test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_analytics())
