"""
Real scan timing test. Logs in, sends a real image, and captures timing.
"""
import httpx
import time
import json
import sys
import os
from datetime import datetime, timezone
from PIL import Image, ImageDraw, ImageFont
import io

BASE = "http://localhost:8000/api/v1"

# Create a realistic synthetic nutrition label image
def create_test_label():
    img = Image.new('RGB', (400, 600), color='white')
    draw = ImageDraw.Draw(img)
    lines = [
        "Nutrition Facts",
        "Serving Size 1 cup (240mL)",
        "Calories 120",
        "Total Fat 5g",
        "Saturated Fat 1g",
        "Trans Fat 0g",
        "Sodium 150mg",
        "Total Carbohydrate 15g",
        "Dietary Fiber 2g",
        "Total Sugars 8g",
        "Protein 4g",
        "",
        "Ingredients: Milk, sugar, cocoa",
        "powder, natural flavors, salt.",
        "",
        "Chocolate Milk Beverage"
    ]
    y = 20
    for line in lines:
        draw.text((20, y), line, fill='black')
        y += 30
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    return buf.read()

def ts():
    return datetime.now(timezone.utc).isoformat(timespec='milliseconds')

async def main():
    async with httpx.AsyncClient(timeout=120.0) as client:
        # Step 1: Login
        print("=" * 60)
        print("STEP 1: LOGIN")
        print("=" * 60)
        login_resp = await client.post(f"{BASE}/auth/login", json={
            "email": "akshithreddy@gmail.com",
            "password": "123456789"
        })
        if login_resp.status_code != 200:
            # Try registering
            print(f"Login failed ({login_resp.status_code}). Trying alternate credentials...")
            # Try another common test account
            login_resp = await client.post(f"{BASE}/auth/login", json={
                "email": "test@test.com",
                "password": "test1234"
            })
            if login_resp.status_code != 200:
                print(f"Login failed: {login_resp.text}")
                print("Creating test account...")
                reg_resp = await client.post(f"{BASE}/auth/register", json={
                    "email": "perftest@nutrimind.ai",
                    "full_name": "Perf Test User",
                    "password": "perftest123"
                })
                if reg_resp.status_code not in [200, 400]:  # 400 = already exists
                    print(f"Registration failed: {reg_resp.text}")
                    return
                login_resp = await client.post(f"{BASE}/auth/login", json={
                    "email": "perftest@nutrimind.ai",
                    "password": "perftest123"
                })
                if login_resp.status_code != 200:
                    print(f"Login still failed: {login_resp.text}")
                    return

        token = login_resp.json()["access_token"]
        print(f"Login OK. Token obtained.")
        
        # Step 2: Send Scan
        print()
        print("=" * 60)
        print("STEP 2: REAL SCAN REQUEST")
        print("=" * 60)
        
        image_bytes = create_test_label()
        
        req_sent_ts = ts()
        req_start = time.time()
        
        scan_resp = await client.post(
            f"{BASE}/scan",
            files={"image": ("label.jpg", image_bytes, "image/jpeg")},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        req_end = time.time()
        resp_received_ts = ts()
        
        print(f"REQUEST_SENT        = {req_sent_ts}")
        print(f"RESPONSE_RECEIVED   = {resp_received_ts}")
        print(f"HTTP_STATUS         = {scan_resp.status_code}")
        print(f"REQUEST_ID          = {scan_resp.headers.get('x-request-id', 'N/A')}")
        print(f"ROUND_TRIP_MS       = {(req_end - req_start) * 1000:.2f}")
        print()
        
        if scan_resp.status_code == 200:
            data = scan_resp.json()
            print("SCAN_ID             =", data.get("scan_id"))
            print("PRODUCT_NAME        =", data.get("product", {}).get("product_name") if isinstance(data.get("product"), dict) else "N/A")
            print("HEALTH_SCORE        =", data.get("analysis", {}).get("health_score"))
            print("CLASSIFICATION      =", data.get("analysis", {}).get("classification"))
            
            # Print nutrition facts
            nf = data.get("nutrition_facts")
            if nf and hasattr(nf, '__iter__') and not isinstance(nf, str):
                if isinstance(nf, dict):
                    print("\nNUTRITION_FACTS:")
                    for k, v in nf.items():
                        print(f"  {k}: {v}")
        else:
            print(f"SCAN FAILED: {scan_resp.text}")
        
        print()
        print("=" * 60)
        print("CHECK BACKEND uvicorn LOGS FOR FULL PIPELINE TIMELINE")
        print("=" * 60)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
