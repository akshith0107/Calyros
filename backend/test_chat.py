import asyncio
import uuid
import sys
import logging
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.chat_service import chat_service
from app.models.user import User
from app.models.scan_history import ScanHistory
from app.models.chat_session import ChatSession

logging.basicConfig(level=logging.INFO)

async def main():
    db = SessionLocal()
    try:
        user = db.query(User).first()
        if not user:
            print("No users found.")
            return

        scan = db.query(ScanHistory).filter(ScanHistory.user_id == user.id).first()
        if not scan:
            print("No scans found for user.")
            return

        print(f"Using user: {user.id}, scan: {scan.id}")

        session = db.query(ChatSession).filter(ChatSession.scan_id == scan.id).first()
        if not session:
            session = chat_service.start_session(db, user.id, scan.id)

        print(f"Session ID: {session.id}")
        
        gen = await chat_service.send_message_stream(db, user.id, session.id, "Hello, is this good for me?")
        async for chunk in gen:
            print(chunk, end="")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
