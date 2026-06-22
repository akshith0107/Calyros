import sys
import json
from app.core.database import SessionLocal
from app.models.scan_history import ScanHistory

db = SessionLocal()
scan_id = "1e6e8988-3ed9-4721-a14a-3106450c6976"
scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()

if not scan:
    print("Scan not found")
    sys.exit(1)

print("=== RAW OCR TEXT ===")
print(scan.raw_ocr_text[:500] if scan.raw_ocr_text else "None")
print("\n=== EXTRACTED JSON ===")
print(json.dumps(scan.extracted_json, indent=2)[:500])
print("\n=== ANALYSIS JSON ===")
print(json.dumps(scan.analysis_json, indent=2)[:500])
