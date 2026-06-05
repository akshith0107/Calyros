import easyocr
import io
import cv2
import numpy as np
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        # Initialize the EasyOCR reader. 
        # Using CPU by default for broader compatibility, unless GPU is strictly required.
        logger.info("Initializing EasyOCR Model (English)...")
        # Ensure it only initializes once
        self.reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        logger.info("EasyOCR Initialized.")

    async def extract_text(self, file_bytes: bytes) -> str:
        """
        Takes raw image bytes, preprocesses if necessary, and extracts text using EasyOCR.
        """
        logger.info("Stage 0: Starting EasyOCR Extraction")
        
        # 1. Convert bytes to OpenCV image
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image bytes for OCR.")

        # 2. Basic Preprocessing: Grayscale and Resize to improve speed
        gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Resize to max 1024 width/height to drastically speed up EasyOCR
        max_dim = 1024
        h, w = gray_img.shape
        if max(h, w) > max_dim:
            scale = max_dim / max(h, w)
            gray_img = cv2.resize(gray_img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        # 3. Perform OCR
        logger.info(f"Running EasyOCR on image of size {gray_img.shape}...")
        results = self.reader.readtext(gray_img)

        # 4. Compile raw text
        # results format: [(bounding_box, text, confidence), ...]
        extracted_lines = [res[1] for res in results]
        raw_text = "\n".join(extracted_lines)

        logger.info(f"Stage 0 OCR Extraction Complete. Characters extracted: {len(raw_text)}")
        logger.debug(f"RAW OCR TEXT OUTPUT:\n{raw_text}")

        if not raw_text.strip():
            raise ValueError("OCR failed to extract any readable text from the image.")

        return raw_text

ocr_service = OCRService()
