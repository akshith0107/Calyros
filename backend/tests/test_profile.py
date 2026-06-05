import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

# Ensure app is initialized before testing
from app.main import app
from app.core.database import get_db

def create_user_and_get_token(client):
    test_email = f"test_{uuid4()}@example.com"
    response = client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "securePassword123!",
        "full_name": "Test User"
    })
    
    # Login to get token
    login_resp = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "securePassword123!"
    })
    return login_resp.json()["access_token"]

def test_get_missing_profile(client):
    token = create_user_and_get_token(client)
    response = client.get("/api/v1/profile/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert data["error"]["type"] == "not_found"

def test_create_duplicate_profile(client):
    token = create_user_and_get_token(client)
    profile_payload = {
        "full_name": "Test Name",
        "profile": {"age": 25, "weight_kg": 70.0}
    }
    headers = {"Authorization": f"Bearer {token}"}
    
    # First creation should succeed
    resp1 = client.post("/api/v1/profile/create", json=profile_payload, headers=headers)
    assert resp1.status_code == 200
    
    # Second creation should return 400 Bad Request
    resp2 = client.post("/api/v1/profile/create", json=profile_payload, headers=headers)
    assert resp2.status_code == 400
    assert "Profile already exists" in resp2.json()["detail"]

def test_create_and_get_and_update_profile(client):
    token = create_user_and_get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create Profile
    profile_payload = {
        "full_name": "Updated Name",
        "profile": {
            "age": 30,
            "weight_kg": 80.0
        }
    }
    create_resp = client.post("/api/v1/profile/create", json=profile_payload, headers=headers)
    assert create_resp.status_code == 200, f"Profile Create failed: {create_resp.json()}"
    
    # 2. Get Profile
    get_resp = client.get("/api/v1/profile/me", headers=headers)
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["data"]["profile"]["age"] == 30
    
    # 3. Partial Update Profile (PUT)
    update_payload = {
        "profile": {
            "weight_kg": 75.0
        }
    }
    put_resp = client.put("/api/v1/profile/me", json=update_payload, headers=headers)
    assert put_resp.status_code == 200
    
    # Verify the partial update preserved age but changed weight
    get_resp2 = client.get("/api/v1/profile/me", headers=headers)
    get_data2 = get_resp2.json()
    assert get_data2["data"]["profile"]["age"] == 30
    assert get_data2["data"]["profile"]["weight_kg"] == 75.0

