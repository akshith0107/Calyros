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
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_REASONING_MODEL
        if self.api_key and self.api_key != "dummy":
            self.client = AsyncGroq(api_key=self.api_key)
        else:
            self.client = None
            
        # Hardcoded context limits
        self.max_history_turns = 10 
        self.max_tokens = 512

    async def _get_scan_context(self, db: Session, scan_id: UUID, user_id: UUID) -> str:
        """Fetch scan and format it as a context string."""
        scan = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
        if not scan:
            return "No scan context available."
        if scan.user_id != user_id:
            return "User does not have permission to view this scan."

        product_name = scan.product_name or "Unknown Product"
        analysis = scan.analysis_json or {}
        
        context = f"Product: {product_name}\n"
        context += f"Overall Score: {scan.overall_score}/100\n"
        
        if analysis.get('sugar_risk_score'):
            context += f"Sugar Risk: {analysis['sugar_risk_score'].get('risk_level')} ({analysis['sugar_risk_score'].get('explanation')})\n"
        if analysis.get('protein_density_score'):
            context += f"Protein Density: {analysis['protein_density_score'].get('classification')} (Muscle Gain suitability: {analysis['protein_density_score'].get('muscle_gain')})\n"
        if analysis.get('goal_alignment'):
            context += f"Goal Alignment: {analysis['goal_alignment'].get('explanation')}\n"
        if analysis.get('bmi_status') and analysis['bmi_status'].get('bmi'):
            context += f"User BMI: {analysis['bmi_status'].get('bmi')} ({analysis['bmi_status'].get('status')})\n"
        if analysis.get('satiety_score_details'):
            context += f"Satiety: {analysis['satiety_score_details'].get('level')} ({analysis['satiety_score_details'].get('hunger_return')} hunger return)\n"
            
        if analysis.get('processing_level'):
            context += f"Processing: {analysis['processing_level']}\n"
            
        findings = analysis.get('key_findings', [])
        if findings:
            context += "Key Findings: " + "; ".join(findings) + "\n"
            
        recs = analysis.get('recommendations', [])
        if recs:
            context += "Recommendations: " + "; ".join(recs) + "\n"

        return context



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
            raise ValueError("GROQ_API_KEY is missing. Chat is disabled.")

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
            prof = profile.get("profile")
            algy = profile.get("allergies")
            
            extracted_allergies = []
            if algy:
                if getattr(algy, 'milk', False): extracted_allergies.append("milk")
                if getattr(algy, 'gluten', False): extracted_allergies.append("gluten")
                if getattr(algy, 'soy', False): extracted_allergies.append("soy")
                if getattr(algy, 'nuts', False): extracted_allergies.append("nuts")
                if getattr(algy, 'eggs', False): extracted_allergies.append("eggs")
                if getattr(algy, 'seafood', False): extracted_allergies.append("seafood")
                if getattr(algy, 'sesame', False): extracted_allergies.append("sesame")
                if getattr(algy, 'shellfish', False): extracted_allergies.append("shellfish")
                if getattr(algy, 'other_allergies', None): extracted_allergies.append(getattr(algy, 'other_allergies'))
            
            profile_context = json.dumps({
                "age": getattr(prof, "age", None) if prof else None,
                "gender": getattr(prof, "gender", None) if prof else None,
                "weight": getattr(prof, "weight_kg", None) if prof else None,
                "activity_level": getattr(prof, "activity_level", None) if prof else None,
                "health_goal": getattr(prof, "health_goal", None) if prof else None,
                "diet_type": getattr(prof, "diet_type", None) if prof else None,
                "allergies": extracted_allergies
            }, indent=2)
            
        # Scan Context
        analysis = scan.analysis_json if scan.analysis_json else {}
        extracted = scan.extracted_json if scan.extracted_json else {}
        
        scan_context = json.dumps({
            "product_name": scan.product_name or "Unknown Product",
            "nutrition_facts": extracted.get("nutrition_facts", {}),
            "ingredients": extracted.get("ingredients", []),
            "allergens": extracted.get("allergens", []),
            "processing_assessment": analysis.get("processing_assessment", "Unknown"),
            "personalized_analysis": analysis.get("personalized_analysis", ""),
            "user_bmi_data": analysis.get("bmi_status", {}),
            "score": analysis.get("score") or analysis.get("overall_score"),
            "classification": analysis.get("classification"),
            "key_findings": analysis.get("key_findings", []),
            "vitamins": extracted.get("vitamins", []),
            "minerals": extracted.get("minerals", []),
            "concerns": analysis.get("concerns", []),
            "recommendations": analysis.get("recommendations", []),
            "alternatives": analysis.get("alternatives", [])
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
            "CRITICAL RULES:\n"
            "- You ALREADY HAVE the nutrition facts, ingredients, and profile. NEVER respond with 'I don't have the nutrition facts' or ask the user to provide them.\n"
            "- Never provide generic nutrition advice. Reference actual nutrition values whenever available.\n"
            "- If user asks 'Can I eat this?', answer specifically about the scanned product.\n"
            "- If user asks 'Is this good for weight loss?' or 'Is this good for muscle gain?', evaluate using calories, sugar, protein, fiber from the scanned product against their BMI and goals.\n"
            "- If user asks follow-up questions, use scan context before giving general advice.\n"
            "- If user asks 'What should I eat instead?' or for alternatives, ALWAYS use the generated alternatives provided in the context.\n\n"
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
                if ai_content:
                    ai_msg = ChatMessage(session_id=session_id, role="assistant", content=ai_content)
                    db.add(ai_msg)
                    db.commit()
                
            except Exception as e:
                logger.error(f"Chat stream failed: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return event_generator()

    async def send_compare_message_stream(self, db: Session, user_id: UUID, scan_id_1: UUID, scan_id_2: UUID, message: str):
        if not self.client:
            raise ValueError("GROQ_API_KEY is missing. Chat is disabled.")

        scan_1 = db.query(ScanHistory).filter(ScanHistory.id == scan_id_1).first()
        scan_2 = db.query(ScanHistory).filter(ScanHistory.id == scan_id_2).first()

        if not scan_1 or not scan_2:
            raise ValueError("One or both scans not found")
        if scan_1.user_id != user_id or scan_2.user_id != user_id:
            raise PermissionError("Forbidden: You do not own these scans")

        product_1 = db.query(Product).filter(Product.id == scan_1.product_id).first()
        product_2 = db.query(Product).filter(Product.id == scan_2.product_id).first()

        product_1_name = product_1.product_name if product_1 else "Product 1"
        product_2_name = product_2.product_name if product_2 else "Product 2"

        # Gather User Profile Context
        profile = profile_service.get_profile(db, user_id)
        
        profile_context = "No profile available."
        if profile and isinstance(profile, dict):
            prof = profile.get("profile")
            algy = profile.get("allergies")
            
            extracted_allergies = []
            if algy:
                if getattr(algy, 'milk', False): extracted_allergies.append("milk")
                if getattr(algy, 'gluten', False): extracted_allergies.append("gluten")
                if getattr(algy, 'soy', False): extracted_allergies.append("soy")
                if getattr(algy, 'nuts', False): extracted_allergies.append("nuts")
                if getattr(algy, 'eggs', False): extracted_allergies.append("eggs")
                if getattr(algy, 'seafood', False): extracted_allergies.append("seafood")
                if getattr(algy, 'sesame', False): extracted_allergies.append("sesame")
                if getattr(algy, 'shellfish', False): extracted_allergies.append("shellfish")
                if getattr(algy, 'other_allergies', None): extracted_allergies.append(getattr(algy, 'other_allergies'))
            
            profile_context = json.dumps({
                "age": getattr(prof, "age", None) if prof else None,
                "gender": getattr(prof, "gender", None) if prof else None,
                "weight": getattr(prof, "weight_kg", None) if prof else None,
                "activity_level": getattr(prof, "activity_level", None) if prof else None,
                "health_goal": getattr(prof, "health_goal", None) if prof else None,
                "diet_type": getattr(prof, "diet_type", None) if prof else None,
                "allergies": extracted_allergies
            }, indent=2)

        def format_scan(scan):
            analysis = scan.analysis_json if scan.analysis_json else {}
            extracted = scan.extracted_json if scan.extracted_json else {}
            facts = extracted.get("nutrition_facts", {})
            return {
                "product_name": scan.product_name or "Unknown Product",
                "health_score": analysis.get("score") or analysis.get("overall_score"),
                "nutrition_facts": facts,
                "ingredients": extracted.get("ingredients", []),
                "allergens": extracted.get("allergens", []),
                "processing_assessment": analysis.get("processing_assessment", "Unknown"),
                "key_findings": analysis.get("key_findings", []),
                "personalized_analysis": analysis.get("personalized_analysis", ""),
                "concerns": analysis.get("concerns", []),
                "recommendations": analysis.get("recommendations", [])
            }

        scan_1_context = format_scan(scan_1)
        scan_2_context = format_scan(scan_2)

        sys_prompt = (
            "You are Nutra AI, an expert nutrition assistant helping a user compare two products.\n"
            "Always answer based on:\n"
            "1. The user's exact message.\n"
            "2. The two scanned products.\n"
            "3. The user's health profile.\n"
            "4. The nutrition facts.\n\n"
            "CRITICAL RULES:\n"
            "- You ALREADY HAVE the nutrition facts, ingredients, and profile for both products. NEVER respond with 'I don't have the nutrition facts' or ask the user to provide them.\n"
            "- Never provide generic nutrition advice. Reference actual nutrition values whenever available.\n"
            f"USER PROFILE:\n{profile_context}\n\n"
            f"PRODUCT 1 ({product_1_name}):\n{json.dumps(scan_1_context, indent=2)}\n\n"
            f"PRODUCT 2 ({product_2_name}):\n{json.dumps(scan_2_context, indent=2)}"
        )
        
        groq_messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": message}
        ]

        async def event_generator():
            try:
                stream = await self.client.chat.completions.create(
                    model=self.model,
                    messages=groq_messages,
                    stream=True,
                    temperature=0.7,
                )
                async for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                        text = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': text})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                logger.error(f"Groq Chat Stream error: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    
        return event_generator()

    async def send_global_message_stream(self, db: Session, user_id: UUID, message: str):
        if not self.client:
            raise ValueError("Chat disabled")

        import time

        # Fetch latest scan
        latest_scan = db.query(ScanHistory).filter(ScanHistory.user_id == user_id).order_by(ScanHistory.created_at.desc()).first()
        
        async def event_generator_fallback():
            yield f"data: {json.dumps({'content': 'No analyzed products found. Please scan a product first.'})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        if not latest_scan:
            return event_generator_fallback()

        # Get profile
        profile_dict = profile_service.get_profile(db, user_id)
        prof = profile_dict.get("profile")
        algy = profile_dict.get("allergies")
        
        extracted_allergies = []
        if algy:
            for alg_key in ['milk', 'gluten', 'soy', 'nuts', 'eggs', 'seafood', 'sesame', 'shellfish']:
                if getattr(algy, alg_key, False): extracted_allergies.append(alg_key)
            if getattr(algy, 'other_allergies', None): extracted_allergies.append(getattr(algy, 'other_allergies'))
            
        profile_context = {
            "age": getattr(prof, "age", None) if prof else None,
            "gender": getattr(prof, "gender", None) if prof else None,
            "weight": getattr(prof, "weight_kg", None) if prof else None,
            "activity_level": getattr(prof, "activity_level", None) if prof else None,
            "health_goal": getattr(prof, "health_goal", None) if prof else None,
            "diet_type": getattr(prof, "diet_type", None) if prof else None,
            "allergies": extracted_allergies
        }

        analysis = latest_scan.analysis_json if latest_scan.analysis_json else {}
        extracted = latest_scan.extracted_json if latest_scan.extracted_json else {}
        facts = extracted.get("nutrition_facts", {})

        latest_product = {
            "product_name": latest_scan.product_name or "Unknown Product",
            "date_scanned": latest_scan.created_at.isoformat() if latest_scan.created_at else None
        }

        context_obj = {
            "user_profile": profile_context,
            "goal": profile_context.get("health_goal"),
            "bmi": analysis.get("bmi_status", {}).get("bmi"),
            "latest_product": latest_product,
            "nutrition_facts": facts,
            "ingredients": extracted.get("ingredients", []),
            "allergens": extracted.get("allergens", []),
            "health_score": analysis.get("overall_score") or analysis.get("score")
        }

        # Generate insights (this acts as the context)
        from app.services.insights_service import insights_service
        insights = await insights_service.generate_insights(db, user_id)
        
        # We only pass the most important parts to avoid massive tokens
        insights_context = {
            "average_health_score": insights.get("average_health_score"),
            "personalized_trends": insights.get("personalized_trends"),
            "recommendations": insights.get("recommendations")
        }

        sys_prompt = (
            "You are Calyros AI, an expert nutrition assistant.\n"
            "Always answer based on:\n"
            "1. The user's exact message.\n"
            "2. Their most recent scanned product (Latest Scan Context).\n"
            "3. Their aggregated scan history insights.\n"
            "4. Their health profile.\n\n"
            "CRITICAL RULES:\n"
            "- NEVER ask for information that already exists in the database. You already have access to their latest scan, nutrition facts, and profile.\n"
            "- Always answer using the stored scan context first.\n"
            "- If the user asks 'Can I eat this?' or 'Is this good for muscle gain?', assume they are referring to the 'latest_product' provided below.\n\n"
            f"LATEST SCAN CONTEXT:\n{json.dumps(context_obj, indent=2)}\n\n"
            f"GLOBAL INSIGHTS:\n{json.dumps(insights_context, indent=2)}"
        )
        
        groq_messages = [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": message}
        ]

        # Log
        t0 = time.time()
        logger.info(f"--- GLOBAL CHAT REQUEST ---")
        logger.info(f"User ID: {user_id}")
        logger.info(f"Latest Scan ID: {latest_scan.id}")
        logger.info(f"Product Name: {latest_product['product_name']}")
        logger.info(f"Context Size (chars): {len(sys_prompt)}")
        logger.info(f"Model Used: {self.model}")

        async def event_generator():
            try:
                stream = await self.client.chat.completions.create(
                    model=self.model,
                    messages=groq_messages,
                    stream=True,
                    temperature=0.7,
                )
                async for chunk in stream:
                    if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                        text = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'content': text})}\n\n"
                
                logger.info(f"Response Time: {(time.time() - t0)*1000:.2f}ms")
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                logger.error(f"Groq Chat Stream error: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                    
        return event_generator()

chat_service = ChatService()
