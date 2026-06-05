import logging
import sys
from app.core.config import settings

def setup_logging():
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    logging.basicConfig(
        level=level,
        format=log_format,
        datefmt=date_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("backend.log", encoding="utf-8")
        ]
    )
    
    # Silence overly verbose third-party loggers if needed
    logging.getLogger("passlib").setLevel(logging.ERROR)
