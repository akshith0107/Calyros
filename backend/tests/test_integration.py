import pytest
from fastapi.testclient import TestClient
from app.main import app
import uuid
import random
import string

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

@pytest.fixture
def test_user(client):
    # 1. Register User
    email = f"test_{random_string()}@example.com"
    password = "StrongPassword123!"
    
    response = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Integration Test"
    })
    
    assert response.status_code == 200
    user_data = response.json()
    
    # 2. Login User
    login_response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password
    })
    
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    return {
        "email": email,
        "token": token,
        "user_id": user_data["id"]
    }

def test_full_integration_flow(client, test_user):
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    
    # --- Profile Creation ---
    profile_payload = {
        "full_name": "Integration Test User",
        "profile": {
            "age": 30,
            "gender": "male",
            "height_cm": 180.0,
            "weight_kg": 75.0,
            "activity_level": "moderate",
            "health_goal": "maintain",
            "diet_type": "omnivore"
        },
        "health_conditions": {
            "diabetes": False,
            "hypertension": False
        },
        "allergies": {
            "milk": False,
            "gluten": False
        },
        "preferences": {
            "vegetarian": False
        }
    }
    
    profile_resp = client.post("/api/v1/profile/create", json=profile_payload, headers=headers)
    assert profile_resp.status_code == 200
    assert profile_resp.json()["success"] is True
    
    # Attempt duplicate creation -> Should be 400
    dup_profile_resp = client.post("/api/v1/profile/create", json=profile_payload, headers=headers)
    assert dup_profile_resp.status_code == 400
    
    # --- Profile Read ---
    get_profile_resp = client.get("/api/v1/profile/me", headers=headers)
    assert get_profile_resp.status_code == 200
    assert get_profile_resp.json()["data"]["profile"]["age"] == 30
    
    # --- Scan Pipeline (Upload Image) ---
    # We will upload a dummy 1x1 jpeg to test the mocked fallback pipeline
    dummy_image = b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x03\x02\x02\x02\x02\x02\x03\x02\x02\x02\x03\x03\x03\x03\x04\x06\x04\x04\x04\x04\x04\x08\x06\x06\x05\x06\t\x08\n\n\t\x08\t\t\n\x0c\x0f\x0c\n\x0b\x0e\x0b\t\t\r\x11\r\x0e\x0f\x10\x10\x11\x10\n\x0c\x12\x13\x12\x10\x13\x0f\x10\x10\x10\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\x37\xff\xd9'
    
    files = {"image": ("dummy.jpg", dummy_image, "image/jpeg")}
    scan_resp = client.post("/api/v1/scan", files=files, headers=headers)
    assert scan_resp.status_code == 200
    scan_data = scan_resp.json()
    assert scan_data["success"] is True
    scan_id = scan_data["scan_id"]
    
    # --- Scoring ---
    score_resp = client.post("/api/v1/scoring/calculate", json={"scan_id": scan_id}, headers=headers)
    assert score_resp.status_code == 200
    assert score_resp.json()["success"] is True
    
    # --- Recommendations ---
    rec_resp = client.post("/api/v1/recommendations/generate", json={"scan_id": scan_id}, headers=headers)
    assert rec_resp.status_code == 200
    assert rec_resp.json()["success"] is True
    
    # --- History ---
    history_resp = client.get("/api/v1/scan/history/me", headers=headers)
    assert history_resp.status_code == 200
    assert len(history_resp.json()) > 0
    assert history_resp.json()[0]["id"] == scan_id
    
    # --- Dashboard ---
    dash_resp = client.get("/api/v1/analytics/me/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    assert dash_resp.json()["total_scans"] > 0
