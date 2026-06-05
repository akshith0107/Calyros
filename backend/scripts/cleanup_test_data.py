import asyncio
from sqlalchemy import text
from app.core.database import engine

def clean_test_data():
    print("--- STARTING CLEANUP ---")
    try:
        with engine.connect() as conn:
            # Delete users whose email starts with 'test_'
            # Because of SQLAlchemy ORM / DB constraints, deleting from 'users' might need cascade, 
            # but UserProfile, Allergy, DietaryPreference, HealthCondition models have foreign keys.
            # If the database has ON DELETE CASCADE configured, deleting the user deletes everything.
            # Let's delete from sub-tables first just in case.
            
            # Find test user IDs
            result = conn.execute(text("SELECT id FROM users WHERE email LIKE 'test_%'"))
            user_ids = [row[0] for row in result]
            
            if not user_ids:
                print("No test users found. DB is clean!")
                return
                
            print(f"Found {len(user_ids)} test users. Deleting...")
            
            for uid in user_ids:
                conn.execute(text(f"DELETE FROM user_profiles WHERE user_id = '{uid}'"))
                conn.execute(text(f"DELETE FROM health_conditions WHERE user_id = '{uid}'"))
                conn.execute(text(f"DELETE FROM allergies WHERE user_id = '{uid}'"))
                conn.execute(text(f"DELETE FROM dietary_preferences WHERE user_id = '{uid}'"))
                conn.execute(text(f"DELETE FROM users WHERE id = '{uid}'"))
                
            conn.commit()
            print("--- CLEANUP COMPLETE ---")
    except Exception as e:
        print(f"Cleanup failed: {e}")

if __name__ == "__main__":
    clean_test_data()
