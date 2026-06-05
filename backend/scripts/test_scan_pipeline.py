import asyncio
import os
import requests
from uuid import uuid4

# Use test_profile_module.py as inspiration to register a user and get a token
BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_scan_pipeline():
    print("--- STEP 1: AUTHENTICATING ---")
    email = f"scan_test_{uuid4()}@example.com"
    requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": "securePassword123!",
        "full_name": "Scanner Tester"
    })
    
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": "securePassword123!"
    })
    token = login_resp.json()["access_token"]
    print(f"Token acquired: {token[:10]}...")

    print("\n--- STEP 2: CREATING DUMMY IMAGE ---")
    img_path = "test_image.jpg"
    with open(img_path, "wb") as f:
        # A tiny valid 1x1 JPEG image
        f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x03\x02\x02\x02\x02\x02\x03\x02\x02\x02\x03\x03\x03\x03\x04\x06\x04\x04\x04\x04\x04\x08\x06\x06\x05\x06\t\x08\n\n\t\x08\t\t\n\x0c\x0f\x0c\n\x0b\x0e\x0b\t\t\r\x11\r\x0e\x0f\x10\x10\x11\x10\n\x0c\x12\x13\x12\x10\x13\x0f\x10\x10\x10\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00\x37\xff\xd9')
    print("Created test_image.jpg")

    print("\n--- STEP 3: SENDING POST /scan ---")
    with open(img_path, "rb") as f:
        files = {"image": ("test_image.jpg", f, "image/jpeg")}
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/scan", files=files, headers=headers)
        
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
    
    # Cleanup
    if os.path.exists(img_path):
        os.remove(img_path)

if __name__ == "__main__":
    test_scan_pipeline()
