import sys
from app.core.database import SessionLocal
from app.models.user import User

try:
    db = SessionLocal()
    user = db.query(User).first()
    print("User:", user)
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
