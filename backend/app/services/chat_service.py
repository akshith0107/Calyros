import json
import logging
from uuid import UUID
from sqlalchemy.orm import Session
from groq import AsyncGroq

from app.core.config import settings
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.scan_history import ScanHistory
from app.services.profile_service import profile_service

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY_CHAT
        self.model = settings.GROQ_MODEL_CHAT
        if self.api_key and self.api_key != "dummy":
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None

    def start_session(self, db: Session, user_id: UUID, scan_id: UUID) -> ChatSession:
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")
            
        session = ChatSession(user_id=user_id, scan_id=scan_id)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_history(self, db: Session, user_id: UUID, scan_id: UUID) -> ChatSession:
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        if scan.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this scan")

        session = db.query(ChatSession).filter(ChatSession.scan_id == scan_id).first()
        return session

    async def send_message(self, db: Session, user_id: UUID, session_id: UUID, message: str) -> ChatMessage:
        if not self.client:
            raise ValueError("GROQ_API_KEY_CHAT is missing. Chat is disabled.")

        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        if session.user_id != user_id:
            raise PermissionError("Forbidden: You do not own this session")

        # 1. Save user message
        user_msg = ChatMessage(session_id=session_id, role="user", content=message)
        db.add(user_msg)
        db.commit()

        # 2. Gather context
        scan = session.scan
        profile = profile_service.get_profile(db, user_id)
        
        # Profile Context
        profile_context = ""
        if profile and isinstance(profile, dict):
            profile_context = json.dumps({k: v for k, v in profile.items() if not k.startswith('_')}, default=str)
        elif profile:
            profile_context = json.dumps({k: v for k, v in profile.__dict__.items() if not k.startswith('_')}, default=str)
            
        # Scan Context
        scan_context = json.dumps({
            "extracted_json": scan.extracted_json,
            "analysis_json": scan.analysis_json
        }, indent=2, default=str)

        # 3. Build message history
        messages_db = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
        
        sys_prompt = (
            "You are Nutra AI, a highly knowledgeable and friendly nutrition assistant. "
            "Your goal is to answer the user's questions about the food product they just scanned. "
            "Keep your answers helpful, concise, and scientifically accurate based on their profile.\n\n"
            f"USER PROFILE:\n{profile_context}\n\n"
            f"SCANNED PRODUCT CONTEXT:\n{scan_context}"
        )
        
        groq_messages = [{"role": "system", "content": sys_prompt}]
        for msg in messages_db:
            groq_messages.append({"role": msg.role, "content": msg.content})

        # 4. Call LLM
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=groq_messages,
                temperature=0.4,
                max_tokens=800
            )
            ai_content = response.choices[0].message.content
        except Exception as e:
            logger.error(f"Chat completion failed: {e}")
            raise RuntimeError(f"AI response failed: {e}")

        # 5. Save assistant message
        ai_msg = ChatMessage(session_id=session_id, role="assistant", content=ai_content)
        db.add(ai_msg)
        db.commit()
        db.refresh(ai_msg)

        return ai_msg

chat_service = ChatService()
