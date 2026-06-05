import requests
import json
import base64

API_URL = "http://localhost:8000/api/v1"

# 1. Login
try:
    print("Testing Login...")
    resp = requests.post(f"{API_URL}/auth/login", json={"email": "akshith@example.com", "password": "securepassword123"})
    print(resp.status_code, resp.text)
    token = resp.json().get("access_token")
    
    # 2. Get /auth/me
    print("\nTesting /auth/me...")
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = requests.get(f"{API_URL}/auth/me", headers=headers)
    print(me_resp.status_code, me_resp.text)
    
except Exception as e:
    print(f"Error: {e}")
