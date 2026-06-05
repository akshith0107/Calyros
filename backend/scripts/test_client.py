from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)
try:
    resp = client.post("/api/v1/auth/login", json={"email": "akshith@example.com", "password": "securepassword123"})
    print("STATUS:", resp.status_code)
    print("BODY:", resp.json())
except Exception as e:
    import traceback
    traceback.print_exc()
