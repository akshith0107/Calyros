import sys
from app.core.database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1"))
        print("DB Connected:", res.scalar())
except Exception as e:
    print("DB Connection failed:", str(e))
    sys.exit(1)
