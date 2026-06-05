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

    async def send_message_stream(self, db: Session, user_id: UUID, session_id: UUID, message: str):
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
        profile_context = "No profile available."
        if profile and isinstance(profile, dict):
            profile_context = json.dumps({
                "age": profile.get("age"),
                "gender": profile.get("gender"),
                "weight": profile.get("weight"),
                "activity_level": profile.get("activity_level"),
                "health_goal": profile.get("health_goal"),
                "diet_type": profile.get("diet_type"),
                "allergies": profile.get("allergies", [])
            }, indent=2)
        elif profile:
            profile_context = json.dumps({
                "age": getattr(profile, "age", None),
                "gender": getattr(profile, "gender", None),
                "weight": getattr(profile, "weight", None),
                "activity_level": getattr(profile, "activity_level", None),
                "health_goal": getattr(profile, "health_goal", None),
                "diet_type": getattr(profile, "diet_type", None),
                "allergies": [al.name for al in getattr(profile, "allergies", [])] if getattr(profile, "allergies", None) else []
            }, indent=2)
            
        # Scan Context
        analysis = scan.analysis_json if scan.analysis_json else {}
        extracted = scan.extracted_json if scan.extracted_json else {}
        
        scan_context = json.dumps({
            "product_name": extracted.get("product_name"),
            "ingredients": extracted.get("ingredients"),
            "nutrition_facts": extracted.get("nutrition_facts"),
            "health_score": analysis.get("health_score"),
            "classification": analysis.get("classification"),
            "score_breakdown": analysis.get("score_breakdown"),
            "key_findings": analysis.get("nutrition_breakdown", {}).get("key_findings", []),
            "allergens": analysis.get("nutrition_breakdown", {}).get("product_allergens", [])
        }, indent=2)

        # 3. Build message history
        messages_db = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
        
        sys_prompt = (
            "You are Nutra AI, an expert nutrition assistant.\n"
            "Always answer based on:\n"
            "1. The user's exact message.\n"
            "2. The scanned product.\n"
            "3. The user's health profile.\n"
            "4. The nutrition facts.\n\n"
            "Never provide generic nutrition advice. Reference actual nutrition values whenever available.\n"
            "If user asks 'Can I eat this?', answer specifically about the scanned product.\n"
            "If user asks 'Is this good for weight loss?', evaluate using calories, sugar, protein, fiber from the scanned product.\n"
            "If user asks follow-up questions, use scan context before giving general advice.\n\n"
            f"USER PROFILE:\n{profile_context}\n\n"
            f"SCANNED PRODUCT CONTEXT:\n{scan_context}"
        )
        
        groq_messages = [{"role": "system", "content": sys_prompt}]
        for msg in messages_db:
            if msg.role != "system":
                groq_messages.append({"role": msg.role, "content": msg.content})

        # 4. Stream response
        async def event_generator():
            ai_content = ""
            try:
                stream = await self.client.chat.completions.create(
                    model=self.model,
                    messages=groq_messages,
                    temperature=0.4,
                    max_tokens=800,
                    stream=True
                )
                async for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta.content:
                        token = chunk.choices[0].delta.content
                        ai_content += token
                        # Yield in SSE format
                        yield f"data: {json.dumps({'text': token})}\n\n"
                        
                # End of stream marker
                yield "data: [DONE]\n\n"
                
                # 5. Save assistant message after stream finishes
                ai_msg = ChatMessage(session_id=session_id, role="assistant", content=ai_content)
                db.add(ai_msg)
                db.commit()
                
            except Exception as e:
                logger.error(f"Chat stream failed: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return event_generator()

chat_service = ChatService()
